/**
 * neural-network.ts
 * Red neuronal feed-forward (perceptrón multicapa) sin dependencias externas.
 * Diseñada para neuroevolución: los pesos se pueden aplanar a un "genoma"
 * (array de números) y reconstruirse, lo que permite cruzarlos y mutarlos.
 */

export type ActivationName = 'sigmoid' | 'tanh' | 'relu' | 'leakyRelu' | 'linear';

export const ACTIVATIONS: Record<ActivationName, (x: number) => number> = {
  sigmoid: (x) => 1 / (1 + Math.exp(-x)),
  tanh: (x) => Math.tanh(x),
  relu: (x) => Math.max(0, x),
  leakyRelu: (x) => (x > 0 ? x : 0.01 * x),
  linear: (x) => x,
};

export interface NeuralNetworkOptions {
  hiddenActivation?: ActivationName;
  outputActivation?: ActivationName;
}

/** Formato serializable (para guardar el mejor cerebro en localStorage, JSON, etc.) */
export interface NeuralNetworkJSON {
  layerSizes: number[];
  hiddenActivation: ActivationName;
  outputActivation: ActivationName;
  genome: number[];
}

export class NeuralNetwork {
  readonly layerSizes: readonly number[];
  readonly hiddenActivation: ActivationName;
  readonly outputActivation: ActivationName;

  /** weights[capa][neurona][entrada]  (capa 0 = primera capa oculta) */
  private weights: number[][][] = [];
  /** biases[capa][neurona] */
  private biases: number[][] = [];

  /**
   * @param layerSizes Ej: [5, 8, 6, 2] => 5 entradas, 2 ocultas (8 y 6), 2 salidas.
   * @param options    Funciones de activación.
   * @param rng        Generador de números en [0,1). Inyectable para reproducibilidad.
   */
  constructor(
    layerSizes: number[],
    options: NeuralNetworkOptions = {},
    rng: () => number = Math.random
  ) {
    if (layerSizes.length < 2) {
      throw new Error('La red necesita al menos una capa de entrada y una de salida.');
    }
    if (layerSizes.some((n) => !Number.isInteger(n) || n < 1)) {
      throw new Error('Cada capa debe tener un número entero positivo de neuronas.');
    }

    this.layerSizes = [...layerSizes];
    this.hiddenActivation = options.hiddenActivation ?? 'tanh';
    this.outputActivation = options.outputActivation ?? 'sigmoid';

    this.randomize(rng);
  }

  // ---------------------------------------------------------------- Inicialización

  /** Inicialización Xavier/Glorot uniforme: evita saturar las activaciones al inicio. */
  randomize(rng: () => number = Math.random): void {
    this.weights = [];
    this.biases = [];

    for (let l = 1; l < this.layerSizes.length; l++) {
      const fanIn = this.layerSizes[l - 1];
      const fanOut = this.layerSizes[l];
      const limit = Math.sqrt(6 / (fanIn + fanOut));

      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];

      for (let j = 0; j < fanOut; j++) {
        const neuronWeights: number[] = [];
        for (let k = 0; k < fanIn; k++) {
          neuronWeights.push((rng() * 2 - 1) * limit);
        }
        layerWeights.push(neuronWeights);
        layerBiases.push(0);
      }

      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  // ---------------------------------------------------------------- Forward pass

  /** Propagación hacia adelante. Devuelve las activaciones de la capa de salida. */
  forward(inputs: ArrayLike<number>): number[] {
    if (inputs.length !== this.layerSizes[0]) {
      throw new Error(
        `Se esperaban ${this.layerSizes[0]} entradas y se recibieron ${inputs.length}.`
      );
    }

    let activations: ArrayLike<number> = inputs;
    const lastLayer = this.weights.length - 1;

    for (let l = 0; l <= lastLayer; l++) {
      const activate = ACTIVATIONS[l === lastLayer ? this.outputActivation : this.hiddenActivation];
      const layerWeights = this.weights[l];
      const layerBiases = this.biases[l];
      const next: number[] = new Array(layerWeights.length);

      for (let j = 0; j < layerWeights.length; j++) {
        const w = layerWeights[j];
        let sum = layerBiases[j];
        for (let k = 0; k < w.length; k++) {
          sum += w[k] * activations[k];
        }
        next[j] = activate(sum);
      }
      activations = next;
    }

    return activations as number[];
  }

  /** Alias semántico de forward(). */
  predict(inputs: ArrayLike<number>): number[] {
    return this.forward(inputs);
  }

  // ---------------------------------------------------------------- Genoma

  /** Número total de parámetros (pesos + sesgos). */
  get genomeLength(): number {
    let total = 0;
    for (let l = 1; l < this.layerSizes.length; l++) {
      total += this.layerSizes[l] * (this.layerSizes[l - 1] + 1);
    }
    return total;
  }

  /** Aplana todos los pesos y sesgos en un único array (el "ADN" del individuo). */
  getGenome(): number[] {
    const genome: number[] = [];
    for (let l = 0; l < this.weights.length; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        genome.push(...this.weights[l][j], this.biases[l][j]);
      }
    }
    return genome;
  }

  /** Reconstruye pesos y sesgos desde un genoma con el mismo orden de getGenome(). */
  setGenome(genome: ArrayLike<number>): void {
    if (genome.length !== this.genomeLength) {
      throw new Error(
        `Genoma inválido: se esperaban ${this.genomeLength} valores y llegaron ${genome.length}.`
      );
    }
    let idx = 0;
    for (let l = 0; l < this.weights.length; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        for (let k = 0; k < this.weights[l][j].length; k++) {
          this.weights[l][j][k] = genome[idx++];
        }
        this.biases[l][j] = genome[idx++];
      }
    }
  }

  // ---------------------------------------------------------------- Utilidades

  clone(): NeuralNetwork {
    const copy = new NeuralNetwork([...this.layerSizes], {
      hiddenActivation: this.hiddenActivation,
      outputActivation: this.outputActivation,
    });
    copy.setGenome(this.getGenome());
    return copy;
  }

  toJSON(): NeuralNetworkJSON {
    return {
      layerSizes: [...this.layerSizes],
      hiddenActivation: this.hiddenActivation,
      outputActivation: this.outputActivation,
      genome: this.getGenome(),
    };
  }

  static fromJSON(data: NeuralNetworkJSON): NeuralNetwork {
    const nn = new NeuralNetwork(data.layerSizes, {
      hiddenActivation: data.hiddenActivation,
      outputActivation: data.outputActivation,
    });
    nn.setGenome(data.genome);
    return nn;
  }
}

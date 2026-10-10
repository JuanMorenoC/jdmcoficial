/**
 * genetic-algorithm.ts
 * Ciclo evolutivo completo: evaluación -> selección -> cruce -> mutación -> elitismo.
 * Sin dependencias externas. Opera sobre individuos que contienen una NeuralNetwork.
 */

import { ActivationName, NeuralNetwork } from './neural-network';

// =============================================================== Utilidades aleatorias

export type Rng = () => number;

/** PRNG determinista (mulberry32). Útil para reproducir experimentos. */
export function createSeededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal estándar N(0,1) mediante Box-Muller. */
export function gaussian(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// =============================================================== Tipos

export interface Individual {
  brain: NeuralNetwork;
  /** Asignado por el juego/simulación tras evaluar al individuo. */
  fitness: number;
}

export type SelectionMethod = 'tournament' | 'roulette';
export type CrossoverMethod = 'uniform' | 'singlePoint' | 'arithmetic';

export interface GeneticAlgorithmConfig {
  populationSize: number;
  layerSizes: number[];
  hiddenActivation?: ActivationName;
  outputActivation?: ActivationName;

  selection: SelectionMethod;
  /** Participantes por torneo (solo 'tournament'). */
  tournamentSize: number;
  crossover: CrossoverMethod;
  /** Probabilidad de que dos padres se crucen (si no, el hijo copia al padre A). */
  crossoverRate: number;

  /** Probabilidad de mutar cada gen. */
  mutationRate: number;
  /** Desviación estándar del ruido gaussiano aplicado al gen mutado. */
  mutationStrength: number;

  /** Mejores individuos que pasan intactos a la siguiente generación. */
  eliteCount: number;
  rng?: Rng;
}

export const DEFAULT_GA_CONFIG: Omit<GeneticAlgorithmConfig, 'layerSizes'> = {
  populationSize: 100,
  selection: 'tournament',
  tournamentSize: 5,
  crossover: 'uniform',
  crossoverRate: 0.9,
  mutationRate: 0.05,
  mutationStrength: 0.3,
  eliteCount: 2,
};

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  averageFitness: number;
  worstFitness: number;
}

// =============================================================== Operadores de selección

/** Elige k individuos al azar y devuelve el mejor. */
export function tournamentSelection(
  population: Individual[],
  tournamentSize: number,
  rng: Rng
): Individual {
  let best = population[Math.floor(rng() * population.length)];
  for (let i = 1; i < tournamentSize; i++) {
    const challenger = population[Math.floor(rng() * population.length)];
    if (challenger.fitness > best.fitness) best = challenger;
  }
  return best;
}

/**
 * Ruleta proporcional al fitness. Desplaza los valores para soportar fitness
 * negativos y evita probabilidad 0 para el peor individuo.
 */
export function rouletteSelection(population: Individual[], rng: Rng): Individual {
  let min = Infinity;
  for (const ind of population) if (ind.fitness < min) min = ind.fitness;

  const eps = 1e-9;
  let total = 0;
  for (const ind of population) total += ind.fitness - min + eps;

  let spin = rng() * total;
  for (const ind of population) {
    spin -= ind.fitness - min + eps;
    if (spin <= 0) return ind;
  }
  return population[population.length - 1];
}

// =============================================================== Operadores de cruce

/** Cada gen se hereda de A o B con probabilidad 50%. */
export function uniformCrossover(a: number[], b: number[], rng: Rng): number[] {
  return a.map((gene, i) => (rng() < 0.5 ? gene : b[i]));
}

/** Un punto de corte: genes [0, p) de A y [p, n) de B. */
export function singlePointCrossover(a: number[], b: number[], rng: Rng): number[] {
  const point = Math.floor(rng() * a.length);
  return a.map((gene, i) => (i < point ? gene : b[i]));
}

/** Combinación lineal con peso aleatorio por gen (cruce aritmético / blend). */
export function arithmeticCrossover(a: number[], b: number[], rng: Rng): number[] {
  return a.map((gene, i) => {
    const alpha = rng();
    return alpha * gene + (1 - alpha) * b[i];
  });
}

// =============================================================== Operador de mutación

/** Mutación gaussiana: cada gen muta con probabilidad `rate` sumándole ruido N(0, strength). */
export function gaussianMutation(
  genome: number[],
  rate: number,
  strength: number,
  rng: Rng
): number[] {
  return genome.map((gene) => (rng() < rate ? gene + gaussian(rng) * strength : gene));
}

// =============================================================== Ciclo evolutivo

export class GeneticAlgorithm {
  population: Individual[] = [];
  generation = 1;
  readonly history: GenerationStats[] = [];

  private readonly config: GeneticAlgorithmConfig;
  private readonly rng: Rng;

  constructor(config: Partial<GeneticAlgorithmConfig> & { layerSizes: number[] }) {
    this.config = { ...DEFAULT_GA_CONFIG, ...config };
    this.rng = this.config.rng ?? Math.random;

    if (this.config.eliteCount >= this.config.populationSize) {
      throw new Error('eliteCount debe ser menor que populationSize.');
    }
    this.population = this.createInitialPopulation();
  }

  /** Mejor individuo de la generación actual (según el fitness asignado). */
  get best(): Individual {
    return this.population.reduce((a, b) => (b.fitness > a.fitness ? b : a));
  }

  /** Estadísticas de la generación actual (llamar después de asignar fitness). */
  getStats(): GenerationStats {
    let best = -Infinity, worst = Infinity, sum = 0;
    for (const { fitness } of this.population) {
      if (fitness > best) best = fitness;
      if (fitness < worst) worst = fitness;
      sum += fitness;
    }
    return {
      generation: this.generation,
      bestFitness: best,
      averageFitness: sum / this.population.length,
      worstFitness: worst,
    };
  }

  /**
   * Avanza una generación. Antes de llamarlo, el juego debe haber asignado
   * `individual.fitness` a cada miembro de `population`.
   */
  evolve(): GenerationStats {
    const stats = this.getStats();
    this.history.push(stats);

    const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
    const next: Individual[] = [];

    // 1) Elitismo: los mejores pasan sin cambios.
    for (let i = 0; i < this.config.eliteCount; i++) {
      next.push({ brain: sorted[i].brain.clone(), fitness: 0 });
    }

    // 2) Selección + cruce + mutación hasta completar la población.
    while (next.length < this.config.populationSize) {
      const parentA = this.select(sorted);
      const parentB = this.select(sorted);

      const genomeA = parentA.brain.getGenome();
      const genomeB = parentB.brain.getGenome();

      let childGenome =
        this.rng() < this.config.crossoverRate
          ? this.crossover(genomeA, genomeB)
          : genomeA;

      childGenome = gaussianMutation(
        childGenome,
        this.config.mutationRate,
        this.config.mutationStrength,
        this.rng
      );

      const brain = this.createBrain();
      brain.setGenome(childGenome);
      next.push({ brain, fitness: 0 });
    }

    this.population = next;
    this.generation++;
    return stats;
  }

  // ---------------------------------------------------------------- Internos

  private createBrain(): NeuralNetwork {
    return new NeuralNetwork(
      this.config.layerSizes,
      {
        hiddenActivation: this.config.hiddenActivation,
        outputActivation: this.config.outputActivation,
      },
      this.rng
    );
  }

  private createInitialPopulation(): Individual[] {
    return Array.from({ length: this.config.populationSize }, () => ({
      brain: this.createBrain(),
      fitness: 0,
    }));
  }

  private select(pool: Individual[]): Individual {
    return this.config.selection === 'roulette'
      ? rouletteSelection(pool, this.rng)
      : tournamentSelection(pool, this.config.tournamentSize, this.rng);
  }

  private crossover(a: number[], b: number[]): number[] {
    switch (this.config.crossover) {
      case 'singlePoint':
        return singlePointCrossover(a, b, this.rng);
      case 'arithmetic':
        return arithmeticCrossover(a, b, this.rng);
      default:
        return uniformCrossover(a, b, this.rng);
    }
  }
}

/**
 * Ejemplo de integración en Angular (standalone component).
 * Evoluciona una población para aprender XOR; sustituye `evaluate()` por la
 * simulación de tu juego (el fitness es lo único que debes calcular).
 *
 * La simulación corre fuera de la zona de Angular para no disparar detección
 * de cambios en cada generación; solo se re-entra para actualizar la vista.
 */
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { GeneticAlgorithm, GenerationStats, Individual } from './genetic-algorithm';

const MAX_FITNESS = 4; // fitness perfecto en el ejemplo XOR (4 - error)

@Component({
  selector: 'app-neuroevolution',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './neuroevolution.component.html',
  styleUrls: ['./neuroevolution.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeuroevolutionComponent implements OnDestroy {
  stats?: GenerationStats;
  running = false;

  private ga = this.createGA();
  private frameId = 0;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {}

  /** Porcentaje (0-100) del mejor fitness respecto al máximo posible. */
  get progress(): number {
    if (!this.stats) return 0;
    return Math.max(0, Math.min(100, (this.stats.bestFitness / MAX_FITNESS) * 100));
  }

  start(): void {
    this.running = true;
    this.zone.runOutsideAngular(() => this.loop());
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    this.cdr.markForCheck();
  }

  reset(): void {
    this.stop();
    this.ga = this.createGA();
    this.stats = undefined;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  // ---------------------------------------------------------------- Internos

  private createGA(): GeneticAlgorithm {
    return new GeneticAlgorithm({
      layerSizes: [2, 4, 1],      // entradas, oculta, salida
      populationSize: 150,
      selection: 'tournament',    // o 'roulette'
      crossover: 'uniform',
      mutationRate: 0.05,
      mutationStrength: 0.3,
      eliteCount: 2,
    });
  }

  private loop = (): void => {
    if (!this.running) return;

    this.ga.population.forEach((ind) => (ind.fitness = this.evaluate(ind)));
    this.stats = this.ga.getStats();
    this.ga.evolve();

    // Actualiza la UI cada 5 generaciones dentro de la zona.
    if (this.stats.generation % 5 === 0) {
      this.zone.run(() => this.cdr.markForCheck());
    }
    this.frameId = requestAnimationFrame(this.loop);
  };

  /** Sustituir por la simulación del juego: devuelve cuánto "mejor" lo hizo el individuo. */
  private evaluate(ind: Individual): number {
    const cases = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
    let error = 0;
    for (const [a, b, target] of cases) {
      error += (ind.brain.predict([a, b])[0] - target) ** 2;
    }
    return MAX_FITNESS - error;
  }
}
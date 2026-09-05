import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ResumenSegmento {
  Segmento_KM: string;
  total_clientes: number;
  recencia_promedio: number;
  frecuencia_promedio: number;
  monetario_promedio: number;
  monetario_total: number;
}

export interface ClienteMuestra {
  CustomerID: number;
  Recency: number;
  Frequency: number;
  Monetary: number;
  Segmento_KM: string;
}

@Component({
  selector: 'app-segmentacion-rfm',
  templateUrl: './segmentacion-rfm.component.html',
  styleUrls: ['./segmentacion-rfm.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class SegmentacionRfmComponent implements OnInit {
  resumen: ResumenSegmento[] = [];
  muestra: ClienteMuestra[] = [];
  filtroTexto: string = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<ResumenSegmento[]>('assets/data/resumen_segmentos.json')
      .subscribe({
        next: (data) => {
          this.resumen = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando resumen:', err)
      });

    this.http.get<ClienteMuestra[]>('assets/data/muestra_rfm.json')
      .subscribe({
        next: (data) => {
          this.muestra = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando muestra:', err)
      });
  }

  get muestraFiltrada(): ClienteMuestra[] {
    if (!this.filtroTexto) return this.muestra;
    const term = this.filtroTexto.toLowerCase();
    return this.muestra.filter(c =>
      c.CustomerID.toString().includes(term) ||
      (c.Segmento_KM && c.Segmento_KM.toLowerCase().includes(term))
    );
  }
}
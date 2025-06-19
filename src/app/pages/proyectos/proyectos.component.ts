import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Proyecto {
  nombre: string;
  descripcion: string;
  tecnologias: string[];
  repositorio: string;
  demo?: string;
}

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProyectosComponent {
  proyectos: Proyecto[] = [
    {
      nombre: 'ReactTrace',
      descripcion: 'Sistema para trazabilidad y gestión de reactivos de laboratorio.',
      tecnologias: ['Python', 'Flask', 'PostgreSQL', 'React'],
      repositorio: 'https://github.com/jdmcoficial/reacttrace'
    },
    {
      nombre: 'APPIS',
      descripcion: 'Sistema de evaluación de calidad de miel y trazabilidad apícola.',
      tecnologias: ['Spring Boot', 'MongoDB', 'React', 'Structurizr'],
      repositorio: 'https://github.com/jdmcoficial/appis'
    }
  ];
}

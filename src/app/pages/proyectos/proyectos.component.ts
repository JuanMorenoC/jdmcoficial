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
      nombre: 'Clinica Dental Alameda (Frontend)',
      descripcion: 'Sistema para trazabilidad y gestión de citas de odontología de la clinica',
      tecnologias: ['Angular', 'Angular Material'],
      repositorio: 'https://github.com/JuanMorenoC/clinica-dental-alameda-front'
    },
    {
      nombre: 'Clinica Dental Alameda (Backend)',
      descripcion: 'Sistema para trazabilidad y gestión de citas de odontología de la clinica',
      tecnologias: ['Spring Boot', 'MySQL'],
      repositorio: 'https://github.com/JuanMorenoC/clinica-alameda-backend'
    }
  ];
}

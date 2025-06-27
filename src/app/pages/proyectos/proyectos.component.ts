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
      nombre: 'APLICACIÓN DE TÉCNICAS DE MINERÍA DE DATOS PARA ANALIZAR EL DESEMPEÑO ACADÉMICO DE LAS PRUEBAS SABER DE 5° DE 2017 EN COLOMBIA, EN LAS ÁREAS DE MATEMÁTICAS Y LENGUAJE',
      descripcion: 'En este proyecto se utilizan técnicas de minería de datos para examinar las calificaciones obtenidas en las pruebas saber 5° presentadas por los estudiantes de diferentes instituciones educativas a nivel nacional en el año 2017, con el propósito de detectar información valiosa, tendencias y patrones. Se analizan los datos tanto socioeconómicos, personales y de los establecimientos educativos de cada estudiante, con el objetivo de generar diferentes modelos predictivos que se comparan entre sí para obtener el que tiene mejor performance. Para el desarrollo de este proyecto se usa la metodología CRISP-DM, que permite el tratamiento de los datos a través de un análisis óptimo de la información. Este trabajo puede servir como base para futuros estudios que requieran la información aquí consolidada; además, se espera contribuir a instituciones y entidades educativas en el mejoramiento de la calidad de educación de los estudiantes que presenten las pruebas Saber 5°.',
      tecnologias: ['CRISP-DM', 'Excel', 'Mineria de datos'],
      repositorio: ''
    },
    {
      nombre: 'FORMULACIÓN DE UN MARCO METODOLÓGICO ÁGIL PARA APLICACIONES BASADAS EN MICROSERVICIOS: UN ENFOQUE ORIENTADO A UNA EMPRESA DE BOGOTÁ, COLOMBIA.',
      descripcion: 'Este trabajo de profundización propone el desarrollo de un marco metodológico ágil diseñado específicamente para gestionar de manera eficiente proyectos basados en microservicios en una empresa de software ubicada en Bogotá, Colombia. Como parte del enfoque metodológico, se llevó a cabo un estudio de caso que permitió identificar las necesidades organizacionales y seleccionar prácticas clave para el desarrollo de software. Usando la metodología de Ciencia Basada en el Diseño y una revisión de la literatura, se definieron cuatro áreas fundamentales: prácticas de desarrollo, artefactos, planificación de sprints y flujo de trabajo. Estas prácticas se integraron en el marco metodológico, adaptándolas al contexto local. La viabilidad del marco fue evaluada mediante la implementación de dos microservicios que interactúan entre sí y con el sistema principal de la empresa, lo que permitió analizar su efectividad en un entorno real. Los resultados obtenidos, validados con la participación del equipo de desarrollo, respaldan las hipótesis sobre su capacidad para mejorar la eficiencia y calidad en el desarrollo de proyectos basados en microservicios. Este marco metodológico ofrece una guía práctica para empresas interesadas en adoptar esta arquitectura, brindando una solución adaptada a contextos similares.',
      tecnologias: ['SCRUM', 'XP', 'Arquitectura basada en microservicios', 'Metodologias agiles'],
      repositorio: ''
    },
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

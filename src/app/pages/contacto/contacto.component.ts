import { Component } from '@angular/core';
import emailjs from '@emailjs/browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ContactoComponent {
  constructor(private snackBar: MatSnackBar) { }

  enviarCorreo(form: any) {
    if (form.invalid) {
      this.snackBar.open('Por favor completa todos los campos correctamente.', 'Cerrar', { duration: 4000 });
      return;
    }

    emailjs.send(
      environment.emailjs.serviceID,
      environment.emailjs.templateID,
      form.value,
      environment.emailjs.publicKey
    )
      .then(() => {
        this.snackBar.open('¡Mensaje enviado con éxito!', 'Cerrar', { duration: 4000 });
        form.resetForm();
      })
      .catch((error) => {
        this.snackBar.open('Error al enviar el mensaje. Intenta más tarde.', 'Cerrar', { duration: 5000 });
        console.error('EmailJS error:', error);
      });
  }
}

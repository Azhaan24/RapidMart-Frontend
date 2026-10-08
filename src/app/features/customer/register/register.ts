import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword ='';
  phoneNumber = '';

  isRegistering = false;

  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  registrationSuccessful = false;


  register(): void {

    this.alertMessage = '';
    this.registrationSuccessful = false;

    if (
      !this.firstName ||
      !this.lastName ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.showError('Please fill in all required fields.');
      return;
    }

    this.isRegistering = true;

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber,
      confirmPassword: this.confirmPassword
    }).subscribe({

      next: (response) => {

        console.log('Registration successful:', response);

        this.isRegistering = false;

        this.showSuccess(
          'Registration successful! You can now login to your account.'
        );

        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
        this.phoneNumber = '';
      },

      error: (error) => {

        console.error('Registration error:', error);

        this.isRegistering = false;

        const message =
          error?.error?.message ||
          'Registration failed. Please try again.';

        this.showError(message);
      }
    });
  }


  private showSuccess(message: string): void {

    this.alertType = 'success';
    this.alertMessage = message;
  }


  private showError(message: string): void {

    this.alertType = 'error';
    this.alertMessage = message;
  }


  goToLogin(): void {

    this.router.navigate(['/profile']);

  }
}
import { Component,inject,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  email = signal('');

  isSubmitting = signal(false);

  errorMessage = signal('');

  successMessage = signal('');


  submit(): void {

    const email = this.email().trim();

    if (!email) {

      this.errorMessage.set('Please enter your email address.');

      return;
    }


    this.isSubmitting.set(true);

    this.errorMessage.set('');

    this.successMessage.set('');


    this.authService
      .forgotPassword({
        email
      })
      .subscribe({

        next: (response) => {

          this.isSubmitting.set(false);

          this.router.navigate(
            ['/reset-password'],
            {
              state: {
                email,
                token: response.token
              }
            }
          );
        },

        error: (error) => {

          console.error(
            'Forgot password error:',
            error
          );

          this.isSubmitting.set(false);

          this.errorMessage.set(
            
            'Unable to generate a password reset request.'
          );
        }

      });
  }


  goToLogin(): void {

    this.router.navigate([
      '/profile'
    ]);
  }
}
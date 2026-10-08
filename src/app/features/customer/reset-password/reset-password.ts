import { Component,inject,OnInit,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  email = signal('');

  token = signal('');

  newPassword = signal('');

  confirmPassword = signal('');


  isSubmitting =
    signal(false);

  errorMessage =
    signal('');

  successMessage =
    signal('');


  ngOnInit(): void {

    const navigation = this.router.currentNavigation();

    const state = navigation?.extras?.state;

    if (state?.['email'] && state?.['token']) {

      this.email.set(
        state['email']
      );

      this.token.set(
        state['token']
      );

      return;
    }

  
    const historyState = history.state;


    if (historyState?.email && historyState?.token) {

      this.email.set(
        historyState.email
      );

      this.token.set(
        historyState.token
      );

      return;
    }


    this.errorMessage.set(
      'This password reset request is invalid or has expired.'
    );
  }


  submit(): void {

    this.errorMessage.set('');

    this.successMessage.set('');


    const newPassword =
      this.newPassword();

    const confirmPassword =
      this.confirmPassword();


    if (!newPassword || !confirmPassword) {

      this.errorMessage.set(
        'Please enter and confirm your new password.'
      );

      return;
    }


    if (newPassword !== confirmPassword) {

      this.errorMessage.set(
        'Passwords do not match.'
      );

      return;
    }


    if (!this.email() || !this.token()) {

      this.errorMessage.set(
        'This password reset request is invalid.'
      );

      return;
    }


    this.isSubmitting.set(true);


    this.authService
      .resetPassword({
        email: this.email(),
        token: this.token(),
        newPassword,
        confirmPassword
      })
      .subscribe({

        next: (response) => {

          this.isSubmitting.set(false);

          this.successMessage.set(
            response.message ||
            'Password reset successfully.'
          );

          setTimeout(() => {

            this.router.navigate([
              '/profile'
            ]);

          }, 1200);
        },

        error: (error) => {

          console.error(
            'Reset password error:',
            error
          );

          this.isSubmitting.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to reset your password.'
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
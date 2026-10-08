import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { AccountService,UpdateAccountRequest,ChangePasswordRequest } from '../../../core/services/account.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  private readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);


  isLoggedIn = signal(false);

  user = signal<any | null>(null);

  role = signal('');


  isLoading = signal(false);

  errorMessage = signal('');

  isEditingProfile = signal(false);

  isUpdatingProfile = signal(false);

  profileUpdateMessage = signal('');

  profileUpdateError = signal('');

  editFirstName = signal('');

  editLastName = signal('');

  showChangePassword = signal(false);

  isChangingPassword = signal(false);

  passwordMessage = signal('');

  passwordError = signal('');

  currentPassword = signal('');

  newPassword = signal('');

  confirmNewPassword = signal('');

  showLoginPopup = signal(false);

  email = signal('');

  password = signal('');

  isLoggingIn = signal(false);

  loginError = signal('');



  ngOnInit(): void {

    const loggedIn =
      this.authService.isLoggedIn();

    this.isLoggedIn.set(loggedIn);


    if (!loggedIn) {

      this.showLoginPopup.set(true);

      return;
    }


    this.loadProfile();
  }

  private loadProfile(): void {

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.authService
      .getCurrentUser()
      .subscribe({

        next: (user) => {

          console.log(
            'Current user:',
            user
          );

          this.user.set(user);


          const currentRole =
            user?.roles?.[0] ||
            user?.role ||
            'Customer';

          this.role.set(currentRole);

          this.isLoading.set(false);
        },


        error: (error) => {

          console.error(
            'Error loading current user:',
            error
          );

          this.isLoading.set(false);


          if (error.status === 401) {

            this.isLoggedIn.set(false);

            this.user.set(null);

            this.role.set('');

            this.showLoginPopup.set(true);

            return;
          }


          this.errorMessage.set(
            error?.error?.message ||
            'Unable to load your account details.'
          );

        }

      });
  }


  startEditingProfile(): void {

    const currentUser =
      this.user();

    if (!currentUser) {
      return;
    }


    const fullName =
      (currentUser.fullName || '').trim();

    const nameParts =
      fullName.split(/\s+/);


    const firstName =
      nameParts.shift() || '';

    const lastName =
      nameParts.join(' ');


    this.editFirstName.set(
      firstName
    );

    this.editLastName.set(
      lastName
    );


    this.profileUpdateMessage.set('');

    this.profileUpdateError.set('');

    this.isEditingProfile.set(true);
  }


  cancelEditingProfile(): void {

    this.isEditingProfile.set(false);

    this.profileUpdateMessage.set('');

    this.profileUpdateError.set('');
  }


  updateProfile(): void {

    const firstName =
      this.editFirstName().trim();

    const lastName =
      this.editLastName().trim();


    if (!firstName) {

      this.profileUpdateError.set(
        'First name is required.'
      );

      return;
    }


    if (!lastName) {

      this.profileUpdateError.set(
        'Last name is required.'
      );

      return;
    }


    this.isUpdatingProfile.set(true);

    this.profileUpdateMessage.set('');

    this.profileUpdateError.set('');


    const request: UpdateAccountRequest = {

      firstName,

      lastName

    };


    this.accountService
      .updateMyAccount(request)
      .subscribe({

        next: (updatedUser) => {

          console.log(
            'Profile updated:',
            updatedUser
          );


          this.user.set(
            updatedUser
          );


          const currentRole =
            updatedUser?.roles?.[0] ||
            updatedUser?.role ||
            this.role();

          this.role.set(
            currentRole
          );


          this.isUpdatingProfile.set(false);

          this.isEditingProfile.set(false);

          this.profileUpdateMessage.set(
            'Your profile has been updated successfully.'
          );
        },


        error: (error) => {

          console.error(
            'Profile update error:',
            error
          );


          this.isUpdatingProfile.set(false);


          this.profileUpdateError.set(
            error?.error?.message ||
            'Unable to update your profile. Please try again.'
          );
        }

      });
  }


  toggleChangePassword(): void {

    this.showChangePassword.update(
      value => !value
    );


    this.passwordMessage.set('');

    this.passwordError.set('');
  }


  cancelChangePassword(): void {

    this.showChangePassword.set(false);

    this.passwordMessage.set('');

    this.passwordError.set('');

    this.currentPassword.set('');

    this.newPassword.set('');

    this.confirmNewPassword.set('');
  }


  changePassword(): void {

    const currentPassword =
      this.currentPassword();

    const newPassword =
      this.newPassword();

    const confirmNewPassword =
      this.confirmNewPassword();


    if (
      !currentPassword ||
      !newPassword ||
      !confirmNewPassword
    ) {

      this.passwordError.set(
        'Please fill in all password fields.'
      );

      return;
    }


    if (newPassword.length < 6) {

      this.passwordError.set(
        'New password must be at least 6 characters long.'
      );

      return;
    }


    if (
      newPassword !==
      confirmNewPassword
    ) {

      this.passwordError.set(
        'New password and confirm password do not match.'
      );

      return;
    }


    this.isChangingPassword.set(true);

    this.passwordMessage.set('');

    this.passwordError.set('');


    const request: ChangePasswordRequest = {

      currentPassword,

      newPassword,

      confirmNewPassword

    };


    this.accountService
      .changePassword(request)
      .subscribe({

        next: (response) => {

          console.log(
            'Password changed:',
            response
          );


          this.isChangingPassword.set(false);

          this.passwordMessage.set(
            response?.message ||
            'Password changed successfully.'
          );


          this.currentPassword.set('');

          this.newPassword.set('');

          this.confirmNewPassword.set('');
        },


        error: (error) => {

          console.error(
            'Change password error:',
            error
          );


          this.isChangingPassword.set(false);


          this.passwordError.set(
            error?.error?.message ||
            'Unable to change your password. Please try again.'
          );
        }

      });
  }

  openLoginPopup(): void {

    this.showLoginPopup.set(true);

    this.loginError.set('');
  }


  closeLoginPopup(): void {

    this.showLoginPopup.set(false);

    this.loginError.set('');
  }

  login(): void {

    const email =
      this.email().trim();

    const password =
      this.password();


    if (!email || !password) {

      this.loginError.set(
        'Please enter email and password.'
      );

      return;
    }


    this.isLoggingIn.set(true);

    this.loginError.set('');


    this.authService
      .login({
        email,
        password
      })
      .subscribe({

        next: (response) => {

          console.log(
            'Login response:',
            response
          );


          this.authService.saveToken(
            response.token
          );


          this.isLoggedIn.set(true);

          this.showLoginPopup.set(false);

          this.isLoggingIn.set(false);


          this.loadProfile();
        },


        error: (error) => {

          console.error(
            'Login error:',
            error
          );


          this.isLoggingIn.set(false);


          this.loginError.set(
            error?.error?.message ||
            'Invalid email or password.'
          );

        }

      });
  }


  goToRegister(): void {

    this.showLoginPopup.set(false);

    this.router.navigate([
      '/register'
    ]);
  }


  logout(): void {

    this.authService.logout();

    this.cartService.clearLocalCart();

    this.isLoggedIn.set(false);

    this.user.set(null);

    this.role.set('');

    this.router.navigate(['/']);
  }


  goToDashboard(): void {

    const currentRole =
      this.role().toLowerCase();


    switch (currentRole) {

      case 'admin':

        this.router.navigate([
          '/admin/dashboard'
        ]);

        break;


      case 'manager':

        this.router.navigate([
          '/manager/dashboard'
        ]);

        break;


      case 'salesstaff':

        this.router.navigate([
          '/sales/dashboard'
        ]);

        break;


      default:

        break;
    }
  }

  goToForgotPassword(): void {
  this.showLoginPopup.set(false);
  this.router.navigate(['/forgot-password']);
}


  isEmployeeRole(): boolean {

    const currentRole =
      this.role().toLowerCase();


    return (
      currentRole === 'admin' ||
      currentRole === 'manager' ||
      currentRole === 'salesstaff'
    );
  }


  

}
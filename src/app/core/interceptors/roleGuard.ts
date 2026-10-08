import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'];

  const token = authService.getToken();

  if (!token) {
    return router.createUrlTree(['/profile']);
  }

  try {

    const payload = JSON.parse(atob(token.split('.')[1]));

    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'];

    if (role === requiredRole) {
      return true;
    }

    return router.createUrlTree(['/profile']);

  } catch {

    return router.createUrlTree(['/profile']);
  }
};
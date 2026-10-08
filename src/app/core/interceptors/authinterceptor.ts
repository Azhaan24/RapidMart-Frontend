import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  const token = localStorage.getItem('rapidmart_token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(

    catchError((error) => {

      if (error.status === 401 && token) {

        console.log('Session expired. Logging out user.');

        localStorage.removeItem('rapidmart_token');

        router.navigate(['/profile']);
      }

      return throwError(() => error);
    })

  );
};
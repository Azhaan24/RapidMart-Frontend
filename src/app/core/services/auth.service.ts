import { Injectable,inject,signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationSignalRService } from './notification-signalr.service';


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly notificationSignalR = inject(NotificationSignalRService);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly tokenKey = 'rapidmart_token';


  readonly loggedIn =
    signal<boolean>(
      this.getToken() !== null
    );


  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`,request).pipe(

      tap(response => {

        this.saveToken(response.token);

        this.loggedIn.set(true);

        this.notificationSignalR.connect();

      })

    );
  }


  saveToken(token: string): void {

    localStorage.setItem(this.tokenKey,token);
  }


  getToken(): string | null {

    return localStorage.getItem(this.tokenKey);
  }


  isLoggedIn(): boolean {

    return this.getToken() !== null;
  }


  logout(): void {

    this.notificationSignalR.disconnect();

    localStorage.removeItem(this.tokenKey);

    this.loggedIn.set(false);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/Auth/forgot-password`,request);
  }
  
  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    
    return this.http.post<{ message: string }>(`${this.apiUrl}/Auth/reset-password`,request);
  }


  getCurrentUser(): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/account/me`);
  }


  register(request: RegisterRequest): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/Auth/register`,request);
  }
}
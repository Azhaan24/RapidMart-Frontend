import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UpdateAccountRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/account`;

  updateMyAccount(request: UpdateAccountRequest): Observable<any> {

    return this.http.put<any>(`${this.apiUrl}/me`,request);
  }


  changePassword(request: ChangePasswordRequest): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/change-password`,request);
  }

}
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult } from './order.service';

export interface AdminUser {
  userId: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
}

export interface ChangeUserRoleRequest {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/admin/users`;

  getUsers(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<AdminUser>> {

    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);
    return this.http.get<PagedResult<AdminUser>>(this.apiUrl,{params});
  }

  getUsersToCreate(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<AdminUser>> {

    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);
    return this.http.get<PagedResult<AdminUser>>(`${this.apiUrl}/create`,{params});
  }

  getUser(userId: string): Observable<AdminUser> {
    
    return this.http.get<AdminUser>(`${this.apiUrl}/${userId}`);
  }

  changeRole(userId: string,role: string): Observable<AdminUser> {

    const request: ChangeUserRoleRequest = {
      role: role
    };

    return this.http.put<AdminUser>(`${this.apiUrl}/${userId}/role`,request);
  }

  removeRole(userId: string, role: string): Observable<AdminUser> {

    return this.http.delete<AdminUser>(`${this.apiUrl}/${userId}/roles/${role}`);
  }
}
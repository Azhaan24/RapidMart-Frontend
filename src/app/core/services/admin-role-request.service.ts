import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult } from './order.service';

export interface RoleRequest {
  id: number;
  userId: string;
  requestedRole: string;
  status: string | number;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedByUserId?: string | null;
  adminNotes?: string | null;
}

export interface ReviewRoleRequest {
  adminNotes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminRoleRequestService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/RoleRequest`;

  getPendingRequests(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<RoleRequest>> {
    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);

    return this.http.get<PagedResult<RoleRequest>>(`${this.apiUrl}/pending`,{params});
  }

  approveRequest(id: number,adminNotes?: string): Observable<RoleRequest> {

    const request: ReviewRoleRequest = {adminNotes: adminNotes || ''};

    return this.http.post<RoleRequest>(`${this.apiUrl}/${id}/approve`,request);
  }

  rejectRequest(id: number,adminNotes?: string): Observable<RoleRequest> {

    const request: ReviewRoleRequest = {adminNotes: adminNotes || ''};

    return this.http.post<RoleRequest>(`${this.apiUrl}/${id}/reject`,request);
  }
}
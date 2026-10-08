import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StaffWorkload {
  staffId: string;
  staffName: string;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;

  totalOrders: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStaffWorkloadService {

  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl + '/order';

  getStaffWorkload(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<StaffWorkload>> {

    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);

    return this.http.get<PagedResult<StaffWorkload>>(`${this.apiUrl}/staff-workload`,{ params });
  }
}
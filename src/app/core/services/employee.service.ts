import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult } from './order.service';
import { SortType } from '../models/sortType';


export interface EmployeeProfile {

  id: number;

  userId: string;

  employeeCode: string;

  department: string;

  joiningDate: string;

  designation?: string | null;

  isActive: boolean;

  email?: string | null;

  fullName?: string | null;
}

export interface CreateEmployeeProfileRequest {

  firstName: string;

  lastName: string;

  email: string;

  password: string;

  confirmPassword: string;

  employeeCode: string;

  department: string;

  joiningDate: string;

  designation?: string;

  phoneNumber?: string;

  address?: string;

  role: string;
}

export interface UpdateEmployeeProfileRequest {

  employeeCode: string;

  department: string;

  joiningDate: string;

  designation?: string;

  phoneNumber?: string;

  address?: string;
}


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Employee`;

  getEmployees(pageNumber: number = 1,pageSize: number = 10,sortBy: SortType = SortType.alphabeticalAsc, active: boolean | null, search: string): Observable<PagedResult<EmployeeProfile>> {

    let params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize).set('sortBy',sortBy);

    if(active !== null){
      params = params.set('active',active);
    }
    if(search !== null){
      params = params.set('search',search);
    }

    return this.http.get<PagedResult<EmployeeProfile>>(
      this.apiUrl,{params}
    );
  }

  getSalesStaff(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<EmployeeProfile>> {
    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize)

    return this.http.get<PagedResult<EmployeeProfile>>(`${this.apiUrl}/sales-staff`,{params});
  }

  getEmployeeById(id: number): Observable<EmployeeProfile> {

    return this.http.get<EmployeeProfile>(`${this.apiUrl}/admin/${id}`);
  }

  getEmployeeByUserId(userId: string): Observable<EmployeeProfile> {

    return this.http.get<EmployeeProfile>(`${this.apiUrl}/user/${userId}`);
  }

  createEmployee(request: CreateEmployeeProfileRequest): Observable<EmployeeProfile> {

    return this.http.post<EmployeeProfile>(this.apiUrl,request);
  }

  updateEmployee(id: number,request: UpdateEmployeeProfileRequest): Observable<EmployeeProfile> {

    return this.http.put<EmployeeProfile>(`${this.apiUrl}/${id}`,request);
  }

  deactivateEmployee(id: number): Observable<any> {

    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`,{});
  }

  activateEmployee(id: number): Observable<any> {

    return this.http.put<any>(`${this.apiUrl}/${id}/activate`,{});
  }
}
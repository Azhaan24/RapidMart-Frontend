import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { OrderStatus, PaymentStatus } from './order.service';

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ReturnItemRequest {
  orderItemId: number;
  quantity: number;
}

export interface CreateReturnRequest {
  orderId: number;
  items: ReturnItemRequest[];
  reason: string;
}

export interface ReturnRequestItem {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  reason: string;
}

export interface Refund {
  id: number;
  amount: number;
  status: number;
  transactionReference?: string | null;
  processedAt?: string | null;
}

export interface ReturnRequest {
  id: number;
  orderId: number;
  productId: number;
  productName?: string | null;
  customerId: string;
  reason: string;
  status: number;
  requestedAt: string;
  reviewedAt?: string | null;
  receivedAt?: string | null;
  restockable: boolean;
  managerNotes?: string | null;
  returnedItem: ReturnRequestItem;
  items: ReturnRequestItem[];
  refund?: Refund | null;
}

export interface ReturnResponse {
  id: number;
  orderId: number;
  customerId: string;
  reason: string;
  status: number;
  requestedAt: string;
  reviewedAt?: string | null;
  receivedAt?: string | null;
  restockable: boolean;
  managerNotes?: string | null;
  refund?: Refund | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReturnService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Return`;

  createReturnRequest(request: CreateReturnRequest): Observable<ReturnRequest> {

    return this.http.post<ReturnRequest>(this.apiUrl,request);
  }

  getMyReturns(): Observable<PagedResult<ReturnRequest>> {

    return this.http.get<PagedResult<ReturnRequest>>(`${this.apiUrl}/my`);
  }

  getAllReturns(pageNumber: number =1,pageSize: number =10,status: number | null): Observable<PagedResult<ReturnRequest>> {

    let params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);

    if(status !==null){
      params = params.set('status',status);
    }

    return this.http.get<PagedResult<ReturnRequest>>(`${this.apiUrl}`,{params});
  }

  getReturnById(id: number): Observable<ReturnRequest> {

    return this.http.get<ReturnRequest>(`${this.apiUrl}/${id}`);
  }

   getReturnByOrderId(orderId: number): Observable<ReturnRequest> {

    return this.http.get<ReturnRequest>(`${this.apiUrl}/order/${orderId}`);
  }

  approveReturn(id: number,notes?: string): Observable<ReturnResponse> {

    const url = `${this.apiUrl}/${id}/approve`;

    if (notes && notes.trim()) {
      return this.http.put<ReturnResponse>(`${url}?notes=${encodeURIComponent(notes.trim())}`,{});
    }

    return this.http.put<ReturnResponse>(url,{});
  }

  rejectReturn(id: number,notes?: string): Observable<ReturnResponse> {

    const url = `${this.apiUrl}/${id}/reject`;

    if (notes && notes.trim()) {
      return this.http.put<ReturnResponse>(`${url}?notes=${encodeURIComponent(notes.trim())}`,{});
    }

    return this.http.put<ReturnResponse>(url,{});
  }

  receiveReturn(id: number,restockable: boolean,notes?: string): Observable<ReturnResponse> {

    let url =`${this.apiUrl}/${id}/receive` + `?restockable=${restockable}`;

    if (notes && notes.trim()) {
      url += `&notes=${encodeURIComponent(notes.trim())}`;
    }

    return this.http.put<ReturnResponse>(url,{});
  }

  processRefund(id: number): Observable<ReturnResponse> {

    return this.http.post<ReturnResponse>(`${this.apiUrl}/${id}/refund`,{});
  }
}

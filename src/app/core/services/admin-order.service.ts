import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminOrderItem {
  id: number;
  itemId: number;
  itemName: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

export interface AdminOrder {
  id: number;
  userId: string;
  orderNumber: string;

  assignedStaffId?: string | null;
  assignedStaffName?: string | null;

  customerName?: string | null;

  createdAt: string;
  updatedAt?: string | null;

  status: number;

  paymentStatus: number;
  paymentMethod: number;

  subTotal: number;
  deliveryFee: number;
  grandTotal: number;

  shippingAddress: string;
  customerNotes?: string | null;

  items: AdminOrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/order`;


  getAllOrders(): Observable<AdminOrder[]> {

    return this.http.get<AdminOrder[]>(this.apiUrl);
  }

 
  getOrderById(id: number): Observable<AdminOrder> {

    return this.http.get<AdminOrder>(`${this.apiUrl}/${id}`);
  }

  getOrdersByStatus(status: number): Observable<AdminOrder[]> {

    return this.http.get<AdminOrder[]>(`${this.apiUrl}/status/${status}`);
  }

  getUnassignedOrders(): Observable<AdminOrder[]> {

    return this.http.get<AdminOrder[]>(`${this.apiUrl}/unassigned`);
  }

  getAssignedOrders(): Observable<AdminOrder[]> {

  return this.http.get<AdminOrder[]>(`${this.apiUrl}/assigned`);
}

  updateOrderStatus(orderId: number,status: number): Observable<AdminOrder> {

    return this.http.put<AdminOrder>(`${this.apiUrl}/${orderId}/status`,status);
  }

  selfAssignOrder(orderId: number): Observable<AdminOrder> {

  return this.http.post<AdminOrder>(`${this.apiUrl}/${orderId}/self-assign`,null);
}

  assignStaff(orderId: number,staffId: string | null): Observable<AdminOrder> {

    return this.http.put<AdminOrder>(`${this.apiUrl}/${orderId}/assign`,{staffId});
  }
}
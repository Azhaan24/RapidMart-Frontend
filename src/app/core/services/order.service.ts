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

export enum OrderStatus {
  Pending = 1,
  Confirmed = 2,
  Processing = 3,
  OutForDelivery = 4,
  Delivered = 5,
  Cancelled = 6,
  ReturnRequested = 7,
  ReturnApproved = 8,
  ReturnRejected = 9,
  Returned = 10
}

export interface Order {
  id: number;
  orderNumber?: string;
  userId: string;
  customerName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt?: string;
  status: OrderStatus;
  deliveryFee: number;
  paymentMethod: number;
  paymentStatus: number;
  subTotal: number;
  grandTotal: number;
  shippingAddress?: string;
  customerNotes?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  itemId: number;
  itemName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}

export enum PaymentMethod {
  CreditCard = 1,
  DebitCard = 2,
  UPI = 3,
  CashOnDelivery = 4
}

export enum PaymentStatus {
  Pending = 1,
  Paid = 2,
  Failed = 3,
  Refund_Initiated = 4,
  Refund_Completed = 5,
  Refund_Canceled = 6
}

export interface CreateOrderItemRequest{
  itemId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  customerNotes?: string;
  paymentMethod: PaymentMethod;
  items?: CreateOrderItemRequest[];

  latitude: number;
  longitude: number;
}

export interface RazorpayPayment {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface CreateOrderResponse {
  order: Order;
  razorpayPayment?: RazorpayPayment | null;
}

export interface VerifyRazorpayPaymentRequest {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OrderItem {
  id: number;
  itemId: number;
  itemName: string;
  imageUrl?: string | undefined;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
}


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Order`;

  private readonly paymentApiUrl = `${environment.apiUrl}/Payment`;


  getMyOrders(pageNumber: number = 1,pageSize: number = 10,): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/my`,{ params });
  }

  getAllOrders(pageNumber: number = 1,pageSize: number = 10,status: number | null = null,search: string | null = null): Observable<PagedResult<Order>> {

    console.log('Get all orders called');

    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

      if(status !== null)
      {
        params = params.set('status',status);
      }
      
      if(search !== null)
      {
        params = params.set('search',search);
      }

      console.log(pageNumber,pageSize,search,status);
      console.log(params);

    return this.http.get<PagedResult<Order>>(this.apiUrl,{ params });
  }

  getOrdersByStatus(status: number,pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/status/${status}`,{ params });
  }

  getMyCurrentOrders(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/my-current`,{ params });
  }

  getMyPastOrders(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/my-past`,{ params });
  }

  getUnassignedOrders(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/unassigned`,{ params });
  }

  getAllUnassignedOrders(pageNumber: number = 1,pageSize: number = 10,status: number | null): Observable<PagedResult<Order>> {

    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

      if(status !== null){
        params = params.set('status',status);
      }

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/allunassigned`,{ params });
  }

  getActiveAssignedOrders(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/mycurrentassigned`,{ params });
  }

  getAssignedOrders(assignedStaffId: string,pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('assignedStaffId',assignedStaffId).set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/assigned`,{ params });
  }

  getAllForSalesStaff(pageNumber: number =  1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/all-sales`,{ params });
  }

  getStaffWorkload(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<any>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<any>>(`${this.apiUrl}/staff-workload`,{ params });
  }

  getMyOrdersByStatus(status: number,pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/mystatus/${status}`,{ params });
  }

  getMyAssignedOrders(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Order>> {

    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    return this.http.get<PagedResult<Order>>(`${this.apiUrl}/myassigned`,{ params });
  }

  getOrderById(id: number): Observable<Order> {

    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse> {
    
    return this.http.post<CreateOrderResponse>(this.apiUrl,request);
  }

  verifyRazorpayPayment(request: VerifyRazorpayPaymentRequest): Observable<Order> {

    return this.http.post<Order>(`${this.paymentApiUrl}/verify`,request);
  }


  cancelOrder(id: number): Observable<any> {

    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`,{});
  }
  
  updateOrderStatus(orderId: number,status: number): Observable<Order> {
    
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`,status);
  }
  
  selfAssignOrder(orderId: number): Observable<Order> {

    return this.http.post<Order>(`${this.apiUrl}/${orderId}/self-assign`,null);
  }
  
  assignStaff(orderId: number,staffId: string | null): Observable<Order> {
    
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/assign`,{staffId});
  }
}
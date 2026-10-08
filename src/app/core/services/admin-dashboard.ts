import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AdminDashboardInterface {
  totalUsers: number;
  totalEmployees: number;
  totalItems: number;
  totalItemsInCategory: number;
  totalItemsInSubCategory: number;
  totalCategory: number;
  totalSubcategory: number;
  pendingRoleRequests: number;
  totalSalesStaff: number;
  activeOrders: number;
  ordersCompleted: number;
  allAssignedOrders: number;
  totalInventoryItems: number;
  totalStock: number;
  totalReservedStock: number;
  totalAvailableStock: number;
  lowStock: number;
  outOfStock: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  outForDelivery: number;
  returnRequests: number;
  returned: number;
  returnsApproved: number;
  returnsRejected:number;
  totalReturns: number;
  totalUnassignedOrders: number;
}

export interface ManagerDashboard {
  totalSalesStaff: number;
  totalItems: number;
  totalCategory: number;
  totalSubcategory: number;
  totalItemsInSubCategory: number;
  totalItemsInCategory: number;
  activeOrders: number;
  ordersCompleted: number;
  allAssignedOrders: number;
  totalInventoryItems: number;
  totalStock: number;
  totalReservedStock: number;
  totalAvailableStock: number;
  lowStock: number;
  outOfStock: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  outForDelivery: number;
  returnRequests: number;
  returnedOrders: number;
  returnsApproved: number;
  returnsRejected:number;
  totalReturns: number;
  totalUnassignedOrders: number;
}

export interface SalesDashboard {
  availableOrdersForClaim: number;
  myAssignedOrders: number;
  myActiveOrders: number;
  myPendingOrders: number;
  myConfirmedOrders: number;
  myProcessingOrders: number;
  myOutForDeliveryOrders: number;
  myDeliveredOrders: number;
  myOrdersReturned: number;
}

export interface CustomerDashboard {
  myOrders: number;
  myActiveOrders: number;
  myPastOrders: number;
  myReturnOrders: number;
  myReturnRequests: number;
  myCartItems: number;
  myNotifications: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}`;

  getAdminDashboard(categoryId: number = 0,subCategoryId: number = 0): Observable<AdminDashboardInterface> {

    let params = new HttpParams();

    if (categoryId > 0) {
      params = params.set('categoryId', categoryId);

      if (subCategoryId > 0) {
        params = params.set('subCategoryId', subCategoryId);
      }
    }

    return this.http.get<AdminDashboardInterface>(`${this.apiUrl}/Dashboard/Admin`,{ params });
  }

  getManagerDashboard(categoryId: number = 0,subCategoryId: number = 0): Observable<ManagerDashboard> {

    let params = new HttpParams();

    if (categoryId > 0) {
      params = params.set('categoryId', categoryId);

      if (subCategoryId > 0) {
        params = params.set('subCategoryId', subCategoryId);
      }
    }

    return this.http.get<ManagerDashboard>(`${this.apiUrl}/Dashboard/Manager`,{ params });
  }

  getSalesDashboard(): Observable<SalesDashboard> {
    return this.http.get<SalesDashboard>(`${this.apiUrl}/Dashboard/Sales`);
  }

  getCustomerDashboard(): Observable<CustomerDashboard> {
    return this.http.get<CustomerDashboard>(`${this.apiUrl}/Dashboard/Customer`);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from './order.service';
import { environment } from '../../../environments/environment';

export interface Inventory {
  id: number;
  itemId: number;
  itemName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: number;
  itemId: number;
  itemName: string;
  type: number;
  orderId?: number | null;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  previousReservedQuantity: number;
  newReservedQuantity: number;
  performedByUserId?: string | null;
  createdAt: string;
}

export interface UpdateStockRequest {
  quantity: number;
}

export interface ReleaseReservedStockRequest {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminInventoryService {

  private http = inject(HttpClient);

  private inventoryApiUrl = `${environment.apiUrl}/Inventory`;
  private itemApiUrl = `${environment.apiUrl}/Item`;

  getInventory(pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<Inventory>> {
    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);

    return this.http.get<PagedResult<Inventory>>(this.inventoryApiUrl,{params});
  }

  updateStock(itemId: number,quantity: number): Observable<any> {

    const request: UpdateStockRequest = {
      quantity
    };

    return this.http.put(`${this.itemApiUrl}/${itemId}/stock`,request);
  }

  releaseReservedStock(itemId: number,quantity: number): Observable<Inventory> {
    
    const request: ReleaseReservedStockRequest = {
      quantity
    };

    return this.http.put<Inventory>(`${this.inventoryApiUrl}/${itemId}/release-reserved`,quantity);
  }

  getInventoryTransactions(itemId: number, pageNumber: number = 1,pageSize: number = 10): Observable<PagedResult<InventoryTransaction>> {
    const params = new HttpParams().set('pageNumber',pageNumber).set('pageSize',pageSize);
    
    return this.http.get<PagedResult<InventoryTransaction>>(`${this.inventoryApiUrl}/${itemId}/transactions`,{params});
  }
}
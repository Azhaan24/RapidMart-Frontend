import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface StoreSettings {
  storeName: string;
  address: string;
  latitude: number;
  longitude: number;
  freeDeliveryDistanceKm: number;
  deliveryRatePerKm: number;
  maximumDeliveryDistanceKm: number;
  minimumDeliveryCharge: number;
  preparationTimeMinutes: number;
  deliveryBufferTimeMinutes: number;
  updatedAt: string;
  returnDaysWindow: number;
}

export interface UpdateStoreSettingsRequest {
  storeName: string;
  address: string;
  latitude: number;
  longitude: number;
  returnDaysWindow: number;
  freeDeliveryDistanceKm: number;
  minimumDeliveryCharge: number;
  deliveryRatePerKm: number;
  maximumDeliveryDistanceKm: number;
  preparationTimeMinutes: number;
  deliveryBufferMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoreSettingsService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/StoreSettings`;

  getSettings() {

    return this.http.get<StoreSettings>(this.apiUrl);
  }

  updateSettings(request: UpdateStoreSettingsRequest) {

    return this.http.put<StoreSettings>(this.apiUrl,request);
  }
}
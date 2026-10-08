import { Component,inject,OnInit,signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreSettings,StoreSettingsService,UpdateStoreSettingsRequest } from '../../../core/services/store-settings.service';

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './store-settings.html'
})
export class StoreSettingsComponent
  implements OnInit {

  private readonly storeSettingsService = inject(StoreSettingsService);

  isLoading = signal(true);
  isSaving = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  storeName = signal('');
  address = signal('');

  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  returnWindow = signal<number>(0);

  freeDeliveryDistanceKm = signal<number | null>(null);

  deliveryRatePerKm = signal<number | null>(null);

  maximumDeliveryDistanceKm = signal<number | null>(null);

  preparationTimeMinutes = signal<number | null>(null);

  deliveryBufferMinutes = signal<number | null>(null);

  minimumDeliveryCharge = signal<number | null>(null);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.storeSettingsService
      .getSettings()
      .subscribe({
        next: (settings) => {
          this.setFormValues(settings);

          this.isLoading.set(false);
        },

        error: (error) => {
          console.error(
            'Failed to load store settings:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to load store delivery settings.'
          );

          this.isLoading.set(false);
        }
      });
  }

  private setFormValues(
    settings: StoreSettings
  ): void {

    this.storeName.set(
      settings.storeName
    );

    this.address.set(
      settings.address
    );

    this.latitude.set(
      settings.latitude
    );

    this.longitude.set(
      settings.longitude
    );

    this.returnWindow.set(
      settings.returnDaysWindow
    );

    this.freeDeliveryDistanceKm.set(
      settings.freeDeliveryDistanceKm
    );

    this.deliveryRatePerKm.set(
      settings.deliveryRatePerKm
    );

    this.minimumDeliveryCharge.set(
      settings.minimumDeliveryCharge
    );

    this.maximumDeliveryDistanceKm.set(
      settings.maximumDeliveryDistanceKm
    );

    this.preparationTimeMinutes.set(
      settings.preparationTimeMinutes
    );

    this.deliveryBufferMinutes.set(
      settings.deliveryBufferTimeMinutes
    );
  }

  saveSettings(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (
      !this.storeName().trim() ||
      !this.address().trim()
    ) {
      this.errorMessage.set(
        'Store name and address are required.'
      );

      return;
    }

    const latitude = this.latitude();
    const longitude = this.longitude();
    const returnDaysWindow = this.returnWindow();

    const freeDistance = this.freeDeliveryDistanceKm();

    const rate =this.deliveryRatePerKm();

    const maximumDistance = this.maximumDeliveryDistanceKm();

    const preparationTime = this.preparationTimeMinutes();

    const deliveryBuffer = this.deliveryBufferMinutes();
    
    const minimumDeliveryCharge = this.minimumDeliveryCharge();

    if (latitude === null ||
      longitude === null ||
      returnDaysWindow == null ||
      freeDistance === null ||
      rate === null ||
      maximumDistance === null ||
      preparationTime === null ||
      deliveryBuffer === null ||
      minimumDeliveryCharge === null
    ) {
      this.errorMessage.set(
        'Please fill in all delivery settings.'
      );

      return;
    }

    if (maximumDistance < freeDistance) {
      this.errorMessage.set(
        'Maximum delivery distance cannot be less than the free delivery distance.'
      );

      return;
    }

    const request:
      UpdateStoreSettingsRequest = {

      storeName:
        this.storeName().trim(),

      address:
        this.address().trim(),

      latitude,

      longitude,

      returnDaysWindow:
      this.returnWindow(),

      freeDeliveryDistanceKm:
        freeDistance,

      deliveryRatePerKm:
        rate,

      maximumDeliveryDistanceKm:
        maximumDistance,

      preparationTimeMinutes:
        preparationTime,

      deliveryBufferMinutes:
        deliveryBuffer,
      
      minimumDeliveryCharge:
       minimumDeliveryCharge
    };

    this.isSaving.set(true);

    this.storeSettingsService
      .updateSettings(request)
      .subscribe({
        next: (settings) => {

          this.setFormValues(settings);

          this.isSaving.set(false);

          this.successMessage.set(
            'Delivery settings updated successfully.'
          );
        },

        error: (error) => {

          console.error(
            'Failed to update store settings:',
            error
          );

          this.isSaving.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to update delivery settings.'
          );
        }
      });
  }
}
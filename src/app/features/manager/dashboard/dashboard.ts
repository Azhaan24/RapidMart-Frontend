import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ManagerDashboard,DashboardService } from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.html'
})
export class ManagerDashboardComponent implements OnInit {

  private router = inject(Router);
  readonly dashboardService = inject(DashboardService);

  dashboard = signal<ManagerDashboard | null>(null);
isLoading = signal(true);
errorMessage = signal('');

ngOnInit(): void {
  this.loadDashboard();
}

loadDashboard(): void {
  this.isLoading.set(true);
  this.errorMessage.set('');

  this.dashboardService.getManagerDashboard().subscribe({
    next: (data) => {
      this.dashboard.set(data);
      this.isLoading.set(false);
    },
    error: (error) => {
      console.error('Failed to load manager dashboard:', error);

      this.errorMessage.set(
        error?.error?.message || 'Failed to load dashboard data.'
      );

      this.isLoading.set(false);
    }
  });
}
  openOrders(): void {
    this.router.navigate(['/manager/orders']);
  }

  openStaffWorkload(): void {
    this.router.navigate(['/manager/staff-info']);
  }

  openInventory(): void {
    this.router.navigate(
      ['/manager/catalog'],
      {
        queryParams: {
          tab: 'inventory'
        }
      }
    );
  }

  openProducts(): void {
    this.router.navigate(
      ['/manager/catalog'],
      {
        queryParams: {
          tab: 'products'
        }
      }
    );
  }

  openReturns(): void {
    this.router.navigate(
      ['/manager/returns'],
      {
        queryParams: {
          status: 7
        }
      }
    );
  }
}
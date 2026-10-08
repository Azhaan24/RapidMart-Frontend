import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  DashboardService,
  SalesDashboard
} from '../../../core/services/admin-dashboard';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html'
})
export class SalesDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  dashboard = signal<SalesDashboard | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.dashboardService.getSalesDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load sales dashboard:', error);

        this.errorMessage.set(
          error?.error?.message || 'Failed to load dashboard data.'
        );

        this.isLoading.set(false);
      }
    });
  }

  openOrders(): void {
    this.router.navigate(['/sales/orders']);
  }

  openAssignedOrders(): void {
    this.router.navigate(['/sales/orders'], {
      queryParams: {
        tab: 'assigned'
      }
    });
  }

  openUnassignedOrders(): void {
    this.router.navigate(['/sales/orders'], {
      queryParams: {
        tab: 'unassigned'
      }
    });
  }

  openReturns(): void {
    this.router.navigate(['/sales/returns']);
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }
}
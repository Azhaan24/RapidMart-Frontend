import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  AdminUser,
  AdminUserService
} from '../../../core/services/admin-user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsersComponent implements OnInit {

  private adminUserService = inject(AdminUserService);

  users = signal<AdminUser[]>([]);

  selectedUser = signal<AdminUser | null>(null);

  selectedRole = signal('');

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  isLoading = signal(true);

  isChangingRole = signal(false);

  errorMessage = signal('');

  successMessage = signal('');

  availableRoles = [
    'Customer',
    'SalesStaff',
    'Manager',
    'Admin'
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminUserService.getUsers(this.pageNumber(),this.pageSize()).subscribe({

      next: (users) => {

        this.users.set(users.items);

        this.pageNumber.set(users.pageNumber);
        this.pageSize.set(users.pageSize);
        this.totalCount.set(users.totalCount);
        this.totalPages.set(users.totalPages);
        this.hasNextPage.set(users.hasNextPage);
        this.hasPreviousPage.set(users.hasPreviousPage);


        this.isLoading.set(false);
      },

      error: (error) => {

        console.error('Error loading users:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Unable to load users.'
        );

        this.isLoading.set(false);
      }

    });
  }

  openManageUser(user: AdminUser): void {

    this.selectedUser.set(user);

    this.selectedRole.set(
      user.roles.length > 0
        ? user.roles[0]
        : 'Customer'
    );

    this.errorMessage.set('');
    this.successMessage.set('');
  }


  closeManageUser(): void {

    this.selectedUser.set(null);

    this.selectedRole.set('');

    this.errorMessage.set('');
    this.successMessage.set('');
  }

  changeRole(): void {

    const user = this.selectedUser();
    const role = this.selectedRole();

    if (!user) {
      return;
    }

    if (!role) {

      this.errorMessage.set(
        'Please select a role.'
      );

      return;
    }

    if (
      user.roles.length > 0 &&
      user.roles[0] === role
    ) {

      this.errorMessage.set(
        'The user already has this role.'
      );

      return;
    }

    if (
      this.isLastAdmin(user) &&
      role !== 'Admin'
    ) {

      this.errorMessage.set(
        'The last Admin cannot be changed to another role. Please assign another Admin first.'
      );

      return;
    }

    this.isChangingRole.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminUserService
      .changeRole(
        user.userId,
        role
      )
      .subscribe({

        next: (updatedUser) => {

          this.users.update(users =>
            users.map(currentUser =>
              currentUser.userId === updatedUser.userId
                ? updatedUser
                : currentUser
            )
          );

          // Update currently selected user
          this.selectedUser.set(updatedUser);

          this.isChangingRole.set(false);

          this.successMessage.set(
            'User role updated successfully.'
          );
        },

        error: (error) => {

          console.error(
            'Error changing user role:',
            error
          );

          this.errorMessage.set(
            error?.error?.message ||
            'Unable to change user role.'
          );

          this.isChangingRole.set(false);
        }

      });
  }

  isLastAdmin(user: AdminUser): boolean {

    if (!user.roles.includes('Admin')) {
      return false;
    }

    const adminCount = this.users().filter(
      currentUser =>
        currentUser.roles.includes('Admin')
    ).length;

    return adminCount === 1;
  }

  goToNextPage() {
    this.pageNumber.update(page => page + 1);
    this.loadUsers();
  }

  goToPreviousPage() {
    this.pageNumber.update(page => page - 1);
    this.loadUsers();
  }
}
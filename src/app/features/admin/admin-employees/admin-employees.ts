import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { EmployeeService,EmployeeProfile,CreateEmployeeProfileRequest,UpdateEmployeeProfileRequest } from '../../../core/services/employee.service';
import { AdminUserService,AdminUser } from '../../../core/services/admin-user.service';
import { SortType } from '../../../core/models/sortType';


@Component({
  selector: 'app-admin-employees',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './admin-employees.html',
  styleUrl: './admin-employees.css'
})
export class AdminEmployees implements OnInit {


  private employeeService = inject(EmployeeService);
  private adminUserService = inject(AdminUserService);


   roles: Record<string,string> = {'Admin': 'Admin','Manager' : 'Manager','Sales Staff' : 'SalesStaff'};

  employees = signal<EmployeeProfile[]>([]);

  filteredEmployees = signal<EmployeeProfile[]>([]);

  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);

  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);


  eligibleUsers = signal<AdminUser[]>([]);

  eligibleUsersPageNumber = signal<number>(1);
  eligibleUsersPageSize = signal<number>(10);
  teligibleUsersTotalCount = signal<number>(0);
  eligibleUsersTotalPages = signal<number>(0);

  eligibleUsersHasNextPage = signal<boolean>(false);
  eligibleUsersHasPreviousPage = signal<boolean>(false);

  

  isLoading = signal(false);

  isLoadingUsers = signal(false);

  isLoadingDetails = signal(false);

  isCreating = signal(false);

  isUpdating = signal(false);

  successMessage = signal('');

  errorMessage = signal('');

  showCreateForm = signal(false);

  selectedUserId = signal('');

  firstName = signal<string>('');

  lastName = signal('');

  email = signal('');

  password = signal('');

  confirmPassword = signal('');

  role = signal('');

  phoneNumber = signal<number | null>(null);

  employeeCode = signal('');

  department = signal('');

  joiningDate = signal('');

  designation = signal('');

  isEditing = signal(false);

  editingEmployeeId = signal<number | null>(null);

  editEmployeeCode = signal('');

  editDepartment = signal('');

  editJoiningDate = signal('');

  editDesignation = signal('');

  searchTerm = signal('');

  active = signal<boolean | null>(null);
  sortBy = signal<SortType>(SortType.alphabeticalAsc);

  statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  selectedEmployee = signal<EmployeeProfile | null>(null);

  processingEmployeeId = signal<number | null>(null);

  ngOnInit(): void {

    this.loadEmployees();

    //this.loadEligibleUsers();

  }

  loadEmployees(): void {

    switch(this.statusFilter()){
      
      case ('all'): 
      this.active.set(null);
      break;
      
      case('active'): 
      this.active.set(true);
      break;
      
      case('inactive'):
      this.active.set(false);
      break;
      
      default:
        this.active.set(null);
        break;
    }

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.employeeService.getEmployees(this.pageNumber(),this.pageSize(),this.sortBy(),this.active(),this.searchTerm()).subscribe({

      next: (employees) => {

        this.employees.set(employees.items);

        this.pageNumber.set(employees.pageNumber);
        this.pageSize.set(employees.pageSize);
        this.totalCount.set(employees.totalCount);
        this.totalPages.set(employees.totalPages);
        this.hasNextPage.set(employees.hasNextPage);
        this.hasPreviousPage.set(employees.hasPreviousPage);

        this.isLoading.set(false);

      },

      error: (error) => {

        console.error(
          'Error loading employees:',
          error
        );

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            'Failed to load employees.'
          )
        );

        this.isLoading.set(false);

      }

    });

  }

  openCreateForm(): void {

    this.clearMessages();

    this.resetCreateForm();

    this.showCreateForm.set(true);

    this.isEditing.set(false);

  }

  closeCreateForm(): void {

    if (this.isCreating()) {
      return;
    }

    this.showCreateForm.set(false);

    this.resetCreateForm();

  }

  private resetCreateForm(): void {

    this.selectedUserId.set('');

    this.employeeCode.set('');

    this.department.set('');

    this.joiningDate.set('');

    this.designation.set('');

  }

  createEmployee(): void {

    this.clearMessages();

    if (this.isCreating()) {
      return;
    }

    if (!this.firstName().trim()) {

      this.errorMessage.set(
        'Employee first name is required.'
      );

      return;

    }

    if (!this.lastName().trim()) {

      this.errorMessage.set(
        'Employee last name is required.'
      );

      return;

    }

    if (!this.email().trim()) {

      this.errorMessage.set(
        'Employee email is required.'
      );

      return;

    }

    if (!this.password().trim()) {

      this.errorMessage.set(
        'Password is required.'
      );

      return;

    }

    if (!this.employeeCode().trim()) {

      this.errorMessage.set(
        'Confirm your password.'
      );

      return;

    }


    if (!this.employeeCode().trim()) {

      this.errorMessage.set(
        'Employee code is required.'
      );

      return;

    }


    if (!this.department().trim()) {

      this.errorMessage.set(
        'Department is required.'
      );

      return;

    }


    if (!this.joiningDate()) {

      this.errorMessage.set(
        'Joining date is required.'
      );

      return;

    }

    const request: CreateEmployeeProfileRequest = {
      
      firstName: this.firstName().trim(),

      lastName: this.lastName().trim(),

      email: this.email().trim(),

      password: this.password().trim(),

      confirmPassword: this.confirmPassword().trim(),

      role: this.role().trim(),

      phoneNumber: this.phoneNumber()?.toString(),

      employeeCode: this.employeeCode().trim(),

      department: this.department().trim(),

      joiningDate: this.joiningDate(),

      designation: this.designation().trim() || undefined
      
    };

    console.log('firstName', this.firstName().trim(),

      'lastName', this.lastName().trim(),

      'email', this.email().trim(),

      'password', this.password().trim(),

      'confirmPassword', this.confirmPassword().trim(),

      'role', this.role().trim(),

      'phoneNumber', this.phoneNumber()?.toString(),

      'employeeCode', this.employeeCode().trim(),

      'department', this.department().trim(),

      'joiningDate', this.joiningDate(),

      'designation', this.designation().trim()
    );


    this.isCreating.set(true);


    this.employeeService
      .createEmployee(request)
      .subscribe({

        next: (employee) => {

          console.log(
            'Employee created:',
            employee
          );


          this.successMessage.set(
            'Employee profile created successfully.'
          );


          this.showCreateForm.set(false);

          this.resetCreateForm();

          this.isCreating.set(false);

          this.loadEmployees();

        },


        error: (error) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to create employee profile.'
            )
          );


          this.isCreating.set(false);

        }

      });

  }


  viewEmployee(
    employee: EmployeeProfile
  ): void {

    this.clearMessages();

    this.selectedEmployee.set(null);

    this.isLoadingDetails.set(true);


    this.employeeService
      .getEmployeeById(employee.id)
      .subscribe({

        next: (employeeDetails) => {

          this.selectedEmployee.set(
            employeeDetails
          );

          this.isLoadingDetails.set(false);

        },


        error: (error) => {

          console.error(
            'Error loading employee details:',
            error
          );


          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to load employee details.'
            )
          );


          this.isLoadingDetails.set(false);

        }

      });

  }

  closeEmployeeDetails(): void {

    if (this.isLoadingDetails()) {
      return;
    }

    this.selectedEmployee.set(null);

  }


  startEditEmployee(
    employee: EmployeeProfile
  ): void {

    this.clearMessages();

    this.selectedEmployee.set(null);

    this.isEditing.set(true);

    this.editingEmployeeId.set(
      employee.id
    );


    this.editEmployeeCode.set(
      employee.employeeCode
    );

    this.editDepartment.set(
      employee.department
    );

    this.editJoiningDate.set(
      this.formatDateForInput(
        employee.joiningDate
      )
    );

    this.editDesignation.set(
      employee.designation || ''
    );


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  cancelEditEmployee(): void {

    if (this.isUpdating()) {
      return;
    }

    this.isEditing.set(false);

    this.editingEmployeeId.set(null);

    this.resetEditForm();

  }

  private resetEditForm(): void {

    this.editEmployeeCode.set('');

    this.editDepartment.set('');

    this.editJoiningDate.set('');

    this.editDesignation.set('');

  }

  updateEmployee(): void {

    this.clearMessages();


    const employeeId =
      this.editingEmployeeId();


    if (employeeId === null) {

      this.errorMessage.set(
        'No employee selected for editing.'
      );

      return;

    }


    if (!this.editEmployeeCode().trim()) {

      this.errorMessage.set(
        'Employee code is required.'
      );

      return;

    }


    if (!this.editDepartment().trim()) {

      this.errorMessage.set(
        'Department is required.'
      );

      return;

    }


    if (!this.editJoiningDate()) {

      this.errorMessage.set(
        'Joining date is required.'
      );

      return;

    }


    const request: UpdateEmployeeProfileRequest = {

      employeeCode:
        this.editEmployeeCode().trim(),

      department:
        this.editDepartment().trim(),

      joiningDate:
        this.editJoiningDate(),

      designation:
        this.editDesignation().trim() || undefined

    };


    this.isUpdating.set(true);


    this.employeeService
      .updateEmployee(
        employeeId,
        request
      )
      .subscribe({

        next: (updatedEmployee) => {

          console.log(
            'Employee updated:',
            updatedEmployee
          );


          // Update local employee list
          this.employees.update(
            employees =>
              employees.map(employee =>
                employee.id === updatedEmployee.id
                  ? updatedEmployee
                  : employee
              )
          );


          this.loadEmployees();


          // Update selected employee if open
          const selected =
            this.selectedEmployee();

          if (
            selected &&
            selected.id === updatedEmployee.id
          ) {

            this.selectedEmployee.set(
              updatedEmployee
            );

          }


          this.successMessage.set(
            'Employee profile updated successfully.'
          );


          this.isEditing.set(false);

          this.editingEmployeeId.set(null);

          this.resetEditForm();

          this.isUpdating.set(false);

        },


        error: (error) => {

          console.error(
            'Error updating employee:',
            error
          );


          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to update employee profile.'
            )
          );


          this.isUpdating.set(false);

        }

      });

  }

  deactivateEmployee(
    employee: EmployeeProfile
  ): void {

    this.clearMessages();


    const confirmed = confirm(
      `Are you sure you want to deactivate ${employee.fullName || 'this employee'}?`
    );


    if (!confirmed) {
      return;
    }


    this.processingEmployeeId.set(
      employee.id
    );


    this.employeeService
      .deactivateEmployee(employee.id)
      .subscribe({

        next: () => {

          // Update employee list
          this.employees.update(
            employees =>
              employees.map(item =>
                item.id === employee.id
                  ? { ...item, isActive: false }
                  : item
              )
          );


          // Update selected employee
          const selected =
            this.selectedEmployee();

          if (
            selected &&
            selected.id === employee.id
          ) {

            this.selectedEmployee.set({
              ...selected,
              isActive: false
            });

          }


          this.loadEmployees();


          this.successMessage.set(
            'Employee deactivated successfully.'
          );


          this.processingEmployeeId.set(null);

        },


        error: (error) => {

          console.error(
            'Error deactivating employee:',
            error
          );


          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to deactivate employee.'
            )
          );


          this.processingEmployeeId.set(null);

        }

      });

  }

  activateEmployee(
    employee: EmployeeProfile
  ): void {

    this.clearMessages();


    this.processingEmployeeId.set(
      employee.id
    );


    this.employeeService
      .activateEmployee(employee.id)
      .subscribe({

        next: () => {

          // Update employee list
          this.employees.update(
            employees =>
              employees.map(item =>
                item.id === employee.id
                  ? { ...item, isActive: true }
                  : item
              )
          );


          // Update selected employee
          const selected =
            this.selectedEmployee();

          if (
            selected &&
            selected.id === employee.id
          ) {

            this.selectedEmployee.set({
              ...selected,
              isActive: true
            });

          }


          this.loadEmployees();


          this.successMessage.set(
            'Employee activated successfully.'
          );


          this.processingEmployeeId.set(null);

        },


        error: (error) => {

          console.error(
            'Error activating employee:',
            error
          );


          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to activate employee.'
            )
          );


          this.processingEmployeeId.set(null);

        }

      });

  }

  private clearMessages(): void {

    this.successMessage.set('');

    this.errorMessage.set('');

  }

  private formatDateForInput(
    date: string
  ): string {

    if (!date) {
      return '';
    }


    const parsedDate =
      new Date(date);


    if (isNaN(parsedDate.getTime())) {
      return '';
    }


    const year =
      parsedDate.getFullYear();


    const month =
      String(
        parsedDate.getMonth() + 1
      ).padStart(2, '0');


    const day =
      String(
        parsedDate.getDate()
      ).padStart(2, '0');


    return `${year}-${month}-${day}`;

  }


  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      error?.error?.message
    ) {

      return error.error.message;

    }


    if (
      error?.error?.title
    ) {

      return error.error.title;

    }


    if (
      typeof error?.error === 'string'
    ) {

      return error.error;

    }


    return fallback;

  }

  goToNextPage() {
    this.pageNumber.update(page => page + 1);
    this.loadEmployees();
  }

  goToPreviousPage() {
    this.pageNumber.update(page => page - 1);
    this.loadEmployees();
  }
}
import { Routes } from '@angular/router';

import {HomeComponent} from './features/customer/home/home';
import {SubcategoriesComponent} from './features/customer/subcategories/subcategories';
import {Products} from './features/customer/products/products';
import { ProductDetails } from './features/customer/product-details/product-details';
import { Categories } from './features/customer/categories/categories';
import { Profile } from './features/customer/profile/profile';
import { Register } from './features/customer/register/register';
import { AdminDashboard } from './features/admin/dashboard/dashboard';
import { ManagerDashboardComponent } from './features/manager/dashboard/dashboard';
import { SalesDashboardComponent } from './features/sales/dashboard/dashboard';
import { ProductSearch } from './features/customer/product-search/product-search';
import { authGuard } from './core/interceptors/authGuard';
import { roleGuard } from './core/interceptors/roleGuard';
import { AdminUsersComponent } from './features/admin/admin-users/admin-users';
import { AdminEmployees } from './features/admin/admin-employees/admin-employees';
import { AdminCatalog } from './features/admin/catalog/catalog';
import { AdminOrders } from './features/admin/orders/orders';
import { AdminOrderDetails } from './features/admin/order-details/order-details';
import { AdminStaffWorkload } from './features/admin/staff-workload/staff-workload';
import { ManagerOrders } from './features/manager/orders/orders';
import { ManagerOrderDetails } from './features/manager/order-details/order-details';
import { ManagerReturns } from './features/manager/returns/returns';
import { ManagerCatalog } from './features/manager/catalog/catalog';
import { ManagerStaffWorkload } from './features/manager/staff-workload/staff-workload';
import { SalesOrders } from './features/sales/orders/orders';
import { SalesOrderDetails } from './features/sales/order-details/order-details';
import { CartComponent } from './features/customer/cart/cart';
import { CheckoutComponent } from './features/customer/checkout/checkout';
import { OrdersComponent } from './features/customer/orders/orders';
import { OrderDetailsComponent } from './features/customer/order-details/order-details';
import { ManagerReturnDetails } from './features/manager/return-details/return-details';
import { StoreSettingsComponent } from './features/admin/store-settings/store-settings';
import { NotificationsComponent } from './features/customer/notifications/notifications';
import { ForgotPassword } from './features/customer/forgot-password/forgot-password';
import { ResetPassword } from './features/customer/reset-password/reset-password';
import { AdminReturns } from './features/admin/returns/returns';
import { AdminReturnDetails } from './features/admin/return-details/return-details';

export const routes: Routes = [
    { path: '', component : HomeComponent, title: 'Welcome to RapidMart Store' },
    { path: 'home', component : HomeComponent, title: 'Welcome to RapidMart Store' },
    { path: 'categories', component : Categories, title: 'Explore Categories' },
    { path: 'products/search', component:ProductSearch, title: ''},
    { path: 'category/:categoryId', component : SubcategoriesComponent },
    { path: 'category/:categoryId/subcategory/:subcategoryId', component : Products },
    { path: 'category/:categoryId/subcategory/:subcategoryId/product/:productId', component : ProductDetails },
    { path: 'profile', component:Profile },
    { path: 'register', component:Register },
    { path: 'cart', component:CartComponent },
    { path: 'checkout', component:CheckoutComponent },
    { path: 'orders', component:OrdersComponent },
    { path: 'notifications', component: NotificationsComponent },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword },
    { path: 'orders/:id', component:OrderDetailsComponent },
    { path: 'admin/dashboard', component: AdminDashboard, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/users', component: AdminUsersComponent, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/returns', component: AdminReturns, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/returns/:id', component: AdminReturnDetails, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/employees', component: AdminEmployees, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/catalog', component: AdminCatalog, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/orders', component: AdminOrders, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/store-settings', component: StoreSettingsComponent, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/orders/:id', component: AdminOrderDetails, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'admin/staffworkload', component: AdminStaffWorkload, canActivate : [authGuard,roleGuard], data: { role : 'Admin' } },
    { path: 'manager/dashboard', component: ManagerDashboardComponent, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'manager/orders', component: ManagerOrders, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'manager/orders/:id', component: ManagerOrderDetails, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'manager/orders', component: ManagerOrders, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'manager/returns', component: ManagerReturns, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'manager/returns/:id', component: ManagerReturnDetails, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'manager/catalog', component: ManagerCatalog, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'manager/staff-info', component: ManagerStaffWorkload, canActivate : [authGuard,roleGuard], data: { role : 'Manager' } },
    { path: 'sales/dashboard', component: SalesDashboardComponent, canActivate : [authGuard,roleGuard], data: { role : 'SalesStaff' } },
    { path: 'sales/orders', component: SalesOrders, canActivate : [authGuard,roleGuard], data: { role : 'SalesStaff' } },
    { path: 'sales/orders/:id', component: SalesOrderDetails, canActivate : [authGuard,roleGuard], data: { role : 'SalesStaff' } },
    { path: '**', redirectTo: '' }
];

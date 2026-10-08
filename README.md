# RapidMart Frontend

Angular frontend for **RapidMart**, a full-stack quick-commerce platform designed to provide a fast, location-aware shopping experience with product discovery, cart and checkout, order tracking, inventory management, dashboards, and real-time notifications.

> **Current architecture:** Single-store
> **Planned architecture:** Multi-store, location-aware fulfillment

---

## Features

### Customer

* User registration and login
* JWT-based authentication
* Role-based UI and navigation
* Browse categories and subcategories
* Product search, filtering, sorting, and pagination
* Product details
* Cart management
* Buy Now flow
* Checkout
* Cash on Delivery and Razorpay payment flow
* Order history and order details
* Order status tracking
* Order cancellation
* Return requests
* Refund status
* Profile management
* In-app notifications
* Real-time notifications using SignalR

### Employee & Management

* Role-based dashboards
* Manager dashboard
* SalesStaff order management
* Order assignment
* Order processing and status updates
* Return and refund management
* Product management
* Category and subcategory management
* Inventory management
* Stock monitoring
* Employee management
* Role management
* Admin catalog management

---

## Technology Stack

| Technology      | Purpose                          |
| --------------- | -------------------------------- |
| Angular         | Frontend framework               |
| TypeScript      | Application programming language |
| Angular Signals | Reactive UI state management     |
| Tailwind CSS    | UI styling                       |
| Angular Router  | Application navigation           |
| HttpClient      | API communication                |
| SignalR         | Real-time notifications          |
| Razorpay        | Online payment integration       |

---

## Architecture

The frontend communicates with the RapidMart ASP.NET Core Web API.

```text
┌──────────────────────────────┐
│        Angular Frontend      │
│                              │
│  Components                  │
│  Services                    │
│  Signals / UI State          │
│  Guards / Interceptors       │
│  Routing                     │
└──────────────┬───────────────┘
               │
               │ HTTP / JWT
               ▼
┌──────────────────────────────┐
│      RapidMart Web API       │
│       ASP.NET Core           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ SQL Server / Redis /         │
│ Razorpay / SignalR / OSRM    │
└──────────────────────────────┘
```

The frontend is responsible for presentation, user interaction, client-side state, navigation, and communication with the backend API.

Business rules and data validation remain primarily controlled by the backend.

---

## Project Structure

The project follows Angular's standalone component architecture.

```text
src/
├── app/
│   ├── admin/
│   ├── auth/
│   ├── cart/
│   ├── checkout/
│   ├── customer/
│   ├── employee/
│   ├── home/
│   ├── manager/
│   ├── orders/
│   ├── products/
│   ├── profile/
│   ├── services/
│   ├── shared/
│   └── ...
│
├── assets/
├── environments/
├── index.html
├── main.ts
└── styles.css
```

The exact structure may evolve as the application moves from the current single-store architecture to the planned multi-store architecture.

---

## Authentication

RapidMart uses JWT authentication provided by the backend API.

The frontend:

* Stores the authentication token locally
* Sends the token with authenticated API requests
* Protects routes using authorization guards
* Handles unauthorized/expired sessions
* Provides role-based navigation and UI
* Supports Customer, SalesStaff, Manager, and Admin experiences

The frontend does **not** store backend secrets such as:

* JWT signing keys
* Razorpay secret keys
* Database credentials
* Redis credentials

---

## API Communication

The Angular application communicates with the ASP.NET Core backend through HTTP APIs.

Local development API:

```text
http://localhost:5051
```

API endpoints are consumed through Angular services rather than placing API calls directly inside presentation components wherever possible.

Examples include services responsible for:

```text
Authentication
Products / Items
Categories
Cart
Orders
Payments
Returns
Refunds
Inventory
Employees
Notifications
Dashboard data
```

---

## Real-Time Notifications

RapidMart uses **SignalR** for real-time in-app notifications.

Examples include:

* New customer orders
* Order status updates
* Return requests
* Refund updates
* Stock alerts
* Role-related notifications

The frontend establishes a SignalR connection to the backend notification hub and updates the UI when new notifications are received.

---

## Product Discovery

The product experience supports:

* Category browsing
* Subcategory browsing
* Keyword search
* Availability filtering
* Price sorting
* Alphabetical sorting
* Pagination
* Product details
* Inventory availability

Filtering, sorting, searching, and pagination are handled through backend APIs so that the frontend does not need to load the entire product catalog into the browser.

---

## Cart & Checkout

The checkout flow supports both:

### Cart Checkout

```text
Cart
  ↓
Checkout
  ↓
Address
  ↓
Payment Method
  ↓
Order
```

### Buy Now

```text
Product
  ↓
Buy Now
  ↓
Checkout
  ↓
Payment
  ↓
Order
```

The frontend keeps the Buy Now flow separate from the normal cart checkout flow.

---

## Payments

RapidMart supports:

* Cash on Delivery
* Razorpay online payments

The frontend handles the payment user experience while sensitive payment credentials and payment verification remain on the backend.

The Razorpay secret key is **never exposed in the Angular application**.

---

## Environment Configuration

Environment-specific configuration is kept outside the application's business logic.

For local development, the frontend communicates with the local backend API:

```text
http://localhost:5051
```

Production API URLs should be configured through the appropriate production environment configuration when the application is deployed.

Do not commit private credentials or secrets to the frontend repository.

---

## Running the Project Locally

### Prerequisites

Install:

* Node.js
* npm
* Angular CLI

Verify the installations:

```bash
node --version
npm --version
ng version
```

### Clone the repository

```bash
git clone <repository-url>
cd rapidmart-frontend
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
ng serve
```

The application will normally be available at:

```text
http://localhost:4200
```

Make sure the RapidMart backend is also running locally.

---

## Backend Dependency

The frontend requires the RapidMart backend API for most application functionality.

The backend repository is maintained separately:

```text
rapidmart-backend
```

The backend is responsible for:

* Authentication
* Authorization
* Business rules
* Database operations
* Inventory
* Orders
* Payments
* Returns
* Refunds
* Notifications
* Other server-side operations

---

## Current Single-Store Architecture

The current version of RapidMart is designed around a single-store model.

The frontend currently consumes product and inventory availability from the existing backend architecture.

This version represents the **baseline implementation** before introducing multi-store fulfillment.

---

## Planned Multi-Store Architecture

RapidMart is planned to evolve into a location-aware multi-store quick-commerce platform.

The planned product discovery flow is:

```text
User Location
      ↓
Find nearby stores
      ↓
Prioritize closest store
      ↓
Show its available products
      ↓
For missing products
      ↓
Check progressively farther stores
      ↓
Combine availability
      ↓
Show product availability to customer
```

The planned architecture will support:

* Multiple stores
* Store-specific inventory
* Location-aware store selection
* Product availability across stores
* Closest-store prioritization
* Fallback to farther stores
* Multi-store fulfillment
* Mixed-store delivery handling

These changes will be introduced after the current single-store version has been established as the baseline.

---

## Development Approach

RapidMart follows a separation of responsibilities between frontend and backend.

```text
Angular Frontend
       │
       │ API Requests
       ▼
ASP.NET Core Backend
       │
       ├── Business Rules
       ├── Authentication
       ├── Authorization
       ├── Data Access
       └── External Services
```

The frontend focuses on:

* UI
* User interaction
* Navigation
* Client-side state
* API integration
* Displaying backend data
* Real-time UI updates

---

## Project Status

### Completed

* Angular application
* Customer shopping flow
* Authentication
* Product browsing
* Search and filtering
* Cart
* Checkout
* Orders
* Payments
* Returns
* Refunds
* Employee workflows
* Admin workflows
* Inventory management
* Dashboards
* SignalR notifications
* Backend API integration

### In Progress / Planned

* Production deployment
* Multi-store architecture
* Location-aware product availability
* Multi-store fulfillment
* Production infrastructure and scaling

---

## Related Repository

### Backend

`rapidmart-backend`

The backend contains the ASP.NET Core Web API and server-side implementation of RapidMart.

---

## License

This project is currently developed as a portfolio project.

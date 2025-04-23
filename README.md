---

# FleetFriend - Fleet Management System

Created by Hakeem Khan  
![FleetFriend](https://github.com/user-attachments/assets/1ff30541-9e58-4eba-8604-cc858382ca40)

FleetFriend is a full-stack web application designed to manage vehicle bookings, maintenance, and availability. It provides a user-friendly interface for managing vehicles, booking schedules, and maintenance records, along with a robust backend for handling data and logging.

---

## Table of Contents
1. [Features](#1-features)
2. [System Architecture](#2-system-architecture)
3. [Getting Started](#3-getting-started)
4. [Folder Structure](#4-folder-structure)
5. [Frontend Overview](#5-frontend-overview)
6. [Backend Overview](#6-backend-overview)
7. [API Endpoints](#7-api-endpoints)
8. [Development Notes](#8-development-notes)
9. [Future Enhancements](#9-future-enhancements)
10. [License](#10-license)

---

## 1. Features
- Vehicle Management: Add, edit, delete, and view vehicles.
- Booking System: Book vehicles for specific time slots, check availability, and manage bookings.
- Maintenance Tracking: Record and manage maintenance tasks for vehicles.
- Calendar View: Visualize bookings in a calendar format.
- Logging: Comprehensive logging for debugging and monitoring.
- Responsive Design: Optimized for both desktop and mobile devices.

---

## 2. System Architecture

FleetFriend is divided into two main layers:

- **Frontend**: Browser-based interface (HTML, CSS, JavaScript).
- **Backend**: Node.js server with Express.js and MongoDB.

### 2.1 Frontend
- Modules:
  - Dashboard: Manage vehicles.
  - Booking: Handle vehicle bookings.
  - Calendar: Visualize bookings.
  - Maintenance: Manage maintenance records.
- Utilities:
  - DOM manipulation, form handling, date formatting, notifications.

### 2.2 Backend
- Express.js API: Routes for vehicles, bookings, and maintenance.
- MongoDB: Data storage for vehicles and bookings.
- Winston Logger: Logging API requests, errors, and system events.

---

## 3. Getting Started

### 3.1 Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### 3.2 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/HakeemKhan1/FleetFriend.git
   cd FleetFriend
   ```

2. **Install Backend Dependencies**
   ```bash
   npm run install:backend
   ```

3. **Set Up Environment Variables**

   Create a `.env` file inside the `BackEnd/` directory with the following:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fleetfriend
   NODE_ENV=development
   ```

4. **Start the Backend Server**
   ```bash
   npm run dev
   ```

5. **Serve the Frontend**
   ```bash
   cd FrontEnd
   npx http-server
   ```

6. **Open the Application**
   - Backend: [http://localhost:5000](http://localhost:5000)
   - Frontend: [http://127.0.0.1:8080](http://127.0.0.1:8080)

---

## 4. Folder Structure

```
FleetFriend/
├── BackEnd/                
│   ├── config/             # Configuration files
│   ├── controllers/        # API controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   ├── logs/               # Log files
│   └── .env                # Environment variables
├── FrontEnd/               
│   ├── js/                 # JavaScript modules
│   ├── styles.css          # CSS styles
│   └── index.html          # Main HTML file
├── README.md               # Documentation
└── package.json            # Project metadata and scripts  
```

---

## 5. Frontend Overview

### 5.1 Key Modules

- **Dashboard (`dashboard.js`)**: Manage vehicles (add/edit/delete).
- **Booking (`booking.js`)**: Manage bookings, check vehicle availability.
- **Calendar (`calendar.js`)**: View bookings in calendar format.
- **Maintenance (`maintenance.js`)**: Track vehicle maintenance.

### 5.2 Utilities

- **utils.js**: Helper functions for DOM manipulation, forms, date formatting, and notifications.

---

## 6. Backend Overview

### 6.1 Key Components

- **Models**
  - `Vehicle.js`: Vehicle schema.
  - `Booking.js`: Booking schema.

- **Controllers**
  - `vehicleController.js`: CRUD operations for vehicles.
  - `bookingController.js`: Booking management.

- **Routes**
  - `vehicleRoutes.js`: Vehicle-related API endpoints.
  - `bookingRoutes.js`: Booking-related API endpoints.

- **Logger**
  - `logger.js`: Configured with Winston to log API requests, errors, and system events.

---

## 7. API Endpoints

### 7.1 Vehicle Endpoints

| Method | Endpoint            | Description               |
|:------:|:--------------------|:---------------------------|
| GET    | `/api/vehicles`      | Get all vehicles           |
| POST   | `/api/vehicles`      | Create a new vehicle       |
| GET    | `/api/vehicles/:id`  | Get a specific vehicle     |
| PUT    | `/api/vehicles/:id`  | Update a specific vehicle  |
| DELETE | `/api/vehicles/:id`  | Delete a specific vehicle  |

### 7.2 Booking Endpoints

| Method | Endpoint                          | Description                        |
|:------:|:----------------------------------|:----------------------------------|
| GET    | `/api/bookings`                   | Get all bookings                  |
| POST   | `/api/bookings`                   | Create a new booking              |
| POST   | `/api/bookings/availability`      | Check vehicle availability        |
| GET    | `/api/bookings/vehicle/:vehicleId`| Get bookings for a specific vehicle |
| PUT    | `/api/bookings/:id`               | Update a specific booking         |
| DELETE | `/api/bookings/:id`               | Delete a specific booking         |

---

## 8. Development Notes

### 8.1 Logging

Logs are stored inside the `BackEnd/logs/` folder:
- `error.log`: Error logs.
- `combined.log`: All logs.
- `debug.log`: Debug-level logs.

Use `logger.info`, `logger.error`, etc., throughout the backend.

### 8.2 Error Handling

Errors are automatically logged and returned as JSON responses.  
Example:

```json
{
  "message": "Vehicle not found"
}
```

### 8.3 Database

- MongoDB is used for persistent storage.
- Mongoose models define database schemas for vehicles and bookings.

---

## 9. Future Enhancements

- **Authentication**: User authentication and role-based access control.
- **Maintenance API**: Backend endpoints to manage maintenance tasks.
- **Reporting**: Generate reports for vehicle usage and maintenance.
- **Notifications**: Email or SMS reminders for bookings and maintenance.
- **Improved UI**: Enhance frontend visuals and user interactions.

---

## 10. License

This project is licensed under the [MIT License](LICENSE).

---

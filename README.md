# FleetFriend
Fleet Management tool

Created by Hakeem Khan
![image](https://github.com/user-attachments/assets/1ff30541-9e58-4eba-8604-cc858382ca40)

# Vehicle Booking System

This is a full-stack web application for managing vehicles and bookings. The project features a client-server architecture, with a focus on clean organization, modularization, and comprehensive logging.

---

## System Architecture Overview

The system is divided into two main layers: **Client Layer** and **Server Layer**, with dedicated modules for **Configuration & Logging** and **Data Management**.

### Client Layer

- **Browser** loads static assets:
  - `index.html` — Main entry point.
  - `api.js` — Handles API requests.
  - `JS Modules` — Additional JavaScript components.
  - `styles.css` — Styling for the front-end.

- **Communication**:
  - The browser makes **REST API calls** to interact with the server.

### Server Layer

- **Express API Server**:
  - Loads configuration from `.env`.
  - Initializes the logger using `config/logger.js`.
  - Routes API requests through `vehicleRoutes.js` and `bookingRoutes.js`.

- **API Routes**:
  - `vehicleRoutes.js` — Routes related to vehicles.
  - `bookingRoutes.js` — Routes related to bookings.

- **Controllers**:
  - `vehicleController.js` and `bookingController.js` contain the business logic.
  - Controllers interact with the data models to perform database operations.

- **Models**:
  - `Vehicle.js` — Vehicle data structure and database interaction.
  - `Booking.js` — Booking data structure and database interaction.

### Configuration & Logging

- **Configuration**:
  - `.env` contains environment-specific settings.
  - `config/logger.js` sets up the logging configuration.

- **Logger Service**:
  - Centralized service that manages logging across the application.
  - Writes logs to different files:
    - `access.log`
    - `combined.log`
    - `debug.log`
    - `error.log`
    - `exceptions.log`
    - `rejections.log`

### Data Layer

- **Database**:
  - Stores vehicle and booking data.
  - CRUD operations are performed through models.

- **Log Files**:
  - Persistent log storage for application monitoring and debugging.

---

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- A database (e.g., MongoDB, PostgreSQL)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vehicle-booking-system.git
   ```
2. Navigate to the project directory:
   ```bash
   cd vehicle-booking-system
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment variables in a `.env` file.
5. Start the server:
   ```bash
   npm start
   ```

### Folder Structure

```plaintext
.
├── client
│   ├── index.html
│   ├── api.js
│   ├── styles.css
│   └── modules
├── server
│   ├── config
│   │   └── logger.js
│   ├── controllers
│   │   ├── bookingController.js
│   │   └── vehicleController.js
│   ├── models
│   │   ├── Booking.js
│   │   └── Vehicle.js
│   ├── routes
│   │   ├── bookingRoutes.js
│   │   └── vehicleRoutes.js
│   ├── services
│   │   └── loggerService.js
│   └── server.js
├── logs
│   ├── access.log
│   ├── combined.log
│   ├── debug.log
│   ├── error.log
│   ├── exceptions.log
│   └── rejections.log
└── .env
```

---

## License

This project is licensed under the MIT License.

/**
 * API Service for FleetFriend
 * Handles all API calls to the backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

const ApiService = {
    /**
     * Vehicle API Methods
     */
    vehicles: {
        // Get all vehicles
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/vehicles`);
                if (!response.ok) throw new Error('Failed to fetch vehicles');
                return await response.json();
            } catch (error) {
                console.error('Error fetching vehicles:', error);
                throw error;
            }
        },

        // Get a single vehicle by ID
        getById: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
                if (!response.ok) throw new Error('Failed to fetch vehicle');
                return await response.json();
            } catch (error) {
                console.error(`Error fetching vehicle ${id}:`, error);
                throw error;
            }
        },

        // Create a new vehicle
        create: async (vehicleData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/vehicles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(vehicleData),
                });
                if (!response.ok) throw new Error('Failed to create vehicle');
                return await response.json();
            } catch (error) {
                console.error('Error creating vehicle:', error);
                throw error;
            }
        },

        // Update an existing vehicle
        update: async (id, vehicleData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(vehicleData),
                });
                if (!response.ok) throw new Error('Failed to update vehicle');
                return await response.json();
            } catch (error) {
                console.error(`Error updating vehicle ${id}:`, error);
                throw error;
            }
        },

        // Delete a vehicle
        delete: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete vehicle');
                return await response.json();
            } catch (error) {
                console.error(`Error deleting vehicle ${id}:`, error);
                throw error;
            }
        }
    },

    /**
     * Booking API Methods
     */
    bookings: {
        // Get all bookings
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings`);
                if (!response.ok) throw new Error('Failed to fetch bookings');
                return await response.json();
            } catch (error) {
                console.error('Error fetching bookings:', error);
                throw error;
            }
        },

        // Get bookings for a specific vehicle
        getByVehicleId: async (vehicleId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/vehicle/${vehicleId}`);
                if (!response.ok) throw new Error('Failed to fetch vehicle bookings');
                return await response.json();
            } catch (error) {
                console.error(`Error fetching bookings for vehicle ${vehicleId}:`, error);
                throw error;
            }
        },

        // Create a new booking
        create: async (bookingData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData),
                });
                if (!response.ok) {
                     // Throw an error object that includes the response for detailed handling
                     const error = new Error('Failed to create booking');
                     error.response = response;
                     throw error;
                }
                return await response.json();
            } catch (error) {
                console.error('Error creating booking:', error);
                // Check if the error response has a specific message (like conflict)
                if (error.response && error.response.status === 409) {
                    const errorData = await error.response.json();
                    throw new Error(errorData.message || 'Booking conflict detected.');
                }
                throw new Error('Failed to create booking');
            }
        },

        // Update an existing booking
        update: async (id, bookingData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to update booking (status: ${response.status})`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Error updating booking ${id}:`, error);
                throw error;
            }
        },

        // Delete a booking
        delete: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
                    method: 'DELETE',
                });
                 if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to delete booking (status: ${response.status})`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Error deleting booking ${id}:`, error);
                throw error;
            }
        },

        // Check vehicle availability using the backend endpoint
        checkAvailability: async (startDateTime, endDateTime) => {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/availability`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ startDateTime, endDateTime }),
                });
                if (!response.ok) {
                     const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to check availability (status: ${response.status})`);
                }
                return await response.json();
            } catch (error) {
                console.error('Error checking vehicle availability:', error);
                throw error;
            }
        }
    },

    /**
     * Maintenance API Methods (to be implemented in the backend)
     * These are placeholder methods that would connect to future backend endpoints
     */
    maintenance: {
        // Get all maintenance records for a vehicle
        getByVehicleId: async (vehicleId) => {
            try {
                // This would be replaced with an actual API call when the endpoint is available
                // For now, return mock data
                return mockMaintenanceRecords.filter(record => record.vehicleId === vehicleId);
            } catch (error) {
                console.error(`Error fetching maintenance records for vehicle ${vehicleId}:`, error);
                throw error;
            }
        },

        // Create a new maintenance record
        create: async (maintenanceData) => {
            try {
                // This would be replaced with an actual API call when the endpoint is available
                // For now, simulate creating a record
                const newRecord = {
                    ...maintenanceData,
                    _id: `mock_${Date.now()}`,
                    createdAt: new Date().toISOString()
                };
                mockMaintenanceRecords.push(newRecord);
                
                // Update vehicle status to maintenance
                await ApiService.vehicles.update(maintenanceData.vehicleId, { status: 'maintenance' });
                
                return newRecord;
            } catch (error) {
                console.error('Error creating maintenance record:', error);
                throw error;
            }
        },

        // Update a maintenance record
        update: async (id, maintenanceData) => {
            try {
                // This would be replaced with an actual API call when the endpoint is available
                // For now, simulate updating a record
                const index = mockMaintenanceRecords.findIndex(record => record._id === id);
                if (index === -1) throw new Error('Maintenance record not found');
                
                mockMaintenanceRecords[index] = {
                    ...mockMaintenanceRecords[index],
                    ...maintenanceData,
                    updatedAt: new Date().toISOString()
                };
                
                return mockMaintenanceRecords[index];
            } catch (error) {
                console.error(`Error updating maintenance record ${id}:`, error);
                throw error;
            }
        },

        // Delete a maintenance record
        delete: async (id) => {
            try {
                // This would be replaced with an actual API call when the endpoint is available
                // For now, simulate deleting a record
                const index = mockMaintenanceRecords.findIndex(record => record._id === id);
                if (index === -1) throw new Error('Maintenance record not found');
                
                const deletedRecord = mockMaintenanceRecords.splice(index, 1)[0];
                
                // Check if there are any remaining maintenance records for this vehicle
                const remainingRecords = mockMaintenanceRecords.filter(
                    record => record.vehicleId === deletedRecord.vehicleId
                );
                
                // If no more maintenance records, update vehicle status back to available
                if (remainingRecords.length === 0) {
                    await ApiService.vehicles.update(deletedRecord.vehicleId, { status: 'available' });
                }
                
                return { message: 'Maintenance record deleted' };
            } catch (error) {
                console.error(`Error deleting maintenance record ${id}:`, error);
                throw error;
            }
        },

        // Complete a maintenance task and update vehicle status
        complete: async (id) => {
            try {
                // This would be replaced with an actual API call when the endpoint is available
                // For now, simulate completing a maintenance task
                const index = mockMaintenanceRecords.findIndex(record => record._id === id);
                if (index === -1) throw new Error('Maintenance record not found');
                
                mockMaintenanceRecords[index].completed = true;
                mockMaintenanceRecords[index].completedAt = new Date().toISOString();
                
                // Update vehicle status back to available
                await ApiService.vehicles.update(mockMaintenanceRecords[index].vehicleId, { status: 'available' });
                
                return mockMaintenanceRecords[index];
            } catch (error) {
                console.error(`Error completing maintenance record ${id}:`, error);
                throw error;
            }
        }
    }
};

// Mock data for maintenance records until backend implementation
let mockMaintenanceRecords = [
    // Sample records will be added dynamically
];

// Make sure Utils is defined before using it
if (typeof Utils === 'undefined') {
    console.error('Utils is not defined. Make sure utils.js is loaded before api.js');
    // Create a minimal Utils object to prevent errors
    window.Utils = {
        notification: {
            toast: (message, type) => console.log(`[${type}] ${message}`)
        }
    };
}

// Export the API service
window.ApiService = ApiService;

// Log initialization
console.log('API Service initialized');

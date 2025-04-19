/**
 * Dashboard Module for FleetFriend
 * Handles the vehicle dashboard functionality
 */

const Dashboard = (() => {
    // DOM Elements
    const vehiclesContainer = document.querySelector('.vehicles-container');
    const searchInput = document.getElementById('vehicle-search');
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    
    // Vehicle form elements
    const vehicleForm = document.getElementById('vehicle-form');
    const vehicleIdInput = document.getElementById('vehicle-id');
    const vehicleModalTitle = document.getElementById('vehicle-modal-title');
    const cancelVehicleBtn = document.getElementById('cancel-vehicle');
    
    // State
    let vehicles = [];
    let filteredVehicles = [];
    
    /**
     * Initialize the dashboard
     */
    const init = async () => {
        // Set up event listeners
        setupEventListeners();
        
        // Load vehicles
        await loadVehicles();
    };
    
    /**
     * Set up event listeners
     */
    const setupEventListeners = () => {
        // Search input
        searchInput.addEventListener('input', handleSearch);
        
        // Add vehicle button
        addVehicleBtn.addEventListener('click', () => openVehicleModal());
        
        // Vehicle form submission
        vehicleForm.addEventListener('submit', handleVehicleFormSubmit);
        
        // Cancel button
        cancelVehicleBtn.addEventListener('click', () => Utils.modal.close('vehicle-modal'));
    };
    
    /**
     * Load vehicles from API
     */
    const loadVehicles = async () => {
        try {
            // Show loading state
            vehiclesContainer.innerHTML = '<div class="loading">Loading vehicles...</div>';
            
            // Fetch vehicles from API
            vehicles = await ApiService.vehicles.getAll();
            
            // Update filtered vehicles
            filteredVehicles = [...vehicles];
            
            // Render vehicles
            renderVehicles();
        } catch (error) {
            console.error('Error loading vehicles:', error);
            vehiclesContainer.innerHTML = '<div class="error">Failed to load vehicles. Please try again.</div>';
            Utils.notification.toast('Failed to load vehicles', 'error');
        }
    };
    
    /**
     * Render vehicles in the container
     */
    const renderVehicles = () => {
        // Clear container
        Utils.dom.empty(vehiclesContainer);
        
        // Check if there are any vehicles
        if (filteredVehicles.length === 0) {
            vehiclesContainer.innerHTML = '<div class="no-results">No vehicles found</div>';
            return;
        }
        
        // Create vehicle cards
        filteredVehicles.forEach(vehicle => {
            const card = createVehicleCard(vehicle);
            vehiclesContainer.appendChild(card);
        });
    };
    
    /**
     * Create a vehicle card element
     */
    const createVehicleCard = (vehicle) => {
        // Create card container
        const card = Utils.dom.createElement('div', { className: 'vehicle-card' });
        
        // Vehicle image or icon
        const imageContainer = Utils.dom.createElement('div', { className: 'vehicle-image' });
        if (vehicle.images && vehicle.images.length > 0) {
            const img = Utils.dom.createElement('img', { src: vehicle.images[0], alt: `${vehicle.make} ${vehicle.model}` });
            imageContainer.appendChild(img);
        } else {
            const icon = Utils.dom.createElement('i', { className: 'fas fa-car' });
            imageContainer.appendChild(icon);
        }
        card.appendChild(imageContainer);
        
        // Vehicle details
        const details = Utils.dom.createElement('div', { className: 'vehicle-details' });
        
        // Title
        const title = Utils.dom.createElement('h3', { className: 'vehicle-title' }, `${vehicle.make} ${vehicle.model} (${vehicle.year})`);
        details.appendChild(title);
        
        // Status badge
        const statusClass = `status-${vehicle.status}`;
        const statusText = vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1);
        const status = Utils.dom.createElement('span', { className: `vehicle-status ${statusClass}` }, statusText);
        details.appendChild(status);
        
        // Vehicle info
        const info = Utils.dom.createElement('div', { className: 'vehicle-info' });
        
        // License plate
        const license = Utils.dom.createElement('p', {}, `<i class="fas fa-id-card"></i> ${vehicle.licensePlate}`);
        info.appendChild(license);
        
        // Seats
        const seats = Utils.dom.createElement('p', {}, `<i class="fas fa-users"></i> ${vehicle.seats} seats`);
        info.appendChild(seats);
        
        // Parking location
        if (vehicle.parkingLocation) {
            const location = Utils.dom.createElement('p', {}, `<i class="fas fa-map-marker-alt"></i> ${vehicle.parkingLocation}`);
            info.appendChild(location);
        }
        
        // Booking count
        const bookings = Utils.dom.createElement('p', {}, `<i class="fas fa-calendar-check"></i> ${vehicle.bookingCount} bookings`);
        info.appendChild(bookings);
        
        details.appendChild(info);
        
        // Actions
        const actions = Utils.dom.createElement('div', { className: 'vehicle-actions' });
        
        // Edit button
        const editBtn = Utils.dom.createElement('button', { className: 'btn secondary', type: 'button' }, '<i class="fas fa-edit"></i> Edit');
        editBtn.addEventListener('click', () => openVehicleModal(vehicle));
        actions.appendChild(editBtn);
        
        // Delete button
        const deleteBtn = Utils.dom.createElement('button', { className: 'btn danger', type: 'button' }, '<i class="fas fa-trash"></i> Delete');
        deleteBtn.addEventListener('click', () => confirmDeleteVehicle(vehicle));
        actions.appendChild(deleteBtn);
        
        details.appendChild(actions);
        card.appendChild(details);
        
        return card;
    };
    
    /**
     * Handle search input
     */
    const handleSearch = (e) => {
        const searchTerm = e.target.value.trim();
        
        if (searchTerm === '') {
            // If search is empty, show all vehicles
            filteredVehicles = [...vehicles];
        } else {
            // Filter vehicles by search term
            filteredVehicles = Utils.search.filter(vehicles, searchTerm, [
                'make', 'model', 'year', 'licensePlate', 'parkingLocation', 'description'
            ]);
        }
        
        // Re-render vehicles
        renderVehicles();
    };
    
    /**
     * Open vehicle modal for adding or editing
     */
    const openVehicleModal = (vehicle = null) => {
        // Reset form
        Utils.form.reset('vehicle-form');
        
        if (vehicle) {
            // Editing existing vehicle
            vehicleModalTitle.textContent = 'Edit Vehicle';
            vehicleIdInput.value = vehicle._id;
            
            // Populate form with vehicle data
            Utils.form.populate('vehicle-form', {
                'vehicle-make': vehicle.make,
                'vehicle-model': vehicle.model,
                'vehicle-year': vehicle.year,
                'vehicle-license': vehicle.licensePlate,
                'vehicle-seats': vehicle.seats,
                'vehicle-location': vehicle.parkingLocation || '',
                'vehicle-description': vehicle.description || '',
                'vehicle-status': vehicle.status
            });
        } else {
            // Adding new vehicle
            vehicleModalTitle.textContent = 'Add New Vehicle';
            vehicleIdInput.value = '';
        }
        
        // Open modal
        Utils.modal.open('vehicle-modal');
    };
    
    /**
     * Handle vehicle form submission
     */
    const handleVehicleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!Utils.form.validate('vehicle-form')) {
            return;
        }
        
        try {
            // Get form data
            const vehicleId = vehicleIdInput.value;
            const vehicleData = {
                make: document.getElementById('vehicle-make').value,
                model: document.getElementById('vehicle-model').value,
                year: document.getElementById('vehicle-year').value,
                licensePlate: document.getElementById('vehicle-license').value,
                seats: parseInt(document.getElementById('vehicle-seats').value),
                parkingLocation: document.getElementById('vehicle-location').value,
                description: document.getElementById('vehicle-description').value,
                status: document.getElementById('vehicle-status').value
            };
            
            let result;
            
            if (vehicleId) {
                // Update existing vehicle
                result = await ApiService.vehicles.update(vehicleId, vehicleData);
                Utils.notification.toast('Vehicle updated successfully', 'success');
            } else {
                // Create new vehicle
                result = await ApiService.vehicles.create(vehicleData);
                Utils.notification.toast('Vehicle added successfully', 'success');
            }
            
            // Close modal
            Utils.modal.close('vehicle-modal');
            
            // Reload vehicles
            await loadVehicles();
        } catch (error) {
            console.error('Error saving vehicle:', error);
            Utils.notification.toast('Failed to save vehicle', 'error');
        }
    };
    
    /**
     * Confirm vehicle deletion
     */
    const confirmDeleteVehicle = (vehicle) => {
        Utils.confirm.show(
            `Are you sure you want to delete ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})?`,
            () => deleteVehicle(vehicle._id),
            null
        );
    };
    
    /**
     * Delete a vehicle
     */
    const deleteVehicle = async (vehicleId) => {
        try {
            // Delete vehicle from API
            await ApiService.vehicles.delete(vehicleId);
            
            // Show success message
            Utils.notification.toast('Vehicle deleted successfully', 'success');
            
            // Reload vehicles
            await loadVehicles();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            Utils.notification.toast('Failed to delete vehicle', 'error');
        }
    };
    
    // Public API
    return {
        init,
        loadVehicles
    };
})();

// Export the Dashboard module
window.Dashboard = Dashboard;

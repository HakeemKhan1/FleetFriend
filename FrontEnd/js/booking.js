/**
 * Booking Module for FleetFriend
 * Handles the vehicle booking functionality
 */

const Booking = (() => {
    // DOM Elements
    const bookingDateForm = document.getElementById('booking-date-form');
    const startDateInput = document.getElementById('booking-start-date');
    const endDateInput = document.getElementById('booking-end-date');
    const availableVehiclesContainer = document.querySelector('.available-vehicles');
    const vehiclesList = document.querySelector('.vehicles-list');
    
    // Booking form elements
    const bookingForm = document.getElementById('booking-form');
    const bookingVehicleIdInput = document.getElementById('booking-vehicle-id');
    const cancelBookingBtn = document.getElementById('cancel-booking');
    
    // State
    let availableVehicles = [];
    let selectedStartDate = null;
    let selectedEndDate = null;
    
    /**
     * Initialize the booking module
     */
    const init = () => {
        // Set up event listeners
        setupEventListeners();
        
        // Set default date values
        setDefaultDates();
    };
    
    /**
     * Set up event listeners
     */
    const setupEventListeners = () => {
        // Booking date form submission
        bookingDateForm.addEventListener('submit', handleDateFormSubmit);
        
        // Booking form submission
        bookingForm.addEventListener('submit', handleBookingFormSubmit);
        
        // Cancel button
        cancelBookingBtn.addEventListener('click', () => Utils.modal.close('booking-modal'));
    };
    
    /**
     * Set default date values
     */
    const setDefaultDates = () => {
        const now = new Date();
        
        // Set start date to current date and time, rounded to the next hour
        now.setMinutes(0);
        now.setSeconds(0);
        now.setHours(now.getHours() + 1);
        
        const startDate = now.toISOString().slice(0, 16);
        startDateInput.value = startDate;
        
        // Set end date to 2 hours after start date
        const endDate = new Date(now);
        endDate.setHours(endDate.getHours() + 2);
        endDateInput.value = endDate.toISOString().slice(0, 16);
    };
    
    /**
     * Handle date form submission
     */
    const handleDateFormSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!startDateInput.value || !endDateInput.value) {
            Utils.notification.toast('Please select both start and end dates', 'warning');
            return;
        }
        
        // Parse dates
        selectedStartDate = new Date(startDateInput.value);
        selectedEndDate = new Date(endDateInput.value);
        
        // Validate date range
        if (selectedEndDate <= selectedStartDate) {
            Utils.notification.toast('End date must be after start date', 'warning');
            return;
        }
        
        // Check if start date is in the past
        if (selectedStartDate < new Date()) {
            Utils.notification.toast('Start date cannot be in the past', 'warning');
            return;
        }
        
        try {
            // Show loading state
            vehiclesList.innerHTML = '<div class="loading">Checking availability...</div>';
            Utils.dom.show(availableVehiclesContainer);
            
            // Check vehicle availability
            availableVehicles = await ApiService.bookings.checkAvailability(
                selectedStartDate.toISOString(),
                selectedEndDate.toISOString()
            );
            
            // Render available vehicles
            renderAvailableVehicles();
        } catch (error) {
            console.error('Error checking vehicle availability:', error);
            vehiclesList.innerHTML = '<div class="error">Failed to check availability. Please try again.</div>';
            Utils.notification.toast('Failed to check availability', 'error');
        }
    };
    
    /**
     * Render available vehicles
     */
    const renderAvailableVehicles = () => {
        // Clear container
        Utils.dom.empty(vehiclesList);
        
        // Check if there are any available vehicles
        if (availableVehicles.length === 0) {
            vehiclesList.innerHTML = '<div class="no-results">No vehicles available for the selected time period</div>';
            return;
        }
        
        // Create vehicle cards
        availableVehicles.forEach(vehicle => {
            const card = createVehicleCard(vehicle);
            vehiclesList.appendChild(card);
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
        
        details.appendChild(info);
        
        // Book button
        const bookBtn = Utils.dom.createElement('button', { className: 'btn primary', type: 'button' }, 'Book This Vehicle');
        bookBtn.addEventListener('click', () => openBookingModal(vehicle));
        details.appendChild(bookBtn);
        
        card.appendChild(details);
        
        return card;
    };
    
    /**
     * Open booking modal
     */
    const openBookingModal = (vehicle) => {
        // Reset form
        Utils.form.reset('booking-form');
        
        // Set vehicle ID
        bookingVehicleIdInput.value = vehicle._id;
        
        // Open modal
        Utils.modal.open('booking-modal');
    };
    
    /**
     * Handle booking form submission
     */
    const handleBookingFormSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!Utils.form.validate('booking-form')) {
            return;
        }
        
        try {
            // Get form data
            const bookingData = {
                vehicleId: bookingVehicleIdInput.value,
                employeeName: document.getElementById('booking-employee').value,
                email: document.getElementById('booking-email').value,
                projectTitle: document.getElementById('booking-project-title').value,
                projectCode: document.getElementById('booking-project-code').value,
                location: document.getElementById('booking-location').value,
                purpose: document.getElementById('booking-purpose').value,
                startDateTime: selectedStartDate.toISOString(),
                endDateTime: selectedEndDate.toISOString(),
                status: 'active'
            };
            
            // Create booking
            const result = await ApiService.bookings.create(bookingData);
            
            // Close modal
            Utils.modal.close('booking-modal');
            
            // Show success message
            Utils.notification.toast('Vehicle booked successfully', 'success');
            
            // Reset form and hide available vehicles
            Utils.form.reset('booking-date-form');
            Utils.dom.hide(availableVehiclesContainer);
            
            // Reset state
            availableVehicles = [];
            
            // Set default dates
            setDefaultDates();
        } catch (error) {
            console.error('Error creating booking:', error);
            Utils.notification.toast('Failed to book vehicle', 'error');
        }
    };
    
    // Public API
    return {
        init
    };
})();

// Export the Booking module
window.Booking = Booking;

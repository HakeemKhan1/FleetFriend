/**
 * Maintenance Module for FleetFriend
 * Handles the vehicle maintenance functionality
 */

const Maintenance = (() => {
    // DOM Elements
    const vehicleSelect = document.getElementById('maintenance-vehicle-select');
    const recordsList = document.querySelector('.records-list');
    const addMaintenanceBtn = document.getElementById('add-maintenance-btn');
    
    // Maintenance form elements
    const maintenanceForm = document.getElementById('maintenance-form');
    const maintenanceIdInput = document.getElementById('maintenance-id');
    const maintenanceVehicleIdInput = document.getElementById('maintenance-vehicle-id');
    const maintenanceModalTitle = document.getElementById('maintenance-modal-title');
    const cancelMaintenanceBtn = document.getElementById('cancel-maintenance');
    
    // State
    let vehicles = [];
    let maintenanceRecords = [];
    let selectedVehicleId = null;
    
    /**
     * Initialize the maintenance module
     */
    const init = async () => {
        // Set up event listeners
        setupEventListeners();
        
        // Load vehicles
        await loadVehicles();
        
        // Populate vehicle select
        populateVehicleSelect();
    };
    
    /**
     * Set up event listeners
     */
    const setupEventListeners = () => {
        // Vehicle select change
        vehicleSelect.addEventListener('change', handleVehicleChange);
        
        // Add maintenance button
        addMaintenanceBtn.addEventListener('click', () => openMaintenanceModal());
        
        // Maintenance form submission
        maintenanceForm.addEventListener('submit', handleMaintenanceFormSubmit);
        
        // Cancel button
        cancelMaintenanceBtn.addEventListener('click', () => Utils.modal.close('maintenance-modal'));
    };
    
    /**
     * Load vehicles from API
     */
    const loadVehicles = async () => {
        try {
            // Fetch vehicles from API
            vehicles = await ApiService.vehicles.getAll();
        } catch (error) {
            console.error('Error loading vehicles:', error);
            Utils.notification.toast('Failed to load vehicles', 'error');
        }
    };
    
    /**
     * Populate vehicle select dropdown
     */
    const populateVehicleSelect = () => {
        // Clear existing options (except the default)
        while (vehicleSelect.options.length > 1) {
            vehicleSelect.remove(1);
        }
        
        // Add vehicle options
        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle._id;
            option.textContent = `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
            vehicleSelect.appendChild(option);
        });
    };
    
    /**
     * Handle vehicle select change
     */
    const handleVehicleChange = async () => {
        selectedVehicleId = vehicleSelect.value;
        
        if (!selectedVehicleId) {
            // No vehicle selected, clear records
            Utils.dom.empty(recordsList);
            recordsList.innerHTML = '<div class="no-results">Select a vehicle to view maintenance records</div>';
            return;
        }
        
        // Load maintenance records for selected vehicle
        await loadMaintenanceRecords(selectedVehicleId);
    };
    
    /**
     * Load maintenance records for a vehicle
     */
    const loadMaintenanceRecords = async (vehicleId) => {
        try {
            // Show loading state
            recordsList.innerHTML = '<div class="loading">Loading maintenance records...</div>';
            
            // Fetch maintenance records from API
            maintenanceRecords = await ApiService.maintenance.getByVehicleId(vehicleId);
            
            // Render maintenance records
            renderMaintenanceRecords();
        } catch (error) {
            console.error('Error loading maintenance records:', error);
            recordsList.innerHTML = '<div class="error">Failed to load maintenance records. Please try again.</div>';
            Utils.notification.toast('Failed to load maintenance records', 'error');
        }
    };
    
    /**
     * Render maintenance records
     */
    const renderMaintenanceRecords = () => {
        // Clear container
        Utils.dom.empty(recordsList);
        
        // Check if there are any records
        if (maintenanceRecords.length === 0) {
            recordsList.innerHTML = '<div class="no-results">No maintenance records found for this vehicle</div>';
            return;
        }
        
        // Sort records by date (newest first)
        maintenanceRecords.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Create record items
        maintenanceRecords.forEach(record => {
            const recordItem = createRecordItem(record);
            recordsList.appendChild(recordItem);
        });
    };
    
    /**
     * Create a maintenance record item element
     */
    const createRecordItem = (record) => {
        // Create record item container
        const item = Utils.dom.createElement('div', { className: 'record-item' });
        
        // Record header
        const header = Utils.dom.createElement('div', { className: 'record-header' });
        
        // Maintenance type
        const typeText = record.type.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        const type = Utils.dom.createElement('div', { className: 'record-type' }, typeText);
        header.appendChild(type);
        
        // Maintenance date
        const date = Utils.dom.createElement('div', { className: 'record-date' }, Utils.date.formatDate(record.date));
        header.appendChild(date);
        
        item.appendChild(header);
        
        // Record details
        const details = Utils.dom.createElement('div', { className: 'record-details' });
        
        // Description
        const description = Utils.dom.createElement('p', {}, `<strong>Description:</strong> ${record.description}`);
        details.appendChild(description);
        
        // Cost
        const cost = Utils.dom.createElement('p', {}, `<strong>Cost:</strong> $${record.cost.toFixed(2)}`);
        details.appendChild(cost);
        
        // Service provider
        const provider = Utils.dom.createElement('p', {}, `<strong>Service Provider:</strong> ${record.provider}`);
        details.appendChild(provider);
        
        // Completed status
        if (record.completed) {
            const completed = Utils.dom.createElement('p', { className: 'completed-status' }, 
                `<i class="fas fa-check-circle"></i> Completed on ${Utils.date.formatDate(record.completedAt)}`
            );
            details.appendChild(completed);
        }
        
        item.appendChild(details);
        
        // Record actions
        const actions = Utils.dom.createElement('div', { className: 'record-actions' });
        
        // Edit button
        const editBtn = Utils.dom.createElement('button', { className: 'btn secondary', type: 'button' }, '<i class="fas fa-edit"></i> Edit');
        editBtn.addEventListener('click', () => openMaintenanceModal(record));
        actions.appendChild(editBtn);
        
        // Delete button
        const deleteBtn = Utils.dom.createElement('button', { className: 'btn danger', type: 'button' }, '<i class="fas fa-trash"></i> Delete');
        deleteBtn.addEventListener('click', () => confirmDeleteRecord(record));
        actions.appendChild(deleteBtn);
        
        // Complete button (if not completed)
        if (!record.completed) {
            const completeBtn = Utils.dom.createElement('button', { className: 'btn success', type: 'button' }, '<i class="fas fa-check"></i> Mark Complete');
            completeBtn.addEventListener('click', () => completeMaintenanceRecord(record._id));
            actions.appendChild(completeBtn);
        }
        
        item.appendChild(actions);
        
        return item;
    };
    
    /**
     * Open maintenance modal for adding or editing
     */
    const openMaintenanceModal = (record = null) => {
        // Reset form
        Utils.form.reset('maintenance-form');
        
        if (record) {
            // Editing existing record
            maintenanceModalTitle.textContent = 'Edit Maintenance Record';
            maintenanceIdInput.value = record._id;
            maintenanceVehicleIdInput.value = record.vehicleId;
            
            // Populate form with record data
            Utils.form.populate('maintenance-form', {
                'maintenance-date': record.date.split('T')[0], // Extract date part only
                'maintenance-type': record.type,
                'maintenance-description': record.description,
                'maintenance-cost': record.cost,
                'maintenance-provider': record.provider
            });
        } else {
            // Adding new record
            maintenanceModalTitle.textContent = 'Add Maintenance Record';
            maintenanceIdInput.value = '';
            maintenanceVehicleIdInput.value = selectedVehicleId;
            
            // Set default date to today
            document.getElementById('maintenance-date').value = new Date().toISOString().split('T')[0];
        }
        
        // Open modal
        Utils.modal.open('maintenance-modal');
    };
    
    /**
     * Handle maintenance form submission
     */
    const handleMaintenanceFormSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!Utils.form.validate('maintenance-form')) {
            return;
        }
        
        try {
            // Get form data
            const recordId = maintenanceIdInput.value;
            const maintenanceData = {
                vehicleId: maintenanceVehicleIdInput.value,
                date: document.getElementById('maintenance-date').value,
                type: document.getElementById('maintenance-type').value,
                description: document.getElementById('maintenance-description').value,
                cost: parseFloat(document.getElementById('maintenance-cost').value),
                provider: document.getElementById('maintenance-provider').value
            };
            
            let result;
            
            if (recordId) {
                // Update existing record
                result = await ApiService.maintenance.update(recordId, maintenanceData);
                Utils.notification.toast('Maintenance record updated successfully', 'success');
            } else {
                // Create new record
                result = await ApiService.maintenance.create(maintenanceData);
                Utils.notification.toast('Maintenance record added successfully', 'success');
            }
            
            // Close modal
            Utils.modal.close('maintenance-modal');
            
            // Reload maintenance records
            await loadMaintenanceRecords(selectedVehicleId);
        } catch (error) {
            console.error('Error saving maintenance record:', error);
            Utils.notification.toast('Failed to save maintenance record', 'error');
        }
    };
    
    /**
     * Confirm record deletion
     */
    const confirmDeleteRecord = (record) => {
        Utils.confirm.show(
            `Are you sure you want to delete this maintenance record?`,
            () => deleteMaintenanceRecord(record._id),
            null
        );
    };
    
    /**
     * Delete a maintenance record
     */
    const deleteMaintenanceRecord = async (recordId) => {
        try {
            // Delete record from API
            await ApiService.maintenance.delete(recordId);
            
            // Show success message
            Utils.notification.toast('Maintenance record deleted successfully', 'success');
            
            // Reload maintenance records
            await loadMaintenanceRecords(selectedVehicleId);
        } catch (error) {
            console.error('Error deleting maintenance record:', error);
            Utils.notification.toast('Failed to delete maintenance record', 'error');
        }
    };
    
    /**
     * Complete a maintenance record
     */
    const completeMaintenanceRecord = async (recordId) => {
        try {
            // Complete record from API
            await ApiService.maintenance.complete(recordId);
            
            // Show success message
            Utils.notification.toast('Maintenance record marked as complete', 'success');
            
            // Reload maintenance records
            await loadMaintenanceRecords(selectedVehicleId);
        } catch (error) {
            console.error('Error completing maintenance record:', error);
            Utils.notification.toast('Failed to complete maintenance record', 'error');
        }
    };
    
    // Public API
    return {
        init
    };
})();

// Export the Maintenance module
window.Maintenance = Maintenance;

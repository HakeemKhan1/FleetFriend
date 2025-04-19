/**
 * Calendar Module for FleetFriend
 * Handles the booking calendar functionality
 */

const Calendar = (() => {
    // DOM Elements
    const currentMonthElement = document.getElementById('current-month');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const bookingDetailsContainer = document.getElementById('booking-details');
    
    // State
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    let bookings = [];
    
    /**
     * Initialize the calendar
     */
    const init = async () => {
        // Set up event listeners
        setupEventListeners();
        
        // Load bookings
        await loadBookings();
        
        // Generate calendar
        generateCalendar();
    };
    
    /**
     * Set up event listeners
     */
    const setupEventListeners = () => {
        // Previous month button
        prevMonthBtn.addEventListener('click', () => {
            navigateMonth(-1);
        });
        
        // Next month button
        nextMonthBtn.addEventListener('click', () => {
            navigateMonth(1);
        });
    };
    
    /**
     * Load bookings from API
     */
    const loadBookings = async () => {
        try {
            // Fetch bookings from API
            bookings = await ApiService.bookings.getAll();
        } catch (error) {
            console.error('Error loading bookings:', error);
            Utils.notification.toast('Failed to load bookings', 'error');
        }
    };
    
    /**
     * Navigate to previous or next month
     */
    const navigateMonth = (direction) => {
        // Update current month
        currentMonth += direction;
        
        // Handle year change
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        
        // Regenerate calendar
        generateCalendar();
    };
    
    /**
     * Generate calendar for current month
     */
    const generateCalendar = () => {
        // Update month display
        currentMonthElement.textContent = `${Utils.date.getMonthName(currentMonth)} ${currentYear}`;
        
        // Clear calendar grid
        Utils.dom.empty(calendarGrid);
        
        // Get days in month and first day of month
        const daysInMonth = Utils.date.getDaysInMonth(currentYear, currentMonth);
        const firstDayOfMonth = Utils.date.getFirstDayOfMonth(currentYear, currentMonth);
        
        // Get previous month's days for filling in the first week
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = Utils.date.getDaysInMonth(prevMonthYear, prevMonth);
        
        // Generate days for previous month (if needed)
        for (let i = 0; i < firstDayOfMonth; i++) {
            const day = daysInPrevMonth - firstDayOfMonth + i + 1;
            const dayElement = createDayElement(day, 'other-month', prevMonthYear, prevMonth);
            calendarGrid.appendChild(dayElement);
        }
        
        // Generate days for current month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentDay(day);
            const dayElement = createDayElement(day, isToday ? 'today' : '', currentYear, currentMonth);
            calendarGrid.appendChild(dayElement);
        }
        
        // Fill in remaining days from next month
        const totalDaysDisplayed = firstDayOfMonth + daysInMonth;
        const remainingDays = 42 - totalDaysDisplayed; // 6 rows of 7 days
        
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = createDayElement(day, 'other-month', nextMonthYear, nextMonth);
            calendarGrid.appendChild(dayElement);
        }
    };
    
    /**
     * Create a day element for the calendar
     */
    const createDayElement = (day, additionalClass = '', year, month) => {
        // Create day element
        const dayElement = Utils.dom.createElement('div', { 
            className: `calendar-day ${additionalClass}`,
            dataset: { day, month, year }
        });
        
        // Add day number
        const dayNumber = Utils.dom.createElement('div', { className: 'day-number' }, day);
        dayElement.appendChild(dayNumber);
        
        // Check if day has bookings
        const hasBookings = checkDayHasBookings(year, month, day);
        if (hasBookings) {
            dayElement.classList.add('has-bookings');
        }
        
        // Add click event to show bookings for this day
        dayElement.addEventListener('click', () => showBookingsForDay(year, month, day));
        
        return dayElement;
    };
    
    /**
     * Check if current day matches today's date
     */
    const isCurrentDay = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };
    
    /**
     * Check if a day has any bookings
     */
    const checkDayHasBookings = (year, month, day) => {
        // Create date objects for start and end of the day
        const startOfDay = new Date(year, month, day, 0, 0, 0).getTime();
        const endOfDay = new Date(year, month, day, 23, 59, 59).getTime();
        
        // Check if any booking falls on this day
        return bookings.some(booking => {
            // Skip cancelled bookings
            if (booking.status === 'cancelled') return false;
            
            const bookingStart = new Date(booking.startDateTime).getTime();
            const bookingEnd = new Date(booking.endDateTime).getTime();
            
            // Check if booking overlaps with this day
            return (
                (bookingStart >= startOfDay && bookingStart <= endOfDay) || // Booking starts on this day
                (bookingEnd >= startOfDay && bookingEnd <= endOfDay) || // Booking ends on this day
                (bookingStart <= startOfDay && bookingEnd >= endOfDay) // Booking spans over this day
            );
        });
    };
    
    /**
     * Show bookings for a specific day
     */
    const showBookingsForDay = (year, month, day) => {
        // Create date objects for start and end of the day
        const startOfDay = new Date(year, month, day, 0, 0, 0).getTime();
        const endOfDay = new Date(year, month, day, 23, 59, 59).getTime();
        
        // Filter bookings for this day
        const dayBookings = bookings.filter(booking => {
            // Skip cancelled bookings
            if (booking.status === 'cancelled') return false;
            
            const bookingStart = new Date(booking.startDateTime).getTime();
            const bookingEnd = new Date(booking.endDateTime).getTime();
            
            // Check if booking overlaps with this day
            return (
                (bookingStart >= startOfDay && bookingStart <= endOfDay) || // Booking starts on this day
                (bookingEnd >= startOfDay && bookingEnd <= endOfDay) || // Booking ends on this day
                (bookingStart <= startOfDay && bookingEnd >= endOfDay) // Booking spans over this day
            );
        });
        
        // Show booking details
        renderBookingDetails(dayBookings, new Date(year, month, day));
    };
    
    /**
     * Render booking details for a specific day
     */
    const renderBookingDetails = (dayBookings, date) => {
        // Clear container
        Utils.dom.empty(bookingDetailsContainer);
        
        // Create header
        const header = Utils.dom.createElement('h3', {}, `Bookings for ${Utils.date.formatDate(date)}`);
        bookingDetailsContainer.appendChild(header);
        
        // Check if there are any bookings
        if (dayBookings.length === 0) {
            const noBookings = Utils.dom.createElement('p', { className: 'no-results' }, 'No bookings for this day');
            bookingDetailsContainer.appendChild(noBookings);
        } else {
            // Create booking list
            const bookingList = Utils.dom.createElement('div', { className: 'booking-list' });
            
            // Sort bookings by start time
            dayBookings.sort((a, b) => {
                return new Date(a.startDateTime) - new Date(b.startDateTime);
            });
            
            // Create booking items
            dayBookings.forEach(booking => {
                const bookingItem = createBookingItem(booking);
                bookingList.appendChild(bookingItem);
            });
            
            bookingDetailsContainer.appendChild(bookingList);
        }
        
        // Show booking details container
        Utils.dom.show(bookingDetailsContainer);
    };
    
    /**
     * Create a booking item element
     */
    const createBookingItem = (booking) => {
        // Create booking item container
        const item = Utils.dom.createElement('div', { className: 'booking-item' });
        
        // Booking header
        const header = Utils.dom.createElement('div', { className: 'booking-item-header' });
        
        // Vehicle info (if available)
        let vehicleInfo = 'Vehicle information not available';
        if (booking.vehicleId && typeof booking.vehicleId === 'object') {
            const vehicle = booking.vehicleId;
            vehicleInfo = `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
        }
        
        // Vehicle name
        const vehicleName = Utils.dom.createElement('div', { className: 'booking-vehicle' }, vehicleInfo);
        header.appendChild(vehicleName);
        
        // Booking time
        const timeText = `${Utils.date.formatTime(booking.startDateTime)} - ${Utils.date.formatTime(booking.endDateTime)}`;
        const time = Utils.dom.createElement('div', { className: 'booking-time' }, timeText);
        header.appendChild(time);
        
        item.appendChild(header);
        
        // Booking details
        const details = Utils.dom.createElement('div', { className: 'booking-details' });
        
        // Employee
        const employee = Utils.dom.createElement('p', {}, `<strong>Employee:</strong> ${booking.employeeName}`);
        details.appendChild(employee);
        
        // Project
        const project = Utils.dom.createElement('p', {}, `<strong>Project:</strong> ${booking.projectTitle} (${booking.projectCode})`);
        details.appendChild(project);
        
        // Location
        const location = Utils.dom.createElement('p', {}, `<strong>Location:</strong> ${booking.location}`);
        details.appendChild(location);
        
        // Purpose
        const purpose = Utils.dom.createElement('p', {}, `<strong>Purpose:</strong> ${booking.purpose}`);
        details.appendChild(purpose);
        
        item.appendChild(details);
        
        return item;
    };
    
    // Public API
    return {
        init
    };
})();

// Export the Calendar module
window.Calendar = Calendar;

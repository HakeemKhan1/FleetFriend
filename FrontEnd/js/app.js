/**
 * Main Application Module for FleetFriend
 * Initializes and coordinates all modules
 */

const App = (() => {
    // DOM Elements
    let navItems;
    let pages;
    
    // State
    let currentPage = 'dashboard';
    let initialized = false;
    
    /**
     * Initialize the application
     */
    const init = async () => {
        // Prevent multiple initializations
        if (initialized) {
            console.log('Application already initialized');
            return;
        }
        
        console.log('Initializing FleetFriend application...');
        
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState !== 'complete') {
                console.log('DOM not ready, waiting...');
                return;
            }
            
            // Get DOM elements
            navItems = document.querySelectorAll('.nav-item');
            pages = document.querySelectorAll('.page');
            
            if (!navItems.length || !pages.length) {
                console.error('Required DOM elements not found');
                return;
            }
            
            // Set up navigation
            setupNavigation();
            
            // Initialize modules
            await initializeModules();
            
            // Mark as initialized
            initialized = true;
            console.log('FleetFriend application initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    };
    
    /**
     * Set up navigation
     */
    const setupNavigation = () => {
        // Add click event to each nav item
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                navigateTo(page);
            });
        });
        
        // Set initial page
        navigateTo(currentPage);
    };
    
    /**
     * Navigate to a page
     */
    const navigateTo = (page) => {
        // Update current page
        currentPage = page;
        
        // Update active nav item
        navItems.forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Show selected page, hide others
        pages.forEach(pageElement => {
            if (pageElement.id === `${page}-page`) {
                Utils.dom.show(pageElement);
            } else {
                Utils.dom.hide(pageElement);
            }
        });
    };
    
    /**
     * Initialize all modules
     */
    const initializeModules = async () => {
        try {
            // Initialize Dashboard module
            await Dashboard.init();
            console.log('Dashboard module initialized');
            
            // Initialize Booking module
            Booking.init();
            console.log('Booking module initialized');
            
            // Initialize Calendar module
            await Calendar.init();
            console.log('Calendar module initialized');
            
            // Initialize Maintenance module
            await Maintenance.init();
            console.log('Maintenance module initialized');
        } catch (error) {
            console.error('Error initializing modules:', error);
            Utils.notification.toast('Failed to initialize application', 'error');
        }
    };
    
    // Public API
    return {
        init
    };
})();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Delay initialization slightly to ensure all scripts are loaded
    setTimeout(() => {
        App.init().catch(error => {
            console.error('Failed to initialize application:', error);
        });
    }, 100);
});

// Prevent multiple initializations if script is loaded more than once
if (window.appInitialized) {
    console.warn('App script loaded more than once');
} else {
    window.appInitialized = true;
}

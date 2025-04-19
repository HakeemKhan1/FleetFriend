/**
 * Utility functions for FleetFriend
 */

const Utils = {
    /**
     * DOM manipulation helpers
     */
    dom: {
        // Get element by ID
        getById: (id) => document.getElementById(id),
        
        // Create element with optional attributes and content
        createElement: (tag, attributes = {}, content = '') => {
            const element = document.createElement(tag);
            
            // Set attributes
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'dataset') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            // Set content
            if (content) {
                element.innerHTML = content;
            }
            
            return element;
        },
        
        // Empty an element
        empty: (element) => {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        },
        
        // Show an element
        show: (element) => {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            element.classList.remove('hidden');
        },
        
        // Hide an element
        hide: (element) => {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            element.classList.add('hidden');
        },
        
        // Toggle element visibility
        toggle: (element) => {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            element.classList.toggle('hidden');
        }
    },
    
    /**
     * Modal helpers
     */
    modal: {
        // Open a modal
        open: (modalId) => {
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
            
            // Add event listeners for closing
            const closeButtons = modal.querySelectorAll('.close-modal');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => Utils.modal.close(modalId));
            });
            
            // Close when clicking outside the modal content
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Utils.modal.close(modalId);
                }
            });
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    Utils.modal.close(modalId);
                }
            });
        },
        
        // Close a modal
        close: (modalId) => {
            const modal = document.getElementById(modalId);
            modal.classList.remove('active');
        }
    },
    
    /**
     * Form helpers
     */
    form: {
        // Get form data as an object
        getData: (formId) => {
            const form = document.getElementById(formId);
            const formData = new FormData(form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            return data;
        },
        
        // Populate form with data
        populate: (formId, data) => {
            const form = document.getElementById(formId);
            
            Object.entries(data).forEach(([key, value]) => {
                const input = form.elements[key] || document.getElementById(key);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else if (input.type === 'radio') {
                        const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                        if (radio) radio.checked = true;
                    } else {
                        input.value = value;
                    }
                }
            });
        },
        
        // Reset a form
        reset: (formId) => {
            const form = document.getElementById(formId);
            form.reset();
        },
        
        // Validate form data
        validate: (formId) => {
            const form = document.getElementById(formId);
            return form.checkValidity();
        }
    },
    
    /**
     * Date and time helpers
     */
    date: {
        // Format date for display
        format: (dateString, options = {}) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                ...options
            });
        },
        
        // Format date without time
        formatDate: (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        // Format time only
        formatTime: (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // Get month name
        getMonthName: (month) => {
            const date = new Date();
            date.setMonth(month);
            return date.toLocaleString('en-US', { month: 'long' });
        },
        
        // Get days in month
        getDaysInMonth: (year, month) => {
            return new Date(year, month + 1, 0).getDate();
        },
        
        // Get first day of month (0 = Sunday, 6 = Saturday)
        getFirstDayOfMonth: (year, month) => {
            return new Date(year, month, 1).getDay();
        }
    },
    
    /**
     * Notification helpers
     */
    notification: {
        // Show a toast notification
        toast: (message, type = 'info', duration = 3000) => {
            const toast = document.getElementById('toast');
            
            // Clear any existing classes
            toast.className = 'toast';
            
            // Add the type class
            toast.classList.add(type);
            
            // Set the message
            toast.textContent = message;
            
            // Show the toast
            toast.classList.add('show');
            
            // Hide after duration
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }
    },
    
    /**
     * Confirmation dialog
     */
    confirm: {
        // Show a confirmation dialog
        show: (message, onConfirm, onCancel) => {
            const dialog = document.getElementById('confirm-dialog');
            const messageElement = document.getElementById('confirm-message');
            const confirmButton = document.getElementById('confirm-action');
            const cancelButton = document.getElementById('cancel-confirm');
            
            // Set the message
            messageElement.textContent = message;
            
            // Open the dialog
            Utils.modal.open('confirm-dialog');
            
            // Set up the confirm button
            const confirmHandler = () => {
                Utils.modal.close('confirm-dialog');
                confirmButton.removeEventListener('click', confirmHandler);
                cancelButton.removeEventListener('click', cancelHandler);
                if (onConfirm) onConfirm();
            };
            
            // Set up the cancel button
            const cancelHandler = () => {
                Utils.modal.close('confirm-dialog');
                confirmButton.removeEventListener('click', confirmHandler);
                cancelButton.removeEventListener('click', cancelHandler);
                if (onCancel) onCancel();
            };
            
            // Add event listeners
            confirmButton.addEventListener('click', confirmHandler);
            cancelButton.addEventListener('click', cancelHandler);
        }
    },
    
    /**
     * Search and filter helpers
     */
    search: {
        // Filter an array of objects by search term
        filter: (array, searchTerm, fields) => {
            if (!searchTerm) return array;
            
            searchTerm = searchTerm.toLowerCase();
            
            return array.filter(item => {
                return fields.some(field => {
                    const value = item[field];
                    if (value === null || value === undefined) return false;
                    return value.toString().toLowerCase().includes(searchTerm);
                });
            });
        }
    }
};

// Check if Utils is already defined (to prevent multiple initializations)
if (typeof window.Utils !== 'undefined') {
    console.warn('Utils is already defined. Skipping re-initialization.');
} else {
    // Export the Utils object
    window.Utils = Utils;
    console.log('Utils initialized');
}

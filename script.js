// --- Cart Utility Functions ---

/**
 * Retrieves the cart array from localStorage. 
 * Returns an empty array if nothing is found.
 * @returns {Array<Object>} The cart array.
 */
function getCart() {
    const cart = localStorage.getItem('shoppingCart');
    // Important: Parse JSON string back into a JS array.
    return cart ? JSON.parse(cart) : [];
}

/**
 * Saves the current cart array to localStorage.
 * @param {Array<Object>} cart - The cart array to save.
 */
function saveCart(cart) {
    // Important: Convert JS array to a JSON string before saving.
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

/**
 * Updates the total item count displayed in the navbar.
 */
function updateCartCount() {
    const cart = getCart();
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = cart.length;
    }
}

// --- Product Page Logic (`index.html`) ---

/**
 * Toggles the state of an "Add to Cart" button based on cart content.
 * @param {HTMLElement} button - The button element.
 * @param {string} productId - The ID of the product.
 */
function toggleButtonState(button, productId) {
    const cart = getCart();
    // Check if ANY item in the cart has the matching productId
    const isInCart = cart.some(item => item.id === productId); 

    if (isInCart) {
        // State: Added to Cart (Green, Disabled)
        button.textContent = "Added to Cart";
        button.classList.add('added-to-cart');
        button.disabled = true; 
    } else {
        // State: Add to Cart (Blue, Enabled)
        button.textContent = "Add to Cart";
        button.classList.remove('added-to-cart');
        button.disabled = false;
    }
}

/**
 * Sets up event listeners for all "Add to Cart" buttons and initializes their state.
 */
function initProductPage() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    
    buttons.forEach(button => {
        const productDiv = button.closest('.product');
        const productId = productDiv.dataset.id;
        const productName = productDiv.dataset.name;
        const productPrice = parseFloat(productDiv.dataset.price);

        // 1. Initialize button state on page load
        toggleButtonState(button, productId);

        // 2. Add click listener
        button.addEventListener('click', () => {
            let cart = getCart();
            
            const productToAdd = {
                id: productId,
                name: productName,
                // Price is stored as a number, but we ensure it's correct
                price: productPrice
            };
            
            // This logic only allows adding a product once, as dictated by
            // the button's disabled state set by toggleButtonState().
            cart.push(productToAdd);

            saveCart(cart); // Persist the change
            updateCartCount();
            toggleButtonState(button, productId); // Update button state
        });
    });
}

// --- Cart Page Logic (`cart.html`) ---

/**
 * Removes a product from the cart by its ID and re-renders the list.
 * @param {string} productId - The ID of the product to remove.
 */
function removeFromCart(productId) {
    let cart = getCart();
    
    // Find the index of the FIRST item with the matching ID
    const indexToRemove = cart.findIndex(item => item.id === productId);
    
    if (indexToRemove > -1) {
        cart.splice(indexToRemove, 1); // Remove one item at that index
    }

    saveCart(cart); // Persist the change
    updateCartCount();
    renderCart(); // Re-render the cart list
}

/**
 * Renders the cart items on the cart page.
 */
function renderCart() {
    const cart = getCart();
    const cartList = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    // Safety check to ensure we are on the correct page
    if (!cartList || !totalElement) return;

    cartList.innerHTML = ''; // Clear existing list
    let total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = '<li>Your cart is empty.</li>';
        totalElement.textContent = '0.00';
        return;
    }

    cart.forEach(item => {
        // Calculate total
        total += item.price;

        // Create list item element
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${item.name} - **$${item.price.toFixed(2)}**
            <button class="remove-from-cart-btn" data-id="${item.id}">Remove</button>
        `;
        cartList.appendChild(listItem);
    });

    // Display total (formatted to two decimal places)
    totalElement.textContent = total.toFixed(2);

    // Add event listeners to the new 'Remove' buttons (must be done after rendering)
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            removeFromCart(productId);
            // Note: If you want the index.html buttons to update instantly, 
            // you'd need a more advanced system (like custom events).
        });
    });
}

// --- Initialization Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // This runs first on every page load to ensure the count is accurate
    updateCartCount(); 
    
    // Check the full URL (window.location.href) for reliability in local testing
    const url = window.location.href.toLowerCase();
    
    if (url.includes('index.html') || url.endsWith('/')) {
        // This is the product page
        initProductPage();
    } else if (url.includes('cart.html')) {
        // This is the shopping cart page
        renderCart();
    }
});

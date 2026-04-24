// --- Menu Data ---
let menuItems = [];

const defaultMenuItems = [
    { id: 1, name: "Brown Sugar Boba", category: "boba", price: 5.50, image: "assets/images/boba.png", description: "Classic milk tea with sweet brown sugar syrup and chewy tapioca pearls.", onSale: false, discount: 0 },
    { id: 2, name: "Matcha Float", category: "boba", price: 6.00, image: "assets/images/hero.png", description: "Premium matcha green tea topped with a scoop of vanilla ice cream.", onSale: false, discount: 0 },
    { id: 3, name: "Taro Milk Tea", category: "boba", price: 5.00, image: "assets/images/boba.png", description: "Creamy and sweet taro root blended into a refreshing milk tea.", onSale: false, discount: 0 },
    { id: 4, name: "Iced Vanilla Latte", category: "coffee", price: 4.80, image: "assets/images/coffee.png", description: "Smooth espresso poured over ice and sweet vanilla syrup, topped with milk.", onSale: false, discount: 0 },
    { id: 5, name: "Cold Brew", category: "coffee", price: 4.50, image: "assets/images/coffee.png", description: "Slow-steeped cold brew coffee for a smooth, bold flavor without the bitterness.", onSale: false, discount: 0 },
    { id: 6, name: "Mocha Frappuccino", category: "coffee", price: 5.50, image: "assets/images/coffee.png", description: "Rich espresso blended with ice, milk, and chocolate syrup.", onSale: false, discount: 0 },
    { id: 7, name: "Strawberry Cheesecake", category: "dessert", price: 6.50, image: "assets/images/hero.png", description: "Creamy New York style cheesecake topped with fresh strawberry compote.", onSale: false, discount: 0 },
    { id: 8, name: "Matcha Crepe Cake", category: "dessert", price: 7.00, image: "assets/images/hero.png", description: "Layers of delicate crepes separated by light matcha cream.", onSale: false, discount: 0 }
];

function initMenuData() {
    const stored = localStorage.getItem('bouba_menuItems');
    if (stored) {
        menuItems = JSON.parse(stored);
    } else {
        menuItems = [...defaultMenuItems];
        localStorage.setItem('bouba_menuItems', JSON.stringify(menuItems));
    }
}

// --- Global Variables ---
let cart = JSON.parse(localStorage.getItem('bouba_cart')) || [];
const phoneNumber = "1234567890"; // Dummy WhatsApp Number

// --- DOM Elements ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const menuContainer = document.getElementById('menu-container');
const filterContainer = document.getElementById('filter-container');
const searchInput = document.getElementById('search-input');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartBadges = document.querySelectorAll('.cart-count');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const whatsappBtn = document.getElementById('whatsapp-order-btn');

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('bouba_theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        updateThemeIcon(true);
    }
    
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            localStorage.setItem('bouba_theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }
}

function updateThemeIcon(isDark) {
    if(!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (isDark) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// --- Menu Rendering & Filtering ---
function renderMenu(items) {
    if (!menuContainer) return;
    
    menuContainer.innerHTML = '';
    
    if(items.length === 0) {
        menuContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-light);">No items found.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'drink-card fade-in';
        
        let priceHTML = '';
        let finalPrice = Number(item.price);
        let badgeHTML = '';

        if (item.onSale && item.discount > 0) {
            finalPrice = item.price - (item.price * (item.discount / 100));
            badgeHTML = `<div style="position: absolute; top: 10px; right: 10px; background: #ff4d4d; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-weight: bold; font-size: 0.8rem; z-index: 10;">SALE 🔥 -${item.discount}%</div>`;
            priceHTML = `
                <span style="text-decoration: line-through; color: var(--text-light); font-size: 0.9rem; margin-right: 10px;">$${Number(item.price).toFixed(2)}</span>
                <span>$${finalPrice.toFixed(2)}</span>
            `;
        } else {
            priceHTML = `<span>$${Number(item.price).toFixed(2)}</span>`;
        }

        card.innerHTML = `
            ${badgeHTML}
            <div class="drink-img-wrap">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <h3 class="drink-name">${item.name}</h3>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1rem; height: 40px; overflow: hidden;">${item.description}</p>
            <div class="drink-price">${priceHTML}</div>
            <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                <i class="fa-solid fa-plus"></i> Add to Cart
            </button>
        `;
        menuContainer.appendChild(card);
    });
}

function initFilters() {
    if (!filterContainer || !searchInput) return;

    // Category Filter
    const filterBtns = filterContainer.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active class
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const category = e.target.dataset.filter;
            filterMenu(category, searchInput.value);
        });
    });

    // Search Filter
    searchInput.addEventListener('input', (e) => {
        const activeCategory = filterContainer.querySelector('.active').dataset.filter;
        filterMenu(activeCategory, e.target.value);
    });
}

function filterMenu(category, searchTerm) {
    let filtered = menuItems;

    if (category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
    }

    if (searchTerm.trim() !== '') {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(lowerTerm) || 
            item.description.toLowerCase().includes(lowerTerm)
        );
    }

    renderMenu(filtered);
}

// --- Cart Management ---
function addToCart(itemId) {
    const item = menuItems.find(i => i.id == itemId);
    if (!item) return;

    let finalPrice = Number(item.price);
    if (item.onSale && item.discount > 0) {
        finalPrice = item.price - (item.price * (item.discount / 100));
    }

    const existingItem = cart.find(i => i.id == itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, price: finalPrice, originalPrice: item.price, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    
    // Quick visual feedback (optional)
    cartBadges.forEach(badge => {
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    });
}

function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('bouba_cart', JSON.stringify(cart));
}

function updateCartUI() {
    if (!cartItemsContainer || !cartBadges) return;

    // Update badges
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadges.forEach(badge => badge.textContent = totalItems);

    // Update Sidebar
    // Keep the empty cart message element but remove other items
    const children = Array.from(cartItemsContainer.children);
    children.forEach(child => {
        if (child.id !== 'empty-cart-msg') {
            child.remove();
        }
    });

    if (cart.length === 0) {
        emptyCartMsg.classList.add('active');
        cartTotalPrice.textContent = '$0.00';
    } else {
        emptyCartMsg.classList.remove('active');
        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item';
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <span class="price">$${item.price.toFixed(2)} x ${item.quantity}</span>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            // Insert before the empty message
            cartItemsContainer.insertBefore(cartItemEl, emptyCartMsg);
        });

        cartTotalPrice.textContent = `$${total.toFixed(2)}`;
    }
}

// --- Cart Sidebar Toggle ---
function initCartToggle() {
    if (!cartBtn || !closeCart || !cartOverlay) return;

    function openSidebar() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeSidebar() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    cartBtn.addEventListener('click', openSidebar);
    closeCart.addEventListener('click', closeSidebar);
    cartOverlay.addEventListener('click', closeSidebar);
}

// --- WhatsApp Integration ---
function initWhatsAppOrder() {
    if (!whatsappBtn) return;

    whatsappBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty! Please add some items before ordering.');
            return;
        }

        let message = "Hello Bouba Cafe! I'd like to place an order:%0A%0A";
        let total = 0;

        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})%0A`;
            total += item.price * item.quantity;
        });

        message += `%0A*Total: $${total.toFixed(2)}*%0A%0A`;
        message += "Please let me know how long it will take. Thank you!";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenuData();
    
    // Only run menu functions if we are on the menu page
    if (menuContainer) {
        renderMenu(menuItems);
        initFilters();
    }
    
    // Always init cart UI so the badge is correct on all pages
    updateCartUI();
    initCartToggle();
    initWhatsAppOrder();
});

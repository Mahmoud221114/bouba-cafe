// --- Default Data & LocalStorage ---
let menuItems = [];

const defaultMenuItems = [
    { id: 1, name: "موهيتو الليمون",        category: "mojito",    price: 45,  image: "assets/images/mojito_lemon.jpg",          description: "موهيتو منعش بالليمون والنعناع الطازج.",              onSale: false, discount: 0, inStock: true },
    { id: 2, name: "سموثي مانجو",            category: "smoothie",  price: 55,  image: "assets/images/mango_smoothie.jpg",         description: "سموثي المانجو الطازج بنكهة استوائية رائعة.",         onSale: false, discount: 0, inStock: true },
    { id: 3, name: "آيس تي باشن فروت",       category: "icetea",    price: 45,  image: "assets/images/passion_fruit_icetea.jpg",   description: "شاي مثلج بنكهة الباشن فروت المنعشة.",               onSale: false, discount: 0, inStock: true },
    { id: 4, name: "بوبا فراولة ماتشا",      category: "bobamix",   price: 65,  image: "assets/images/strawberry_matcha.jpg",      description: "مزيج رائع من الفراولة والماتشا مع حبات البوبا.",    onSale: false, discount: 0, inStock: true },
    { id: 5, name: "ميلك شيك شوكولاتة",      category: "milkshake", price: 60,  image: "assets/images/coffee.png",                 description: "ميلك شيك غني بالشوكولاتة والكريمة.",               onSale: false, discount: 0, inStock: true },
    { id: 6, name: "آيس لاتيه فانيليا",      category: "icecoffee", price: 55,  image: "assets/images/coffee.png",                 description: "إسبريسو مع الثلج وشراب الفانيليا الحلو.",          onSale: false, discount: 0, inStock: true },
    { id: 7, name: "فرابيه كراميل",           category: "frappe",    price: 65,  image: "assets/images/caramel_frappe.jpg",         description: "فرابيه الكراميل الغني مع حبات البوبا.",            onSale: false, discount: 0, inStock: true },
    { id: 8, name: "ماتشا فلوت",              category: "matcha",    price: 60,  image: "assets/images/strawberry_matcha.jpg",      description: "شاي الماتشا الأخضر الفاخر مغطى بآيس كريم.",       onSale: false, discount: 0, inStock: true }
];

const DATA_VERSION = 'v2'; // غيّر هذا لإعادة ضبط البيانات

function initMenuData() {
    const savedVersion = localStorage.getItem('bouba_data_version');
    const stored = localStorage.getItem('bouba_menuItems_ar');

    // إذا تغيّر الإصدار أو لا توجد بيانات، أعد الضبط
    if (!stored || savedVersion !== DATA_VERSION) {
        menuItems = [...defaultMenuItems];
        localStorage.setItem('bouba_menuItems_ar', JSON.stringify(menuItems));
        localStorage.setItem('bouba_data_version', DATA_VERSION);
    } else {
        menuItems = JSON.parse(stored);
    }
}

// --- Global Variables ---
let cart = JSON.parse(localStorage.getItem('bouba_cart_ar')) || [];
const phoneNumber = "1234567890"; // Dummy WhatsApp Number

// --- DOM Elements ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const menuContainer = document.getElementById('menu-container');
const filterContainer = document.getElementById('filter-container');
const searchInput = document.getElementById('search-input');
const cartBadges = document.querySelectorAll('.cart-count');
const toastContainer = document.getElementById('toast-container');

// Elements for cart.html
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const cartSummaryBox = document.getElementById('cart-summary-box');
const summaryCount = document.getElementById('summary-count');
const summaryTotalPrice = document.getElementById('summary-total-price');
const whatsappBtn = document.getElementById('whatsapp-order-btn');

// Elements for Mobile Menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

function initMobileMenu() {
    if(mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if(navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

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

// --- Toast Notifications ---
function showToast(message, iconClass = 'fa-check-circle', color = 'var(--primary-color)') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color: ${color};"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Scroll Animations Observer ---
let scrollObserver;
function initScrollObserver() {
    scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });
}

function observeElements(elements) {
    if(!scrollObserver) return;
    elements.forEach(el => scrollObserver.observe(el));
}

// --- Menu Rendering & Filtering ---
function renderMenu(items) {
    if (!menuContainer) return;
    
    menuContainer.innerHTML = '';
    
    if(items.length === 0) {
        menuContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-light); font-size: 1.2rem;">لا توجد منتجات مطابقة للبحث.</p>';
        return;
    }

    items.forEach(item => {
        const isOut = item.inStock === false;
        const cardClass = isOut ? 'drink-card fade-in out-of-stock' : 'drink-card fade-in';
        const card = document.createElement('div');
        card.className = cardClass;
        
        let priceHTML = '';
        let finalPrice = Number(item.price);
        let badgeHTML = '';

        if (isOut) {
            badgeHTML = `<div class="out-of-stock-badge">نفذت الكمية</div>`;
            priceHTML = `<span>${Number(item.price).toFixed(0)} جنيه</span>`;
        } else if (item.onSale && item.discount > 0) {
            finalPrice = item.price - (item.price * (item.discount / 100));
            badgeHTML = `<div class="sale-badge">عرض 🔥 -${item.discount}%</div>`;
            priceHTML = `
                <span class="old-price">${Number(item.price).toFixed(0)} جنيه</span>
                <span style="color: #EF4444;">${finalPrice.toFixed(0)} جنيه</span>
            `;
        } else {
            priceHTML = `<span>${Number(item.price).toFixed(0)} جنيه</span>`;
        }

        const btnHTML = isOut 
            ? `<button class="add-to-cart-btn" disabled style="background:#ccc; cursor:not-allowed;">غير متاح</button>`
            : `<button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                <i class="fa-solid fa-plus"></i> أضف للسلة
               </button>`;

        card.innerHTML = `
            ${badgeHTML}
            <div class="drink-img-wrap">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <h3 class="drink-name">${item.name}</h3>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1rem; height: 40px; overflow: hidden;">${item.description}</p>
            <div class="drink-price">${priceHTML}</div>
            ${btnHTML}
        `;
        menuContainer.appendChild(card);
    });
    
    // Observe newly rendered cards
    if (scrollObserver) {
        const newCards = menuContainer.querySelectorAll('.fade-in:not(.in-view)');
        observeElements(newCards);
    }
}

function initFilters() {
    if (!filterContainer || !searchInput) return;

    // Category Filter
    const filterBtns = filterContainer.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterMenu(e.target.dataset.filter, searchInput.value);
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
window.addToCart = function(itemId) {
    const item = menuItems.find(i => i.id == itemId);
    if (!item) return;
    if (item.inStock === false) {
        showToast("عفواً، هذا المنتج غير متاح حالياً", 'fa-times-circle', '#EF4444');
        return;
    }

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
    updateCartBadges();
    showToast(`تمت إضافة ${item.name} للسلة`);
    
    // Animate badge
    cartBadges.forEach(badge => {
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    });
};

window.removeFromCart = function(itemId) {
    cart = cart.filter(i => i.id != itemId);
    saveCart();
    updateCartBadges();
    if(cartItemsContainer) {
        renderCartPage();
    }
    showToast("تم حذف المنتج من السلة", 'fa-trash', '#EF4444');
};

window.updateQuantity = function(itemId, change) {
    const item = cart.find(i => i.id == itemId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveCart();
        updateCartBadges();
        if(cartItemsContainer) {
            renderCartPage();
        }
    }
};

function saveCart() {
    localStorage.setItem('bouba_cart_ar', JSON.stringify(cart));
}

function updateCartBadges() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadges.forEach(badge => badge.textContent = totalItems);
}

// --- Dedicated Cart Page Rendering ---
function renderCartPage() {
    if (!cartItemsContainer) return;

    // Clear dynamic items, keep empty state
    const children = Array.from(cartItemsContainer.children);
    children.forEach(child => {
        if (child.id !== 'empty-cart-msg') {
            child.remove();
        }
    });

    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
        cartSummaryBox.style.display = 'none';
    } else {
        emptyCartMsg.style.display = 'none';
        cartSummaryBox.style.display = 'block';
        
        let total = 0;
        let count = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'cart-item fade-in';
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <div class="item-price">${item.price.toFixed(0)} جنيه</div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                        <span style="font-weight: bold; font-size: 1.2rem;">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})" title="حذف">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsContainer.insertBefore(cartItemEl, emptyCartMsg);
        });

        summaryCount.textContent = count;
        summaryTotalPrice.textContent = `${total.toFixed(0)} جنيه`;
        
        // Observe newly rendered cart items
        if (scrollObserver) {
            const newCartItems = cartItemsContainer.querySelectorAll('.fade-in:not(.in-view)');
            observeElements(newCartItems);
        }
    }
}

// --- WhatsApp Integration ---
function initWhatsAppOrder() {
    if (!whatsappBtn) return;

    whatsappBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        let message = "طلب جديد من Bouba Cafe:%0A%0A";
        let total = 0;

        cart.forEach(item => {
            message += `▪️ ${item.name} (الكمية: ${item.quantity}) - ${(item.price * item.quantity).toFixed(0)} جنيه%0A`;
            total += item.price * item.quantity;
        });

        message += `%0A💰 *الإجمالي: ${total.toFixed(0)} جنيه*%0A%0A`;
        message += "شكراً لكم! في انتظار تأكيد الطلب.";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        
        // Optional: clear cart after ordering? Let's leave it up to user to clear.
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initMenuData();
    updateCartBadges();
    
    initScrollObserver();
    
    // Observe statically placed fade-in elements
    const staticFadeElements = document.querySelectorAll('.fade-in');
    observeElements(staticFadeElements);
    
    // Menu Page
    if (menuContainer) {
        renderMenu(menuItems);
        initFilters();
    }
    
    // Cart Page
    if (cartItemsContainer) {
        renderCartPage();
        initWhatsAppOrder();
    }
});

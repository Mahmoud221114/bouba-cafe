// --- DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// Sidebar Menu Items
const menuItemsList = document.querySelectorAll('.sidebar-menu .menu-item');
const viewSections = document.querySelectorAll('.view-section');

// Form Elements
const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const formSubmitBtn = document.getElementById('form-submit-btn');
const formCancelBtn = document.getElementById('form-cancel-btn');
const formAlert = document.getElementById('form-alert');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productCategoryInput = document.getElementById('product-category');
const productImageInput = document.getElementById('product-image');
const productDescInput = document.getElementById('product-description');

// Table Elements
const manageTbody = document.getElementById('manage-tbody');
const offersTbody = document.getElementById('offers-tbody');
const adminSearch = document.getElementById('admin-search');

// Stats
const statTotal = document.getElementById('stat-total');
const statOffers = document.getElementById('stat-offers');

// --- Authentication ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

function checkAuth() {
    if (sessionStorage.getItem('bouba_admin_logged_in') === 'true') {
        loginScreen.style.display = 'none';
        dashboardScreen.classList.add('active');
        refreshDashboard();
    } else {
        loginScreen.style.display = 'flex';
        dashboardScreen.classList.remove('active');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem('bouba_admin_logged_in', 'true');
        loginError.style.display = 'none';
        checkAuth();
    } else {
        loginError.style.display = 'block';
    }
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('bouba_admin_logged_in');
    checkAuth();
});

// --- View Routing ---
menuItemsList.forEach(item => {
    item.addEventListener('click', () => {
        // Update active class on menu
        menuItemsList.forEach(m => m.classList.remove('active'));
        item.classList.add('active');

        // Show correct view
        const targetView = item.dataset.target;
        viewSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetView) {
                section.classList.add('active');
            }
        });

        // Reset form if navigating away
        if (targetView !== 'view-add') {
            resetForm();
        }
    });
});

function switchToAddView(isEdit = false) {
    menuItemsList.forEach(m => m.classList.remove('active'));
    document.querySelector('[data-target="view-add"]').classList.add('active');
    
    viewSections.forEach(section => section.classList.remove('active'));
    document.getElementById('view-add').classList.add('active');

    formTitle.textContent = isEdit ? 'Edit Product' : 'Add New Product';
    formSubmitBtn.textContent = isEdit ? 'Update Product' : 'Save Product';
    formCancelBtn.style.display = isEdit ? 'inline-block' : 'none';
}

// --- CRUD Operations ---
function saveProducts() {
    localStorage.setItem('bouba_menuItems', JSON.stringify(menuItems));
    refreshDashboard();
}

function refreshDashboard() {
    // Note: menuItems is loaded globally from main.js via initMenuData()
    // but just to be safe, reload it.
    initMenuData(); 
    renderManageTable();
    renderOffersTable();
    updateStats();
}

// Add / Edit Form Submit
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const idVal = productIdInput.value;
    const isEdit = idVal !== "";

    const newProduct = {
        id: isEdit ? parseInt(idVal) : Date.now(), // Generate ID if new
        name: productNameInput.value,
        price: parseFloat(productPriceInput.value),
        category: productCategoryInput.value,
        image: productImageInput.value,
        description: productDescInput.value,
        // Preserve offer state if editing, otherwise default
        onSale: isEdit ? menuItems.find(i => i.id == idVal).onSale : false,
        discount: isEdit ? menuItems.find(i => i.id == idVal).discount : 0
    };

    if (isEdit) {
        const index = menuItems.findIndex(i => i.id == idVal);
        if (index > -1) {
            menuItems[index] = newProduct;
        }
    } else {
        menuItems.push(newProduct);
    }

    saveProducts();
    
    // Show success msg
    formAlert.textContent = isEdit ? 'Product updated successfully!' : 'Product added successfully!';
    formAlert.classList.add('success');
    setTimeout(() => {
        formAlert.classList.remove('success');
    }, 3000);

    resetForm();
    if (isEdit) {
        // Go back to manage view
        document.querySelector('[data-target="view-manage"]').click();
    }
});

formCancelBtn.addEventListener('click', () => {
    resetForm();
    document.querySelector('[data-target="view-manage"]').click();
});

function resetForm() {
    productForm.reset();
    productIdInput.value = "";
    formTitle.textContent = 'Add New Product';
    formSubmitBtn.textContent = 'Save Product';
    formCancelBtn.style.display = 'none';
}

// Render Manage Table
function renderManageTable(searchTerm = '') {
    manageTbody.innerHTML = '';
    
    let filtered = menuItems;
    if (searchTerm) {
        filtered = menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filtered.length === 0) {
        manageTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No products found.</td></tr>';
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}"></td>
            <td style="font-weight: 500;">${item.name}</td>
            <td><span class="badge badge-${item.category}">${item.category.toUpperCase()}</span></td>
            <td>$${Number(item.price).toFixed(2)}</td>
            <td class="action-btns">
                <button class="btn-icon btn-edit" onclick="editProduct(${item.id})" title="Edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteProduct(${item.id})" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        manageTbody.appendChild(tr);
    });
}

// Search
adminSearch.addEventListener('input', (e) => {
    renderManageTable(e.target.value);
});

// Edit Product
window.editProduct = function(id) {
    const item = menuItems.find(i => i.id == id);
    if (!item) return;

    productIdInput.value = item.id;
    productNameInput.value = item.name;
    productPriceInput.value = item.price;
    productCategoryInput.value = item.category;
    productImageInput.value = item.image;
    productDescInput.value = item.description;

    switchToAddView(true);
};

// Delete Product
window.deleteProduct = function(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        menuItems = menuItems.filter(i => i.id != id);
        saveProducts();
    }
};

// --- Offers System ---
function renderOffersTable() {
    offersTbody.innerHTML = '';
    
    if (menuItems.length === 0) {
        offersTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products available.</td></tr>';
        return;
    }

    menuItems.forEach(item => {
        const tr = document.createElement('tr');
        
        let finalPrice = Number(item.price);
        if (item.onSale && item.discount > 0) {
            finalPrice = item.price - (item.price * (item.discount / 100));
        }

        tr.innerHTML = `
            <td style="font-weight: 500;">${item.name}</td>
            <td>$${Number(item.price).toFixed(2)}</td>
            <td>
                <input type="checkbox" id="sale-${item.id}" ${item.onSale ? 'checked' : ''} onchange="updateRowPrice(${item.id})">
            </td>
            <td>
                <input type="number" id="discount-${item.id}" value="${item.discount || 0}" min="0" max="100" style="width: 60px; padding: 0.2rem;" onchange="updateRowPrice(${item.id})" ${!item.onSale ? 'disabled' : ''}>
            </td>
            <td id="final-price-${item.id}" style="font-weight: bold; color: ${item.onSale && item.discount > 0 ? '#ff4d4d' : 'inherit'};">
                $${finalPrice.toFixed(2)}
            </td>
            <td>
                <button class="btn btn-primary" style="padding: 0.3rem 0.8rem; font-size: 0.9rem;" onclick="saveOffer(${item.id})">Save</button>
            </td>
        `;
        offersTbody.appendChild(tr);
    });
}

// Live update of price row before saving
window.updateRowPrice = function(id) {
    const item = menuItems.find(i => i.id == id);
    const cb = document.getElementById(`sale-${id}`);
    const distInput = document.getElementById(`discount-${id}`);
    const finalTd = document.getElementById(`final-price-${id}`);

    distInput.disabled = !cb.checked;
    
    let finalPrice = Number(item.price);
    let discountVal = parseFloat(distInput.value) || 0;

    if (cb.checked && discountVal > 0) {
        finalPrice = item.price - (item.price * (discountVal / 100));
        finalTd.style.color = '#ff4d4d';
    } else {
        finalTd.style.color = 'inherit';
    }

    finalTd.textContent = `$${finalPrice.toFixed(2)}`;
};

window.saveOffer = function(id) {
    const itemIndex = menuItems.findIndex(i => i.id == id);
    if (itemIndex === -1) return;

    const cb = document.getElementById(`sale-${id}`);
    const distInput = document.getElementById(`discount-${id}`);

    menuItems[itemIndex].onSale = cb.checked;
    menuItems[itemIndex].discount = parseFloat(distInput.value) || 0;

    saveProducts();
    alert(`Offer settings for ${menuItems[itemIndex].name} saved!`);
};

// --- Stats Update ---
function updateStats() {
    statTotal.textContent = menuItems.length;
    const saleCount = menuItems.filter(i => i.onSale && i.discount > 0).length;
    statOffers.textContent = saleCount;
}

// --- Init ---
checkAuth();

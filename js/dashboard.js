// Make sure menuItems is available globally from app.js logic, but since we separated the scripts, 
// we need to define the fetch logic here as well if app.js is not loaded on dashboard.html.
// Let's assume app.js is NOT loaded on dashboard.html to prevent conflicts with cart UI elements not existing.
// So we will recreate the init/save logic for menuItems here.

let adminMenuItems = [];

function initAdminData() {
    const stored = localStorage.getItem('bouba_menuItems_ar');
    if (stored) {
        adminMenuItems = JSON.parse(stored);
    } else {
        // Fallback if accessed before visiting main site
        adminMenuItems = []; 
    }
}

function saveProducts() {
    localStorage.setItem('bouba_menuItems_ar', JSON.stringify(adminMenuItems));
    refreshDashboard();
}

// --- DOM Elements ---
const logoutBtn = document.getElementById('logout-btn');
const menuItemsList = document.querySelectorAll('.sidebar .menu-item');
const viewSections = document.querySelectorAll('.view-section');

// Form Elements
const productForm = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const formSubmitBtn = document.getElementById('form-submit-btn');
const formCancelBtn = document.getElementById('form-cancel-btn');
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

// Toast Container for Admin (create dynamically if not exists)
let adminToastContainer = document.getElementById('toast-container');
if (!adminToastContainer) {
    adminToastContainer = document.createElement('div');
    adminToastContainer.id = 'toast-container';
    document.body.appendChild(adminToastContainer);
}

// --- Toast Notifications ---
function showAdminToast(message, iconClass = 'fa-check-circle', color = 'var(--primary-color)') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color: ${color};"></i> <span>${message}</span>`;
    adminToastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Authentication Check ---
function checkAuth() {
    if (sessionStorage.getItem('bouba_admin_logged_in') !== 'true') {
        window.location.href = 'admin.html';
    } else {
        refreshDashboard();
    }
}

const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

function handleLogout() {
    sessionStorage.removeItem('bouba_admin_logged_in');
    window.location.href = 'admin.html';
}

if(logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

if(mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', handleLogout);
}

// --- View Routing ---
menuItemsList.forEach(item => {
    item.addEventListener('click', () => {
        menuItemsList.forEach(m => m.classList.remove('active'));
        item.classList.add('active');

        const targetView = item.dataset.target;
        viewSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetView) {
                section.classList.add('active');
            }
        });

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

    formTitle.textContent = isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد';
    formSubmitBtn.textContent = isEdit ? 'تحديث المنتج' : 'إضافة المنتج';
    formCancelBtn.style.display = isEdit ? 'inline-block' : 'none';
}

// --- CRUD Operations ---
function refreshDashboard() {
    initAdminData(); 
    renderManageTable();
    renderOffersTable();
    updateStats();
}

// Add / Edit Form Submit
if(productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const idVal = productIdInput.value;
        const isEdit = idVal !== "";

        const newProduct = {
            id: isEdit ? parseInt(idVal) : Date.now(),
            name: productNameInput.value,
            price: parseFloat(productPriceInput.value),
            category: productCategoryInput.value,
            image: productImageInput.value || 'assets/images/hero.png',
            description: productDescInput.value,
            onSale: isEdit ? adminMenuItems.find(i => i.id == idVal).onSale : false,
            discount: isEdit ? adminMenuItems.find(i => i.id == idVal).discount : 0
        };

        if (isEdit) {
            const index = adminMenuItems.findIndex(i => i.id == idVal);
            if (index > -1) {
                adminMenuItems[index] = newProduct;
            }
        } else {
            adminMenuItems.push(newProduct);
        }

        saveProducts();
        
        showAdminToast(isEdit ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!');

        resetForm();
        if (isEdit) {
            document.querySelector('[data-target="view-manage"]').click();
        }
    });
}

if(formCancelBtn) {
    formCancelBtn.addEventListener('click', () => {
        resetForm();
        document.querySelector('[data-target="view-manage"]').click();
    });
}

function resetForm() {
    if(!productForm) return;
    productForm.reset();
    productIdInput.value = "";
    formTitle.textContent = 'إضافة منتج جديد';
    formSubmitBtn.textContent = 'إضافة المنتج';
    formCancelBtn.style.display = 'none';
}

// Render Manage Table
function renderManageTable(searchTerm = '') {
    if(!manageTbody) return;
    manageTbody.innerHTML = '';
    
    let filtered = adminMenuItems;
    if (searchTerm) {
        filtered = adminMenuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filtered.length === 0) {
        manageTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد منتجات.</td></tr>';
        return;
    }

    const categoryNames = { boba: 'مشروبات بوبا', coffee: 'قهوة مثلجة', dessert: 'حلويات' };

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover;"></td>
            <td style="font-weight: 700;">${item.name}</td>
            <td><span class="badge badge-${item.category}">${categoryNames[item.category] || item.category}</span></td>
            <td>$${Number(item.price).toFixed(2)}</td>
            <td class="action-btns" style="display:flex; gap:0.5rem; justify-content: right;">
                <button class="btn-icon" style="color: #007bff; border:none; background:none; cursor:pointer;" onclick="editProduct(${item.id})" title="تعديل">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon" style="color: #dc3545; border:none; background:none; cursor:pointer;" onclick="deleteProduct(${item.id})" title="حذف">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        manageTbody.appendChild(tr);
    });
}

// Search
if(adminSearch) {
    adminSearch.addEventListener('input', (e) => {
        renderManageTable(e.target.value);
    });
}

// Edit Product
window.editProduct = function(id) {
    const item = adminMenuItems.find(i => i.id == id);
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
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        adminMenuItems = adminMenuItems.filter(i => i.id != id);
        saveProducts();
        showAdminToast("تم حذف المنتج", "fa-trash", "#EF4444");
    }
};

// --- Offers System ---
function renderOffersTable() {
    if(!offersTbody) return;
    offersTbody.innerHTML = '';
    
    if (adminMenuItems.length === 0) {
        offersTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد منتجات متاحة.</td></tr>';
        return;
    }

    adminMenuItems.forEach(item => {
        const tr = document.createElement('tr');
        
        let finalPrice = Number(item.price);
        if (item.onSale && item.discount > 0) {
            finalPrice = item.price - (item.price * (item.discount / 100));
        }

        tr.innerHTML = `
            <td style="font-weight: 700;">${item.name}</td>
            <td>$${Number(item.price).toFixed(2)}</td>
            <td>
                <input type="checkbox" id="sale-${item.id}" ${item.onSale ? 'checked' : ''} onchange="updateRowPrice(${item.id})" style="width: 20px; height: 20px;">
            </td>
            <td>
                <input type="number" id="discount-${item.id}" value="${item.discount || 0}" min="0" max="100" style="width: 70px; padding: 0.3rem; text-align: center; border: 1px solid var(--border-color); border-radius: 5px;" onchange="updateRowPrice(${item.id})" ${!item.onSale ? 'disabled' : ''}>
            </td>
            <td id="final-price-${item.id}" style="font-weight: bold; color: ${item.onSale && item.discount > 0 ? '#EF4444' : 'inherit'};">
                $${finalPrice.toFixed(2)}
            </td>
            <td>
                <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.9rem;" onclick="saveOffer(${item.id})">حفظ</button>
            </td>
        `;
        offersTbody.appendChild(tr);
    });
}

// Live update of price row before saving
window.updateRowPrice = function(id) {
    const item = adminMenuItems.find(i => i.id == id);
    const cb = document.getElementById(`sale-${id}`);
    const distInput = document.getElementById(`discount-${id}`);
    const finalTd = document.getElementById(`final-price-${id}`);

    distInput.disabled = !cb.checked;
    
    let finalPrice = Number(item.price);
    let discountVal = parseFloat(distInput.value) || 0;

    if (cb.checked && discountVal > 0) {
        finalPrice = item.price - (item.price * (discountVal / 100));
        finalTd.style.color = '#EF4444';
    } else {
        finalTd.style.color = 'inherit';
    }

    finalTd.textContent = `$${finalPrice.toFixed(2)}`;
};

window.saveOffer = function(id) {
    const itemIndex = adminMenuItems.findIndex(i => i.id == id);
    if (itemIndex === -1) return;

    const cb = document.getElementById(`sale-${id}`);
    const distInput = document.getElementById(`discount-${id}`);

    adminMenuItems[itemIndex].onSale = cb.checked;
    adminMenuItems[itemIndex].discount = parseFloat(distInput.value) || 0;

    saveProducts();
    showAdminToast(`تم حفظ العرض لـ ${adminMenuItems[itemIndex].name}`);
};

// --- Stats Update ---
function updateStats() {
    if(statTotal) statTotal.textContent = adminMenuItems.length;
    const saleCount = adminMenuItems.filter(i => i.onSale && i.discount > 0).length;
    if(statOffers) statOffers.textContent = saleCount;
}

// Theme toggler for Dashboard
const dashboardThemeBtn = document.getElementById('theme-toggle');
if(dashboardThemeBtn) {
    const savedTheme = localStorage.getItem('bouba_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        dashboardThemeBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
    dashboardThemeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('bouba_theme', isDark ? 'dark' : 'light');
        const icon = dashboardThemeBtn.querySelector('i');
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

// --- Init ---
if (document.body.classList.contains('admin-mode') && document.getElementById('view-dashboard')) {
    checkAuth();
}

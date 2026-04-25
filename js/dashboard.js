// ============================================================
// dashboard.js — بوبا كافيه | لوحة التحكم
// جميع الكود داخل DOMContentLoaded لضمان تحميل الصفحة أولاً
// ============================================================

// --- Data Layer ---
let adminMenuItems = [];

function initAdminData() {
    const stored = localStorage.getItem('bouba_menuItems_ar');
    if (stored) {
        adminMenuItems = JSON.parse(stored);
    } else {
        adminMenuItems = [];
    }
}

function saveProducts() {
    localStorage.setItem('bouba_menuItems_ar', JSON.stringify(adminMenuItems));
    refreshDashboard();
}

// --- Toast Notifications ---
function showAdminToast(message, iconClass = 'fa-check-circle', color = 'var(--primary-color)') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color: ${color};"></i> <span>${message}</span>`;
    container.appendChild(toast);
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
        return false;
    }
    return true;
}

function handleLogout() {
    sessionStorage.removeItem('bouba_admin_logged_in');
    window.location.href = 'admin.html';
}

// --- Category Names ---
const categoryNames = {
    mojito: 'موهيتو',
    smoothie: 'سموثي',
    icetea: 'آيس تي',
    bobamix: 'بوبا ميكس',
    milkshake: 'ميلك شيك',
    icecoffee: 'آيس كوفي',
    frappe: 'فرابيه',
    matcha: 'ماتشا'
};

// --- Dashboard Core ---
function refreshDashboard() {
    initAdminData();
    renderManageTable();
    renderOffersTable();
    updateStats();
}

function updateStats() {
    const statTotal = document.getElementById('stat-total');
    const statOffers = document.getElementById('stat-offers');
    const statOut = document.getElementById('stat-outofstock');
    if (statTotal) statTotal.textContent = adminMenuItems.length;
    const saleCount = adminMenuItems.filter(i => i.onSale && i.discount > 0).length;
    if (statOffers) statOffers.textContent = saleCount;
    const outCount = adminMenuItems.filter(i => i.inStock === false).length;
    if (statOut) statOut.textContent = outCount;
}

// --- View Routing ---
function initSidebar() {
    const menuItemsList = document.querySelectorAll('.sidebar .menu-item');
    const viewSections = document.querySelectorAll('.view-section');

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
}

function switchToAddView(isEdit = false) {
    const menuItemsList = document.querySelectorAll('.sidebar .menu-item');
    const viewSections = document.querySelectorAll('.view-section');
    const formTitle = document.getElementById('form-title');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formCancelBtn = document.getElementById('form-cancel-btn');

    menuItemsList.forEach(m => m.classList.remove('active'));
    const addBtn = document.querySelector('[data-target="view-add"]');
    if (addBtn) addBtn.classList.add('active');

    viewSections.forEach(section => section.classList.remove('active'));
    const addView = document.getElementById('view-add');
    if (addView) addView.classList.add('active');

    if (formTitle) formTitle.textContent = isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد';
    if (formSubmitBtn) formSubmitBtn.textContent = isEdit ? 'تحديث المنتج' : 'إضافة المنتج';
    if (formCancelBtn) formCancelBtn.style.display = isEdit ? 'inline-block' : 'none';
}

// --- Form Handling ---
function resetForm() {
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productImageInput = document.getElementById('product-image');
    const productInstockInput = document.getElementById('product-instock');
    const formTitle = document.getElementById('form-title');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formCancelBtn = document.getElementById('form-cancel-btn');

    if (!productForm) return;
    productForm.reset();
    if (productIdInput) productIdInput.value = '';
    if (productImageInput) productImageInput.value = '';
    if (productInstockInput) productInstockInput.checked = true;
    if (formTitle) formTitle.textContent = 'إضافة منتج جديد';
    if (formSubmitBtn) formSubmitBtn.textContent = 'إضافة المنتج';
    if (formCancelBtn) formCancelBtn.style.display = 'none';
}

function initForm() {
    const productForm = document.getElementById('product-form');
    const productImageFileInput = document.getElementById('product-image-file');
    const productImageInput = document.getElementById('product-image');
    const formCancelBtn = document.getElementById('form-cancel-btn');

    // Handle image upload via FileReader
    if (productImageFileInput && productImageInput) {
        productImageFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    productImageInput.value = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form submit
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const productIdInput = document.getElementById('product-id');
            const productNameInput = document.getElementById('product-name');
            const productPriceInput = document.getElementById('product-price');
            const productCategoryInput = document.getElementById('product-category');
            const productDescInput = document.getElementById('product-description');
            const productInstockInput = document.getElementById('product-instock');

            const idVal = productIdInput ? productIdInput.value : '';
            const isEdit = idVal !== '';

            const existingItem = isEdit ? adminMenuItems.find(i => i.id == idVal) : null;

            const newProduct = {
                id: isEdit ? parseInt(idVal) : Date.now(),
                name: productNameInput ? productNameInput.value : '',
                price: parseFloat(productPriceInput ? productPriceInput.value : 0),
                category: productCategoryInput ? productCategoryInput.value : 'mojito',
                image: (productImageInput && productImageInput.value) ? productImageInput.value : 'assets/images/hero.png',
                description: productDescInput ? productDescInput.value : '',
                inStock: productInstockInput ? productInstockInput.checked : true,
                onSale: existingItem ? existingItem.onSale : false,
                discount: existingItem ? existingItem.discount : 0
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
                const manageBtn = document.querySelector('[data-target="view-manage"]');
                if (manageBtn) manageBtn.click();
            }
        });
    }

    if (formCancelBtn) {
        formCancelBtn.addEventListener('click', () => {
            resetForm();
            const manageBtn = document.querySelector('[data-target="view-manage"]');
            if (manageBtn) manageBtn.click();
        });
    }
}

// --- Render Manage Table ---
function renderManageTable(searchTerm = '') {
    const manageTbody = document.getElementById('manage-tbody');
    if (!manageTbody) return;
    manageTbody.innerHTML = '';

    let filtered = adminMenuItems;
    if (searchTerm) {
        filtered = adminMenuItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (filtered.length === 0) {
        manageTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-light);">لا توجد منتجات.</td></tr>';
        return;
    }

    filtered.forEach(item => {
        const inStockBadge = item.inStock === false
            ? '<span class="badge" style="background:#FEE2E2; color:#EF4444;">نفذت الكمية</span>'
            : '<span class="badge" style="background:#D1FAE5; color:#10B981;">متوفر</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover;" onerror="this.src='assets/images/hero.png'"></td>
            <td style="font-weight: 700;">${item.name}</td>
            <td><span class="badge badge-${item.category}">${categoryNames[item.category] || item.category}</span></td>
            <td>${Number(item.price).toFixed(0)} جنيه</td>
            <td>${inStockBadge}</td>
            <td class="action-btns" style="display:flex; gap:0.5rem; align-items:center;">
                <button style="color:#FFB6C1; border:none; background:none; cursor:pointer; font-size:1.1rem;" onclick="editProduct(${item.id})" title="تعديل">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button style="color:#EF4444; border:none; background:none; cursor:pointer; font-size:1.1rem;" onclick="deleteProduct(${item.id})" title="حذف">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        manageTbody.appendChild(tr);
    });
}

// --- Edit / Delete ---
window.editProduct = function(id) {
    const item = adminMenuItems.find(i => i.id == id);
    if (!item) return;

    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productCategoryInput = document.getElementById('product-category');
    const productImageInput = document.getElementById('product-image');
    const productDescInput = document.getElementById('product-description');
    const productInstockInput = document.getElementById('product-instock');

    if (productIdInput) productIdInput.value = item.id;
    if (productNameInput) productNameInput.value = item.name;
    if (productPriceInput) productPriceInput.value = item.price;
    if (productCategoryInput) productCategoryInput.value = item.category;
    if (productImageInput) productImageInput.value = item.image;
    if (productDescInput) productDescInput.value = item.description;
    if (productInstockInput) productInstockInput.checked = item.inStock !== false;

    switchToAddView(true);
};

window.deleteProduct = function(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        adminMenuItems = adminMenuItems.filter(i => i.id != id);
        saveProducts();
        showAdminToast('تم حذف المنتج', 'fa-trash', '#EF4444');
    }
};

// --- Offers System ---
function renderOffersTable() {
    const offersTbody = document.getElementById('offers-tbody');
    if (!offersTbody) return;
    offersTbody.innerHTML = '';

    if (adminMenuItems.length === 0) {
        offersTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-light);">لا توجد منتجات متاحة.</td></tr>';
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
            <td>${Number(item.price).toFixed(0)} جنيه</td>
            <td>
                <input type="checkbox" id="sale-${item.id}" ${item.onSale ? 'checked' : ''} onchange="updateRowPrice(${item.id})" style="width: 20px; height: 20px;">
            </td>
            <td>
                <input type="number" id="discount-${item.id}" value="${item.discount || 0}" min="0" max="100" style="width: 70px; padding: 0.3rem; text-align: center; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-color);" onchange="updateRowPrice(${item.id})" ${!item.onSale ? 'disabled' : ''}>
            </td>
            <td id="final-price-${item.id}" style="font-weight: bold; color: ${item.onSale && item.discount > 0 ? '#EF4444' : 'inherit'};">
                ${finalPrice.toFixed(0)} جنيه
            </td>
            <td>
                <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.9rem;" onclick="saveOffer(${item.id})">حفظ</button>
            </td>
        `;
        offersTbody.appendChild(tr);
    });
}

window.updateRowPrice = function(id) {
    const item = adminMenuItems.find(i => i.id == id);
    if (!item) return;
    const cb = document.getElementById(`sale-${id}`);
    const distInput = document.getElementById(`discount-${id}`);
    const finalTd = document.getElementById(`final-price-${id}`);

    distInput.disabled = !cb.checked;

    let finalPrice = Number(item.price);
    const discountVal = parseFloat(distInput.value) || 0;

    if (cb.checked && discountVal > 0) {
        finalPrice = item.price - (item.price * (discountVal / 100));
        finalTd.style.color = '#EF4444';
    } else {
        finalTd.style.color = 'inherit';
    }

    finalTd.textContent = `${finalPrice.toFixed(0)} جنيه`;
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

// --- Theme Toggle ---
function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const saved = localStorage.getItem('bouba_theme');
    if (saved === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = btn.querySelector('i');
        if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }
    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('bouba_theme', isDark ? 'dark' : 'light');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-moon', !isDark);
            icon.classList.toggle('fa-sun', isDark);
        }
    });
}

// --- Search in manage table ---
function initSearch() {
    const adminSearch = document.getElementById('admin-search');
    if (adminSearch) {
        adminSearch.addEventListener('input', (e) => {
            renderManageTable(e.target.value);
        });
    }
}

// ============================================================
// MAIN ENTRY POINT — يبدأ هنا كل شيء بعد تحميل الصفحة
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // تحقق من تسجيل الدخول أولاً
    if (!checkAuth()) return;

    // تهيئة الثيم
    initTheme();

    // تهيئة الشريط الجانبي
    initSidebar();

    // تهيئة النموذج
    initForm();

    // تهيئة البحث
    initSearch();

    // زر تسجيل الخروج (ديسكتوب)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // زر تسجيل الخروج (موبايل)
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

    // تحميل البيانات وعرضها
    refreshDashboard();
});

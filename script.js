/* =========================================
   1. GLOBAL VARIABLES & USER SESSION
   ========================================= */
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const closeCartBtn = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.querySelector('.checkout-btn');
const scrollToTopBtn = document.getElementById("scrollToTop");
const searchBox = document.getElementById('search-box');
const toastBox = document.getElementById('toast-box');

// --- USER SESSION LOGIC ---
const currentUser = localStorage.getItem('currentUser'); // Get logged in user
const dbKey = (key) => currentUser ? `${key}_${currentUser}` : key; // Helper for user-specific keys

// Load Data based on User
let cart = JSON.parse(localStorage.getItem(dbKey('cart'))) || [];
let wishlist = JSON.parse(localStorage.getItem(dbKey('wishlist'))) || [];
let recentItems = JSON.parse(localStorage.getItem(dbKey('recentlyViewed'))) || [];
let orders = JSON.parse(localStorage.getItem(dbKey('orders'))) || [];
let discount = 0;

// Update UI based on Login Status
const loginLink = document.querySelector('a[href="login.html"]');
const navMenu = document.querySelector('.menu');

if (currentUser && loginLink) {
    // 1. Change Login to Logout
    loginLink.innerText = `Logout (${currentUser})`;
    loginLink.style.color = "red";
    loginLink.href = "#";
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });

    // 2. Add "My Orders" Link
    const ordersLink = document.createElement('a');
    ordersLink.href = "#";
    ordersLink.innerText = "My Orders";
    ordersLink.id = "orders-btn";
    navMenu.insertBefore(ordersLink, loginLink); 
}

/* =========================================
   2. TOAST NOTIFICATIONS
   ========================================= */
function showToast(msg, type = 'success') {
    if (!toastBox) return;
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `${icon} ${msg}`;
    toastBox.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

/* =========================================
   3. CART & CHECKOUT
   ========================================= */
updateCartUI();

function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

const cartLink = document.getElementById('cart-count')?.parentElement;
if(cartLink) cartLink.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if(overlay) overlay.addEventListener('click', toggleCart);

// Add to Cart Logic
document.querySelectorAll('.add-cart-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        if(!currentUser) { showToast("Please Login First!", "error"); return; }
        
        const productCard = event.target.closest('.product');
        const name = productCard.querySelector('.product-info h4').innerText;
        const priceText = productCard.querySelector('.product-info .price').innerText;
        const imgSrc = productCard.querySelector('.product-image-wrapper img').src;
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

        addToCart(name, price, imgSrc);
    });
});

// Helper function to add to cart (used by buttons and Wishlist)
function addToCart(name, price, imgSrc) {
    const product = { name, price, imgSrc };
    cart.push(product);
    updateCartUI();
    showToast(`${name} added to cart!`);
}

function updateCartUI() {
    localStorage.setItem(dbKey('cart'), JSON.stringify(cart)); 
    if(cartCountElement) cartCountElement.innerText = cart.length;
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const totalAmount = subtotal - (subtotal * discount);
    
    if(cartTotalElement) cartTotalElement.innerText = totalAmount.toFixed(2);

    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = ''; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        return;
    }

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <img src="${item.imgSrc}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
            </div>
            <button onclick="removeItem(${index})" style="background:red; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">X</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

window.removeItem = function(index) {
    cart.splice(index, 1); 
    updateCartUI();
};

// Checkout
if(checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!", "error");
        } else {
            const newOrder = {
                id: 'ORD-' + Date.now(),
                date: new Date().toLocaleDateString(),
                items: cart, 
                total: cartTotalElement.innerText
            };
            orders.unshift(newOrder);
            localStorage.setItem(dbKey('orders'), JSON.stringify(orders));

            showToast(`Order Placed! Total: ₹${cartTotalElement.innerText}`);
            cart = []; 
            updateCartUI(); 
            toggleCart(); 
        }
    });
}

/* =========================================
   4. WISHLIST LOGIC (Fixed: Add to Cart)
   ========================================= */
const wishlistLink = document.getElementById('wishlist-link');
const wishlistModal = document.getElementById('wishlist-modal');
const closeWishlistBtn = document.getElementById('close-wishlist');
const wishlistContainer = document.getElementById('wishlist-items-container');
const wishlistButtons = document.querySelectorAll('.wishlist-btn');

function updateWishlistIcons() {
    wishlistButtons.forEach(btn => {
        const name = btn.closest('.product').querySelector('.product-info h4').innerText;
        if (wishlist.some(item => item.name === name)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}
updateWishlistIcons();

wishlistButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if(!currentUser) { showToast("Please Login First!", "error"); return; }

        const productCard = btn.closest('.product');
        const name = productCard.querySelector('.product-info h4').innerText;
        const price = productCard.querySelector('.product-info .price').innerText;
        const imgSrc = productCard.querySelector('.product-image-wrapper img').src;
        
        const existingIndex = wishlist.findIndex(item => item.name === name);

        if (existingIndex > -1) {
            wishlist.splice(existingIndex, 1);
            btn.classList.remove('active');
            showToast("Removed from Wishlist", "error");
        } else {
            wishlist.push({ name, price, imgSrc });
            btn.classList.add('active');
            showToast("Added to Wishlist! ❤️");
        }
        localStorage.setItem(dbKey('wishlist'), JSON.stringify(wishlist));
    });
});

if (wishlistLink) wishlistLink.addEventListener('click', (e) => { e.preventDefault(); renderWishlistItems(); wishlistModal.style.display = 'block'; });
if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', () => { wishlistModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == wishlistModal) wishlistModal.style.display = 'none'; });

function renderWishlistItems() {
    if (!wishlistContainer) return;
    wishlistContainer.innerHTML = wishlist.length ? '' : '<p>Your wishlist is empty 💔</p>';
    
    wishlist.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('wishlist-item');
        // FIXED: Added "Add to Cart" Button below
        div.innerHTML = `
            <img src="${item.imgSrc}"> 
            <div class="wishlist-details">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
                <button onclick="moveToCartFromWishlist(${index})" style="margin-top:5px; background:#4CAF50; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:12px;">Add to Cart</button>
            </div> 
            <button onclick="removeFromWishlist(${index})" class="remove-wishlist-btn">Remove</button>
        `;
        wishlistContainer.appendChild(div);
    });
}

// NEW: Move from Wishlist to Cart
window.moveToCartFromWishlist = function(index) {
    const item = wishlist[index];
    // Clean price string to number for consistency
    const priceNum = parseFloat(item.price.replace(/[^\d.]/g, ''));
    
    addToCart(item.name, priceNum, item.imgSrc);
    removeFromWishlist(index); // Optional: Remove from wishlist after adding
};

window.removeFromWishlist = function(index) {
    wishlist.splice(index, 1);
    localStorage.setItem(dbKey('wishlist'), JSON.stringify(wishlist));
    renderWishlistItems();
    updateWishlistIcons();
};

/* =========================================
   5. CONTACT FORM & ORDERS & RELATED
   ========================================= */
// Contact Form Logic (FIXED)
const contactForm = document.querySelector('.contact-form');
const contactModal = document.getElementById('contact-modal');
const contactBtn = document.getElementById('contact-btn');
const closeContactBtn = contactModal?.querySelector('.close-modal');

if (contactBtn) contactBtn.addEventListener('click', (e) => { e.preventDefault(); contactModal.style.display = 'block'; });
if (closeContactBtn) closeContactBtn.addEventListener('click', () => { contactModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == contactModal) contactModal.style.display = 'none'; });

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast("Message Sent Successfully! 📨");
        contactForm.reset();
        contactModal.style.display = 'none';
    });
}

// Order History
const ordersModal = document.getElementById('orders-modal');
const closeOrdersBtn = document.getElementById('close-orders');
const ordersContainer = document.getElementById('orders-list-container');

document.addEventListener('click', (e) => {
    if(e.target && e.target.id === 'orders-btn') {
        e.preventDefault();
        renderOrders();
        if(ordersModal) ordersModal.style.display = 'block';
    }
});
if(closeOrdersBtn) closeOrdersBtn.addEventListener('click', () => { ordersModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == ordersModal) ordersModal.style.display = 'none'; });

function renderOrders() {
    if (!ordersContainer) return;
    ordersContainer.innerHTML = orders.length ? '' : '<p>No past orders found.</p>';
    orders.forEach(order => {
        const div = document.createElement('div');
        div.style.borderBottom = "1px solid #eee";
        div.style.padding = "10px 0";
        div.innerHTML = `<strong>Order ID:</strong> ${order.id} <br><small>${order.date}</small> <br><strong>Total: ₹${order.total}</strong><p>Items: ${order.items.map(i => i.name).join(', ')}</p>`;
        ordersContainer.appendChild(div);
    });
}

// Related Products Logic (FIXED)
const relatedContainer = document.getElementById('related-items-container');

function showRelatedProducts(currentProductName) {
    if (!relatedContainer) return;
    relatedContainer.innerHTML = '';
    const allProducts = Array.from(document.querySelectorAll('.product'));
    // Filter out current product
    const otherProducts = allProducts.filter(card => card.querySelector('.product-info h4').innerText !== currentProductName);
    // Pick 3 random
    const randomPicks = otherProducts.sort(() => 0.5 - Math.random()).slice(0, 3);

    randomPicks.forEach(card => {
        const img = card.querySelector('.product-image-wrapper img').src;
        const name = card.querySelector('.product-info h4').innerText;
        
        const div = document.createElement('div');
        div.classList.add('related-item');
        div.innerHTML = `<img src="${img}"><p>${name}</p>`;
        
        // Allow clicking related item to open it
        div.addEventListener('click', () => { 
            card.querySelector('.product-image-wrapper img').click(); 
        });
        relatedContainer.appendChild(div);
    });
}

/* =========================================
   6. EXTRAS (Search, Sort, Dark Mode, Recent, Modal)
   ========================================= */
// Search
if (searchBox) {
    searchBox.addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        let found = false;
        document.querySelectorAll('.product').forEach(product => {
            const name = product.querySelector('.product-info h4').innerText.toLowerCase();
            if(name.includes(searchText)) { product.style.display = 'block'; found = true; }
            else { product.style.display = 'none'; }
        });
        const noRes = document.getElementById('no-results');
        if(noRes) noRes.style.display = found ? 'none' : 'block';
    });
}

// Sorting Functionality (ADDED BACK)
const sortSelect = document.getElementById('sort-select');
const productsContainer = document.querySelector('.products');

if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        const sortValue = sortSelect.value;
        const products = Array.from(document.querySelectorAll('.product'));

        const getPrice = (el) => parseFloat(el.querySelector('.price').innerText.replace(/[^\d.]/g, ''));
        const getName = (el) => el.querySelector('h4').innerText.toLowerCase();

        let sortedProducts;

        if (sortValue === 'price-low') {
            sortedProducts = products.sort((a, b) => getPrice(a) - getPrice(b));
        } else if (sortValue === 'price-high') {
            sortedProducts = products.sort((a, b) => getPrice(b) - getPrice(a));
        } else if (sortValue === 'name-az') {
            sortedProducts = products.sort((a, b) => getName(a).localeCompare(getName(b)));
        } else {
            return; 
        }

        // Re-append to container
        products.forEach(p => p.remove()); 
        sortedProducts.forEach(p => productsContainer.appendChild(p)); 
    });
}

// Dark Mode
const darkModeBtn = document.getElementById('dark-mode-btn');
if (localStorage.getItem('darkMode') === 'enabled') document.body.classList.add('dark-mode');
if(darkModeBtn) darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
});

// Recently Viewed
const recentContainer = document.getElementById('recent-items-container');
function addToRecentlyViewed(name, price, imgSrc) {
    if(recentItems.some(i => i.name === name)) return;
    recentItems.unshift({ name, price, imgSrc });
    if(recentItems.length > 5) recentItems.pop();
    localStorage.setItem(dbKey('recentlyViewed'), JSON.stringify(recentItems));
    renderRecentItems();
}

function renderRecentItems() {
    if(!recentContainer) return;
    recentContainer.innerHTML = recentItems.length ? '' : '<p style="color:#777; padding:10px;">No recent items.</p>';
    recentItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('recent-card');
        div.innerHTML = `<button class="remove-recent-btn" onclick="removeRecentItem(event, ${index})">×</button><img src="${item.imgSrc}"><h5>${item.name}</h5><p>₹${item.price}</p>`;
        // Click to open
        div.addEventListener('click', () => { 
             const allProducts = document.querySelectorAll('.product');
             allProducts.forEach(p => {
                 if(p.querySelector('h4').innerText === item.name) {
                     p.querySelector('img').click();
                 }
             });
        });
        recentContainer.appendChild(div);
    });
}

window.removeRecentItem = function(event, index) {
    event.stopPropagation();
    recentItems.splice(index, 1);
    localStorage.setItem(dbKey('recentlyViewed'), JSON.stringify(recentItems));
    renderRecentItems();
};
renderRecentItems();

// Main Product Modal
const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const closeProductModal = document.getElementById('close-product-modal');
const modalAddBtn = document.getElementById('modal-add-btn');

document.querySelectorAll('.product-image-wrapper img').forEach(img => {
    img.addEventListener('click', (e) => {
        const card = e.target.closest('.product');
        const name = card.querySelector('h4').innerText;
        const price = card.querySelector('.price').innerText;
        const src = e.target.src;

        if(modalImg) modalImg.src = src;
        if(modalTitle) modalTitle.innerText = name;
        if(modalPrice) modalPrice.innerText = price;
        
        // Trigger features
        addToRecentlyViewed(name, price, src);
        showRelatedProducts(name); // FIX: Calling the related products function

        if(productModal) productModal.style.display = 'block';
        
        // Modal Add to Cart
        if(modalAddBtn) {
            modalAddBtn.onclick = function() {
                const priceNum = parseFloat(price.replace(/[^\d.]/g, ''));
                addToCart(name, priceNum, src);
                productModal.style.display = 'none';
            };
        }
    });
});
if(closeProductModal) closeProductModal.addEventListener('click', () => { productModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == productModal) productModal.style.display = 'none'; });

// Promo Code
const promoInput = document.getElementById('promo-code');
const applyPromoBtn = document.getElementById('apply-promo');
if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (discount > 0) return;
        if (code === "SAVE10") { discount = 0.10; showToast("10% Discount Applied!"); updateCartUI(); }
        else if (code === "KHUSI20") { discount = 0.20; showToast("20% Discount Applied!"); updateCartUI(); }
        else { showToast("Invalid Code", "error"); }
    });
}
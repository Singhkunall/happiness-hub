/* =========================================
   1. GLOBAL VARIABLES & SELECTORS
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

// Global State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let recentItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
let discount = 0; // 0% initially

/* =========================================
   2. TOAST NOTIFICATIONS (Must be defined first)
   ========================================= */
function showToast(msg, type = 'success') {
    if (!toastBox) return; // Safety check

    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    // Icon based on type
    const icon = type === 'success' ? '✅' : '❌';

    toast.innerHTML = `${icon} ${msg}`;
    toastBox.appendChild(toast);

    // Remove from DOM after 3.5 seconds
    setTimeout(() => {
        toast.remove();
    }, 3500);
}

/* =========================================
   3. CART LOGIC & PROMO CODES
   ========================================= */
// Initial Load
updateCartUI();

function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Open/Close Cart Listeners
const cartLink = document.getElementById('cart-count').parentElement;
if (cartLink) cartLink.addEventListener('click', (e) => { e.preventDefault(); toggleCart(); });
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (overlay) overlay.addEventListener('click', toggleCart);

// Add to Cart
const addToCartButtons = document.querySelectorAll('.add-cart-btn');
addToCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const productCard = event.target.closest('.product');
        const name = productCard.querySelector('.product-info h4').innerText;
        const priceText = productCard.querySelector('.product-info .price').innerText;
        const imgSrc = productCard.querySelector('.product-image-wrapper img').src;
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

        const product = { name, price, imgSrc };
        cart.push(product);
        updateCartUI();

        // Show Toast instead of Alert
        showToast(`${name} added to cart!`);
    });
});

// Update UI
function updateCartUI() {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cartCountElement) cartCountElement.innerText = cart.length;

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const totalAmount = subtotal - (subtotal * discount); // Apply discount

    if (cartTotalElement) cartTotalElement.innerText = totalAmount.toFixed(2);

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
            <button onclick="removeItem(${index})" style="margin-left:auto; background:red; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">X</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

window.removeItem = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

// Checkout
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!", "error");
        } else {
            showToast(`Thank you! Order placed for ₹${cartTotalElement.innerText}`);
            cart = [];
            updateCartUI();
            toggleCart();
        }
    });
}

// Promo Code Logic
const promoInput = document.getElementById('promo-code');
const applyPromoBtn = document.getElementById('apply-promo');
const promoMessage = document.getElementById('promo-message');

if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (discount > 0) {
            promoMessage.innerText = "Discount already applied!";
            promoMessage.style.color = "orange";
            return;
        }
        if (code === "SAVE10") {
            discount = 0.10;
            promoMessage.innerText = "Success! 10% OFF Applied.";
            promoMessage.style.color = "green";
            showToast("10% Discount Applied!");
            updateCartUI();
        } else if (code === "KHUSI20") {
            discount = 0.20;
            promoMessage.innerText = "Special Code! 20% OFF Applied.";
            promoMessage.style.color = "green";
            showToast("20% Discount Applied!");
            updateCartUI();
        } else {
            promoMessage.innerText = "Invalid Code.";
            promoMessage.style.color = "red";
        }
    });
}

/* =========================================
   4. WISHLIST LOGIC
   ========================================= */
const wishlistLink = document.getElementById('wishlist-link');
const wishlistModal = document.getElementById('wishlist-modal');
const closeWishlistBtn = document.getElementById('close-wishlist');
const wishlistContainer = document.getElementById('wishlist-items-container');
const wishlistButtons = document.querySelectorAll('.wishlist-btn');

function updateWishlistIcons() {
    wishlistButtons.forEach(btn => {
        const productCard = btn.closest('.product');
        const name = productCard.querySelector('.product-info h4').innerText;
        if (wishlist.some(item => item.name === name)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
updateWishlistIcons();

wishlistButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const productCard = btn.closest('.product');
        const name = productCard.querySelector('.product-info h4').innerText;
        const price = productCard.querySelector('.product-info .price').innerText;
        const imgSrc = productCard.querySelector('.product-image-wrapper img').src;

        const existingIndex = wishlist.findIndex(item => item.name === name);

        if (existingIndex > -1) {
            wishlist.splice(existingIndex, 1);
            btn.classList.remove('active');
            showToast(`${name} removed from Wishlist`, "error");
        } else {
            wishlist.push({ name, price, imgSrc });
            btn.classList.add('active');
            showToast(`${name} added to Wishlist! ❤️`);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    });
});

if (wishlistLink) wishlistLink.addEventListener('click', (e) => { e.preventDefault(); renderWishlistItems(); wishlistModal.style.display = 'block'; });
if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', () => { wishlistModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == wishlistModal) wishlistModal.style.display = 'none'; });

function renderWishlistItems() {
    if (!wishlistContainer) return;
    wishlistContainer.innerHTML = '';
    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty 💔</p>';
        return;
    }
    wishlist.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('wishlist-item');
        div.innerHTML = `
            <img src="${item.imgSrc}" alt="${item.name}" onclick="openProductFromWishlist('${item.name}')" style="cursor: pointer;">
            <div class="wishlist-details" onclick="openProductFromWishlist('${item.name}')" style="cursor: pointer;">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
            </div>
            <button onclick="removeFromWishlist(${index})" class="remove-wishlist-btn">Remove</button>
        `;
        wishlistContainer.appendChild(div);
    });
}

window.openProductFromWishlist = function (productName) {
    if (wishlistModal) wishlistModal.style.display = 'none';
    const allProducts = document.querySelectorAll('.product');
    let found = false;
    allProducts.forEach(card => {
        if (card.querySelector('.product-info h4').innerText === productName) {
            const img = card.querySelector('.product-image-wrapper img');
            if (img) { img.click(); found = true; }
        }
    });
    if (!found) showToast("Product details available in main view!", "error");
};

window.removeFromWishlist = function (index) {
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderWishlistItems();
    updateWishlistIcons();
};

/* =========================================
   5. PRODUCT DETAILS MODAL + RECENT + RELATED
   ========================================= */
const productModal = document.getElementById('product-modal');
const closeProductModal = document.getElementById('close-product-modal');
const productImages = document.querySelectorAll('.product-image-wrapper img');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalDesc = document.getElementById('modal-desc');
const modalAddBtn = document.getElementById('modal-add-btn');

productImages.forEach(img => {
    img.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product');
        const imgSrc = e.target.src;
        const name = productCard.querySelector('.product-info h4').innerText;
        const price = productCard.querySelector('.product-info .price').innerText;
        const description = productCard.getAttribute('data-description') || "This is a premium quality product. Stylish, comfortable, and perfect for the new season. Limited stock available!";

        if (modalImg) modalImg.src = imgSrc;
        if (modalTitle) modalTitle.innerText = name;
        if (modalPrice) modalPrice.innerText = price;
        if (modalDesc) modalDesc.innerText = description;

        // 1. Open Modal
        if (productModal) productModal.style.display = 'block';

        // 2. Add to Recently Viewed
        addToRecentlyViewed(name, price, imgSrc);

        // 3. Show Related Products
        showRelatedProducts(name);

        // 4. Modal Add to Cart
        if (modalAddBtn) modalAddBtn.onclick = function () {
            const mainAddBtn = productCard.querySelector('.add-cart-btn');
            if (mainAddBtn) mainAddBtn.click();
            productModal.style.display = 'none';
        };
    });
});

if (closeProductModal) closeProductModal.addEventListener('click', () => { productModal.style.display = 'none'; });
window.addEventListener('click', (e) => { if (e.target == productModal) productModal.style.display = 'none'; });

// --- RELATED PRODUCTS LOGIC ---
const relatedContainer = document.getElementById('related-items-container');
function showRelatedProducts(currentProductName) {
    if (!relatedContainer) return;
    relatedContainer.innerHTML = '';
    const allProducts = Array.from(document.querySelectorAll('.product'));
    const otherProducts = allProducts.filter(card => card.querySelector('.product-info h4').innerText !== currentProductName);
    const randomPicks = otherProducts.sort(() => 0.5 - Math.random()).slice(0, 3);

    randomPicks.forEach(card => {
        const img = card.querySelector('.product-image-wrapper img').src;
        const name = card.querySelector('.product-info h4').innerText;
        const div = document.createElement('div');
        div.classList.add('related-item');
        div.innerHTML = `<img src="${img}" alt="${name}"><p>${name}</p>`;
        div.addEventListener('click', () => { card.querySelector('.product-image-wrapper img').click(); });
        relatedContainer.appendChild(div);
    });
}

// --- RECENTLY VIEWED LOGIC ---
const recentContainer = document.getElementById('recent-items-container');
function addToRecentlyViewed(name, price, imgSrc) {
    const exists = recentItems.some(item => item.name === name);
    if (!exists) {
        recentItems.unshift({ name, price, imgSrc });
        if (recentItems.length > 5) recentItems.pop();
        localStorage.setItem('recentlyViewed', JSON.stringify(recentItems));
        renderRecentItems();
    }
}

/* =========================================
   UPDATED: RECENTLY VIEWED LOGIC (With Delete)
   ========================================= */
function renderRecentItems() {
    if (!recentContainer) return;

    // If list is empty
    if (recentItems.length === 0) {
        recentContainer.innerHTML = '<p style="color:#777; padding:10px;">You haven\'t viewed any products yet.</p>';
        return;
    }

    recentContainer.innerHTML = '';

    recentItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('recent-card');

        // Added the "X" button here
        div.innerHTML = `
            <button class="remove-recent-btn" onclick="removeRecentItem(event, ${index})">×</button>
            <img src="${item.imgSrc}" alt="${item.name}">
            <h5>${item.name}</h5>
            <p>₹${item.price}</p>
        `;

        // Click card to open product (unless you clicked the X)
        div.addEventListener('click', () => {
            window.openProductFromWishlist(item.name);
        });

        recentContainer.appendChild(div);
    });
}

// NEW FUNCTION: Handles the "Cut" / Delete action
window.removeRecentItem = function (event, index) {
    event.stopPropagation(); // Prevents opening the product when clicking X
    recentItems.splice(index, 1); // Remove item from array
    localStorage.setItem('recentlyViewed', JSON.stringify(recentItems)); // Update storage
    renderRecentItems(); // Refresh the display
    showToast("Removed from history", "error"); // Show feedback
};

// Make sure to call this once on load
renderRecentItems();

/* =========================================
   6. SEARCH, SORT & DARK MODE
   ========================================= */
// Search
if (searchBox) {
    searchBox.addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        const products = document.querySelectorAll('.product');
        const noResultsMsg = document.getElementById('no-results');
        let hasVisibleItems = false;
        products.forEach(product => {
            const productName = product.querySelector('.product-info h4').innerText.toLowerCase();
            if (productName.includes(searchText)) {
                product.style.display = 'block'; // Or flex, handled by CSS
                hasVisibleItems = true;
            } else {
                product.style.display = 'none';
            }
        });
        if (noResultsMsg) noResultsMsg.style.display = hasVisibleItems ? 'none' : 'block';
    });
}

// Sort
const sortSelect = document.getElementById('sort-select');
const productsContainer = document.querySelector('.products');
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        const sortValue = sortSelect.value;
        const products = Array.from(document.querySelectorAll('.product'));
        const getPrice = (el) => parseFloat(el.querySelector('.price').innerText.replace(/[^\d.]/g, ''));
        const getName = (el) => el.querySelector('h4').innerText.toLowerCase();
        let sortedProducts;

        if (sortValue === 'price-low') sortedProducts = products.sort((a, b) => getPrice(a) - getPrice(b));
        else if (sortValue === 'price-high') sortedProducts = products.sort((a, b) => getPrice(b) - getPrice(a));
        else if (sortValue === 'name-az') sortedProducts = products.sort((a, b) => getName(a).localeCompare(getName(b)));
        else return;

        products.forEach(p => p.remove());
        sortedProducts.forEach(p => productsContainer.appendChild(p));
    });
}

// Dark Mode
const darkModeBtn = document.getElementById('dark-mode-btn');
const body = document.body;
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    if (darkModeBtn) darkModeBtn.innerText = "☀️";
}
if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeBtn.innerText = "☀️";
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeBtn.innerText = "🌙";
        }
    });
}

/* =========================================
   7. UTILS: SCROLL TOP, MENU, CONTACT, LOGIN
   ========================================= */
if (scrollToTopBtn) {
    window.onscroll = function () {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) scrollToTopBtn.style.display = "block";
        else scrollToTopBtn.style.display = "none";
    };
    scrollToTopBtn.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

const menuLinks = document.querySelectorAll('.menu a');
const menuCheckbox = document.getElementById('menu-toggle');
menuLinks.forEach(link => {
    link.addEventListener('click', () => { if (window.innerWidth <= 768) menuCheckbox.checked = false; });
});

const contactBtn = document.getElementById("contact-btn");
const contactModal = document.getElementById("contact-modal");
const contactForm = document.querySelector(".contact-form");
if (contactBtn) contactBtn.addEventListener("click", (e) => { e.preventDefault(); contactModal.style.display = "block"; });
window.addEventListener("click", (e) => { if (e.target == contactModal) contactModal.style.display = "none"; });
document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', function () { this.closest('.modal-overlay').style.display = 'none'; }); });

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const originalText = contactForm.querySelector("button").innerText;
        const originalBackground = window.getComputedStyle(contactForm.querySelector("button")).backgroundColor;
        contactForm.querySelector("button").innerText = "Message Sent! ✅";
        contactForm.querySelector("button").style.backgroundColor = "#4CAF50";
        setTimeout(() => {
            if (contactModal) contactModal.style.display = "none";
            contactForm.reset();
            contactForm.querySelector("button").innerText = originalText;
            contactForm.querySelector("button").style.backgroundColor = originalBackground;
        }, 2000);
    });
}

// Login
const currentUser = localStorage.getItem('currentUser');
const loginLink = document.querySelector('a[href="login.html"]');
if (currentUser && loginLink) {
    loginLink.innerText = "Logout";
    loginLink.style.color = "red";
    loginLink.href = "#";
    loginLink.addEventListener('click', () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('currentUser');
            window.location.reload();
        }
    });
}
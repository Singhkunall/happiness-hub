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

/* =========================================
   2. CART LOGIC
   ========================================= */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initial Load
updateCartUI();

function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Open Cart
const cartLink = document.getElementById('cart-count').parentElement;
cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleCart();
});

// Close Cart
closeCartBtn.addEventListener('click', toggleCart);
overlay.addEventListener('click', toggleCart);

// Add to Cart Logic
const addToCartButtons = document.querySelectorAll('.add-cart-btn');

addToCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const productCard = event.target.closest('.product');
        
        // Scrape Data
        const name = productCard.querySelector('.product-info h4').innerText;
        const priceText = productCard.querySelector('.product-info .price').innerText;
        const imgSrc = productCard.querySelector('.product-image-wrapper img').src;
        
        // Clean Price
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

        const product = { name, price, imgSrc };
        cart.push(product);

        updateCartUI();
        
        // Button Animation
        const originalText = button.innerText;
        const originalBackground = window.getComputedStyle(button).backgroundColor;
        
        button.innerText = "Added!";
        button.style.backgroundColor = "#4CAF50";
        
        setTimeout(() => {
            button.innerText = originalText;
            button.style.backgroundColor = originalBackground;
        }, 1000);
    });
});

function updateCartUI() {
    localStorage.setItem('cart', JSON.stringify(cart));
    cartCountElement.innerText = cart.length;
    
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotalElement.innerText = totalAmount.toFixed(2);

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

function removeItem(index) {
    cart.splice(index, 1); 
    updateCartUI();
}

// Checkout
if(checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty! Add some items first.");
        } else {
            alert(`Thank you for your purchase! Total: ₹${cartTotalElement.innerText}`);
            cart = []; 
            updateCartUI(); 
            toggleCart(); 
        }
    });
}

/* =========================================
   3. SCROLL TO TOP
   ========================================= */
if(scrollToTopBtn) {
    window.onscroll = function() {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* =========================================
   4. MOBILE MENU
   ========================================= */
const menuLinks = document.querySelectorAll('.menu a');
const menuCheckbox = document.getElementById('menu-toggle');

menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) { 
            menuCheckbox.checked = false; 
        }
    });
});

/* =========================================
   5. CONTACT MODAL
   ========================================= */
const contactBtn = document.getElementById("contact-btn");
const contactModal = document.getElementById("contact-modal");
const closeModalSpan = document.querySelector(".close-modal"); // Be careful if you have multiple modals
const contactForm = document.querySelector(".contact-form");

// Specific Contact Modal Close Logic
if (contactBtn) {
    contactBtn.addEventListener("click", (e) => {
        e.preventDefault();
        contactModal.style.display = "block";
    });
}

// Generic Modal Window Click (Closes any modal if background is clicked)
window.addEventListener("click", (e) => {
    if (e.target == contactModal) contactModal.style.display = "none";
    if (e.target == wishlistModal) wishlistModal.style.display = "none";
    if (e.target == productModal) productModal.style.display = "none";
});

// Find the specific close button for Contact modal (assuming it's the first one or use ID)
// Better to add IDs to your HTML close buttons to avoid confusion, but this works generally
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal-overlay').style.display = 'none';
    });
});

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        const originalText = contactForm.querySelector("button").innerText;
        const originalBackground = window.getComputedStyle(contactForm.querySelector("button")).backgroundColor;

        contactForm.querySelector("button").innerText = "Message Sent! ✅";
        contactForm.querySelector("button").style.backgroundColor = "#4CAF50";
        
        setTimeout(() => {
            contactModal.style.display = "none";
            contactForm.reset(); 
            contactForm.querySelector("button").innerText = originalText;
            contactForm.querySelector("button").style.backgroundColor = originalBackground;
        }, 2000);
    });
}

/* =========================================
   6. SEARCH FUNCTIONALITY
   ========================================= */
if (searchBox) {
    searchBox.addEventListener('keyup', (e) => {
        const searchText = e.target.value.toLowerCase();
        const products = document.querySelectorAll('.product');
        const noResultsMsg = document.getElementById('no-results');
        let hasVisibleItems = false;

        products.forEach(product => {
            const productName = product.querySelector('.product-info h4').innerText.toLowerCase();
            
            if (productName.includes(searchText)) {
                product.style.display = 'block'; // Or 'flex' depending on your css
                hasVisibleItems = true;
            } else {
                product.style.display = 'none';
            }
        });

        if (noResultsMsg) {
            noResultsMsg.style.display = hasVisibleItems ? 'none' : 'block';
        }
    });
}

/* =========================================
   7. WISHLIST LOGIC (With Click-Through)
   ========================================= */
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

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
        } else {
            wishlist.push({ name, price, imgSrc });
            btn.classList.add('active');
            alert(`${name} added to Wishlist! ❤️`);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    });
});

if (wishlistLink) {
    wishlistLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderWishlistItems();
        wishlistModal.style.display = 'block';
    });
}

function renderWishlistItems() {
    wishlistContainer.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty 💔</p>';
        return;
    }

    wishlist.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('wishlist-item');
        
        div.innerHTML = `
            <img src="${item.imgSrc}" alt="${item.name}" 
                 onclick="openProductFromWishlist('${item.name}')" 
                 style="cursor: pointer;">
            
            <div class="wishlist-details" 
                 onclick="openProductFromWishlist('${item.name}')" 
                 style="cursor: pointer;">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
            </div>
            
            <button onclick="removeFromWishlist(${index})" class="remove-wishlist-btn">Remove</button>
        `;
        wishlistContainer.appendChild(div);
    });
}

// Function to open product from wishlist
window.openProductFromWishlist = function(productName) {
    wishlistModal.style.display = 'none';

    const allProducts = document.querySelectorAll('.product');
    let found = false;

    allProducts.forEach(card => {
        const title = card.querySelector('.product-info h4').innerText;
        
        if (title === productName) {
            const img = card.querySelector('.product-image-wrapper img');
            if (img) {
                img.click();
                found = true;
            }
        }
    });

    if (!found) {
        alert("Product details available in main view!");
    }
};

window.removeFromWishlist = function(index) {
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderWishlistItems();
    updateWishlistIcons();
};

/* =========================================
   8. PRODUCT DETAILS MODAL (Quick View)
   ========================================= */
const productModal = document.getElementById('product-modal');
const closeProductModal = document.getElementById('close-product-modal');
const productImages = document.querySelectorAll('.product-image-wrapper img'); 

// Modal Elements
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

        modalImg.src = imgSrc;
        modalTitle.innerText = name;
        modalPrice.innerText = price;
        modalDesc.innerText = description;

        productModal.style.display = 'block';
        
        // Add to Cart from Modal
        modalAddBtn.onclick = function() {
            const mainAddBtn = productCard.querySelector('.add-cart-btn');
            if(mainAddBtn) mainAddBtn.click();
            productModal.style.display = 'none'; 
        };
    });
});

if(closeProductModal) {
    closeProductModal.addEventListener('click', () => {
        productModal.style.display = 'none';
    });
}

/* =========================================
   9. LOGIN / LOGOUT LOGIC
   ========================================= */
const currentUser = localStorage.getItem('currentUser');
const loginLink = document.querySelector('a[href="login.html"]');

if (currentUser && loginLink) {
    loginLink.innerText = "Logout";
    loginLink.style.color = "red"; 
    loginLink.href = "#"; 

    loginLink.addEventListener('click', () => {
        const confirmLogout = confirm("Are you sure you want to logout?");
        if (confirmLogout) {
            localStorage.removeItem('currentUser'); 
            window.location.reload(); 
        }
    });
}
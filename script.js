// Initialize Lucide Icons
lucide.createIcons();

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(5, 5, 7, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 10, 13, 0.8)';
        navbar.style.boxShadow = 'none';
    }
});

// --- Cart Management System ---
const CartManager = {
    storageKey: 'raiders_cart',

    getCart() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (e) {
            return [];
        }
    },

    saveCart(cart) {
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        this.updateBadge();
    },

    addToCart(item) {
        const cart = this.getCart();
        // Check if item already exists to increment quantity
        const existingItem = cart.find(i => i.title === item.title);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            item.quantity = 1;
            cart.push(item);
        }
        this.saveCart(cart);
        this.showToast(`🏍️ ${item.title} added to cart!`);
    },

    removeFromCart(index) {
        const cart = this.getCart();
        cart.splice(index, 1);
        this.saveCart(cart);
        if (document.getElementById('cartItemsList')) {
            this.renderCart();
        }
    },

    updateQuantity(index, delta) {
        const cart = this.getCart();
        if (cart[index]) {
            cart[index].quantity = Math.max(1, (cart[index].quantity || 1) + delta);
            this.saveCart(cart);
            this.renderCart();
        }
    },

    updateBadge() {
        const cart = this.getCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'cart-toast glass-panel';
        toast.style.cssText = `
            position: fixed; bottom: 2rem; right: 2rem; 
            padding: 1rem 1.5rem; background: var(--bg-surface);
            border: 1px solid var(--accent-color); border-radius: 0.75rem;
            color: white; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: slideUp 0.3s ease;
        `;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    renderCart() {
        const container = document.getElementById('cartItemsList');
        const subtotalEl = document.getElementById('cartSubtotal');
        const taxEl = document.getElementById('cartTax');
        const totalEl = document.getElementById('cartTotal');
        
        if (!container) return;

        const cart = this.getCart();
        
        if (cart.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 4rem 1rem;">
                    <i data-lucide="shopping-bag" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3>Your cart is empty</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">Looks like you haven't added anything yet.</p>
                    <a href="gear.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            if (subtotalEl) {
                subtotalEl.textContent = '₹0.00';
                taxEl.textContent = '₹0.00';
                totalEl.textContent = '₹0.00';
            }
            lucide.createIcons();
            return;
        }

        let html = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const price = parseFloat(item.price);
            const qty = item.quantity || 1;
            subtotal += price * qty;
            
            html += `
                <div class="cart-item">
                    <div class="cart-img" style="background-image: url('${item.image}');"></div>
                    <div class="cart-details">
                        <h3 class="cart-title">${item.title}</h3>
                        <p class="cart-meta">${item.category}</p>
                        <div class="quantity-control">
                            <button class="qty-btn" onclick="CartManager.updateQuantity(${index}, -1)">-</button>
                            <span>${qty}</span>
                            <button class="qty-btn" onclick="CartManager.updateQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-price">₹${(price * qty).toFixed(2)}</div>
                    <button class="icon-btn" style="color:#ef4444;" onclick="CartManager.removeFromCart(${index})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
        lucide.createIcons();

        // Update Summary
        if (subtotalEl) {
            const tax = subtotal * 0.09; // 9% tax
            const total = subtotal + tax;
            subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
            taxEl.textContent = `₹${tax.toFixed(2)}`;
            totalEl.textContent = `₹${total.toFixed(2)}`;
        }
    },

    saveOrder(customerDetails) {
        const cart = this.getCart();
        if (cart.length === 0) return;

        const orders = JSON.parse(localStorage.getItem('raiders_orders')) || [];
        const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);
        const tax = subtotal * 0.09;

        const newOrder = {
            id: 'ORD-' + Math.floor(Math.random() * 90000 + 10000),
            date: new Date().toLocaleString(),
            customer: customerDetails.name,
            phone: customerDetails.phone,
            address: customerDetails.address,
            paymentMethod: customerDetails.payment,
            hasPhoto: customerDetails.hasPhoto,
            items: cart,
            total: (subtotal + tax).toFixed(2),
            status: 'Pending'
        };

        orders.unshift(newOrder); // Add to beginning
        localStorage.setItem('raiders_orders', JSON.stringify(orders));
        localStorage.removeItem(this.storageKey); // Clear cart
        this.updateBadge();
        
        alert(`Order ${newOrder.id} Placed Successfully! Our team will contact you shortly.`);
        window.location.href = 'index.html';
    }
};

// Global Add to Cart listener
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
        e.preventDefault();
        const item = {
            title: btn.dataset.title || 'Product',
            price: btn.dataset.price || '0',
            image: btn.dataset.image || '',
            category: btn.dataset.category || 'Gear'
        };
        CartManager.addToCart(item);

        // Simple button animation
        btn.classList.add('btn-pop');
        setTimeout(() => btn.classList.remove('btn-pop'), 200);
    }
});

// Initialize Cart on Load
document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateBadge();
    if (document.getElementById('cartItemsList')) {
        CartManager.renderCart();
    }
});

// Bike Tracker Logic Mockup
const trackerForm = document.getElementById('trackerForm');
const regNoInput = document.getElementById('regNo');
const otpGroup = document.getElementById('otpGroup');
const otpCodeInput = document.getElementById('otpCode');
const trackingResult = document.getElementById('trackingResult');
const trackerBtn = document.getElementById('trackerBtn');

let trackerStep = 1;

if (trackerForm && regNoInput && otpGroup && otpCodeInput && trackingResult && trackerBtn) {
    trackerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (trackerStep === 1) {
            if (regNoInput.value.trim() === '') return;
            trackerBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Verifying...';
            lucide.createIcons();
            setTimeout(() => {
                regNoInput.readOnly = true;
                regNoInput.style.opacity = '0.5';
                otpGroup.classList.remove('hidden');
                trackerBtn.innerHTML = 'View Live Status';
                trackerStep = 2;
            }, 1000);
            
        } else if (trackerStep === 2) {
            if (otpCodeInput.value.trim() === '') return;
            trackerBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Fetching Data...';
            lucide.createIcons();
            setTimeout(() => {
                trackerForm.classList.add('hidden');
                trackingResult.classList.remove('hidden');
                lucide.createIcons();
                // Start the right map based on which page we're on
                if (document.getElementById('homeMap')) {
                    startHomeTracking();
                } else {
                    startLiveTracking();
                }
            }, 1200);
        }
    });
}

function startHomeTracking() {
    const timerElement = document.getElementById('homeCountdown');
    const progressFill = document.getElementById('homeProgressFill');

    // --- Tamil Nadu Coordinates (Chennai Route) ---
    const routePoints = [
        [13.0827, 80.2707], // Start: Chennai Central
        [13.0720, 80.2620],
        [13.0640, 80.2550],
        [13.0560, 80.2480],
        [13.0480, 80.2410],
        [13.0418, 80.2341]  // End: T. Nagar
    ];
    const destination = routePoints[routePoints.length - 1];

    const map = L.map('homeMap', {
        center: routePoints[0],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

    L.polyline(routePoints, { color: '#f59e0b', weight: 3, dashArray: '8,6', opacity: 0.8 }).addTo(map);

    // --- Fullscreen Toggle Logic for Home Widget ---
    const mapElement = document.getElementById('homeMap');
    mapElement.style.cursor = 'pointer';
    mapElement.title = "Click to Expand Map";

    mapElement.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            mapElement.requestFullscreen().then(() => {
                map.dragging.enable();
                map.scrollWheelZoom.enable();
                map.invalidateSize();
            }).catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== mapElement) {
            // Reset when exiting fullscreen
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.setView(routePoints[0], 13); 
            map.invalidateSize();
        }
    });

    const destIcon = L.divIcon({
        html: `<div style="background:#10b981;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(16,185,129,0.8);"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });
    L.marker(destination, { icon: destIcon }).addTo(map)
        .bindPopup('<b>🏠 Your Home</b>', { className: 'home-tracker-popup' }).openPopup();

    const bikeIcon = L.divIcon({
        html: `<div style="background:#f59e0b;width:32px;height:32px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 14px rgba(245,158,11,0.7);">🏍️</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16], className: ''
    });
    const bikeMarker = L.marker(routePoints[0], { icon: bikeIcon }).addTo(map)
        .bindPopup(`<b>🏍️ Mike</b><br>In Transit`, { className: 'home-tracker-popup' }).openPopup();

    let step = 0;
    let progress = 66;
    let demoMins = 25;

    const moveInterval = setInterval(() => {
        step++;
        if (step >= routePoints.length) { clearInterval(moveInterval); timerElement.textContent = 'Arriving!'; return; }
        bikeMarker.setLatLng(routePoints[step]);
        map.panTo(routePoints[step], { animate: true, duration: 0.8 });
    }, 4000);

    const demoTimer = setInterval(() => {
        demoMins--;
        if (demoMins <= 0) { clearInterval(demoTimer); return; }
        timerElement.textContent = demoMins + ' mins';
        if (progress < 92) { progress += 1.5; progressFill.style.width = progress + '%'; }
    }, 8000);
}


function startLiveTracking() {
    const timerElement = document.getElementById('countdownTimer');
    const progressFill = document.getElementById('progressFill');

    // --- Real coordinates: Tamil Nadu, India (simulated recovery route) ---
    // Route: Last Known Location → Moving Target
    const routePoints = [
        [13.0827, 80.2707],  // Start: Chennai Central
        [13.0720, 80.2620],
        [13.0640, 80.2550],
        [13.0560, 80.2480],
        [13.0480, 80.2410],
        [13.0418, 80.2341]   // Moving Target: T. Nagar
    ];
    const destination = routePoints[routePoints.length - 1];

    // --- Initialize Leaflet Map ---
    const map = L.map('liveMap', {
        center: routePoints[0],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
    });

    // Dark-style OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    // --- Fullscreen Control Button for Live Map ---
    const FSControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.style.backgroundColor = '#fff';
            container.style.width = '30px';
            container.style.height = '30px';
            container.style.cursor = 'pointer';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.title = "Toggle Fullscreen";
            container.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
            
            container.onclick = (e) => {
                e.stopPropagation();
                !document.fullscreenElement ? document.getElementById('liveMap').requestFullscreen() : document.exitFullscreen();
            };
            return container;
        }
    });
    map.addControl(new FSControl());
    document.addEventListener('fullscreenchange', () => map.invalidateSize());

    // Draw the dashed route path
    L.polyline(routePoints, {
        color: '#ef4444', // Red for Alert/Missing
        weight: 4,
        dashArray: '10, 8',
        opacity: 0.8
    }).addTo(map);

    // Start/Last Known Pin (Grey)
    const destIcon = L.divIcon({
        html: `<div style="background:#64748b;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(100,116,139,0.8);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: ''
    });
    L.marker(routePoints[0], { icon: destIcon })
        .addTo(map)
        .bindPopup('<b>📍 Last Known Location</b><br>Signal Lost: 2h ago', { className: 'bike-map-popup' })
        .openPopup();

    // Target Vehicle Marker (Animated Red Target)
    const bikeIcon = L.divIcon({
        html: `<div style="background:#ef4444;width:36px;height:36px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 20px rgba(239,68,68,0.9); animation: pulse 1s infinite;">🎯</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        className: ''
    });
    const bikeMarker = L.marker(routePoints[1], { icon: bikeIcon })
        .addTo(map)
        .bindPopup(`<b>⚠️ Target Vehicle</b><br>Moving: 42km/h • Signal Strong`, { className: 'bike-map-popup' })
        .openPopup();

    // --- Animate marker along route ---
    let step = 1;
    let minutes = 25;
    let progress = 66;

    const moveInterval = setInterval(() => {
        step++;
        if (step >= routePoints.length) {
            step = 0; // Loop tracking simulation
        }
        bikeMarker.setLatLng(routePoints[step]);
        map.panTo(routePoints[step], { animate: true, duration: 1 });
    }, 4000); // Move to next point every 4 seconds

    // --- Signal Updates ---
    const timerInterval = setInterval(() => {
        // Simulate latency fluctuation
        const ms = Math.floor(Math.random() * (45 - 12 + 1) + 12);
        timerElement.textContent = ms + ' ms';
        if (progress < 92) {
            progress += 1;
            progressFill.style.width = progress + '%';
        }
    }, 2000); 
}


// Quality Report Modal & Pie Chart Logic
const reportBtns = document.querySelectorAll('.view-report-btn');
const reportModal = document.getElementById('reportModal');
const closeModalBtn = document.getElementById('closeModal');
let qualityChartInstance = null;

if (reportBtns.length > 0 && reportModal && closeModalBtn) {
    reportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            reportModal.classList.add('show');
            
            // Re-draw icons inside modal
            lucide.createIcons();
            
            const qualityChartCanvas = document.getElementById('qualityChart');
            if (!qualityChartCanvas) return;

            const ctx = qualityChartCanvas.getContext('2d');
            
            // Destroy existing chart if it exists to animate again
            if (qualityChartInstance) {
                qualityChartInstance.destroy();
            }
            Chart.defaults.color = '#94a3b8';
            Chart.defaults.font.family = "'Inter', sans-serif";
            
            // Create New Premium Doughnut Chart
            qualityChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Engine Health', 'Frame & Body', 'Electricals', 'Tires', 'Suspension'],
                    datasets: [{
                        data: [85, 90, 75, 95, 80],
                        backgroundColor: [
                            '#f59e0b', // Amber
                            '#10b981', // Green
                            '#3b82f6', // Blue
                            '#8b5cf6', // Purple
                            '#ef4444'  // Red
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { padding: 20, color: '#f8fafc' }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(20, 20, 26, 0.9)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14, weight: 'bold' },
                            padding: 12,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1
                        }
                    }
                }
            });
        });
    });

    closeModalBtn.addEventListener('click', () => {
        reportModal.classList.remove('show');
    });

    // Close modal on outside click
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.remove('show');
        }
    });
}

// --- Profile & Login Management ---
const ProfileManager = {
    storageKey: 'raiders_user',

    getUser() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey));
        } catch (e) {
            return null;
        }
    },

    saveUser(userData) {
        // Ensure joined is set
        if (userData.joined === undefined) {
            userData.joined = false;
        }
        localStorage.setItem(this.storageKey, JSON.stringify(userData));
        this.updateUI();
    },

    joinCrew() {
        const user = this.getUser();
        if (!user) {
            alert('Please login first to join the Raiders Crew!');
            window.location.href = 'login.html';
            return;
        }
        user.joined = true;
        this.saveUser(user);
        
        // Add to crew list
        this.addToCrewList(user);
        
        alert('Welcome to the Raiders Crew! You are now a member.');
    },

    addToCrewList(user) {
        const crewList = this.getCrewList();
        const existing = crewList.find(member => member.email === user.email);
        if (!existing) {
            crewList.push({
                name: user.name,
                email: user.email,
                joinedDate: new Date().toLocaleDateString()
            });
            localStorage.setItem('raiders_crew', JSON.stringify(crewList));
        }
    },

    getCrewList() {
        try {
            return JSON.parse(localStorage.getItem('raiders_crew')) || [];
        } catch (e) {
            return [];
        }
    },

    logout() {
        localStorage.removeItem(this.storageKey);
        this.updateUI();
    },

    updateUI() {
        const profileBtn = document.getElementById('profileBtn');
        const profilePhoto = document.querySelector('.profile-photo');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const navLoginLink = document.querySelector('a[href="login.html"]');
        const profileLink = document.querySelector('a[href="profile.html"]');
        const user = this.getUser();

        if (user) {
            // Update Badge for Notifications
            const unreadCount = NotificationManager.getUnreadCount(user.email);
            if (profileLink) {
                const badgeHtml = unreadCount > 0 ? `<span class="badge" style="background:#ef4444; color:white; padding:0.1rem 0.4rem; font-size:0.7rem; margin-left:5px;">${unreadCount}</span>` : '';
                profileLink.innerHTML = `<i data-lucide="user"></i> My Profile ${badgeHtml}`;
            }

            if (profilePhoto) {
                profilePhoto.src = user.photo || 'https://via.placeholder.com/32';
                profilePhoto.alt = user.name || 'Profile';
            }
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'flex';
            if (navLoginLink) navLoginLink.style.display = 'none';
        } else {
            if (profilePhoto) {
                profilePhoto.src = 'https://via.placeholder.com/32';
                profilePhoto.alt = 'Profile';
            }
            if (loginBtn) loginBtn.style.display = 'flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (navLoginLink) navLoginLink.style.display = 'inline';
        }
    }
};

// Global functions
window.joinRaidersCrew = () => ProfileManager.joinCrew();
window.openCallbackModal = () => {
    const modal = document.getElementById('callbackModal');
    if (modal) modal.classList.add('show');
};
window.openModifyModal = () => {
    const modal = document.getElementById('modifyModal');
    if (modal) modal.classList.add('show');
};

// Profile dropdown toggle
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });
}

// Login modal functionality
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        window.location.href = 'login.html';
    });
}

if (closeLoginModal && loginModal) {
    closeLoginModal.addEventListener('click', () => {
        loginModal.classList.remove('show');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Mock user data
        const userData = {
            name: email.split('@')[0].toUpperCase(),
            email: email,
            photo: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=f59e0b&color=fff`,
            loginTime: new Date().toLocaleString(),
            loggedIn: true
        };

        ProfileManager.saveUser(userData);
        loginModal.classList.remove('show');
        loginForm.reset();
        alert('Welcome ' + userData.name + '! Redirecting to home...');
        
        // Redirect to home page after 1 second
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        ProfileManager.logout();
        profileDropdown.classList.remove('show');
        alert('You have been logged out');
    });
}

// Callback modal functionality
const callbackModal = document.getElementById('callbackModal');
const closeCallbackModal = document.getElementById('closeCallbackModal');
const callbackForm = document.getElementById('callbackForm');

if (closeCallbackModal && callbackModal) {
    closeCallbackModal.addEventListener('click', () => {
        callbackModal.classList.remove('show');
    });

    callbackModal.addEventListener('click', (e) => {
        if (e.target === callbackModal) {
            callbackModal.classList.remove('show');
        }
    });
}

if (callbackForm) {
    callbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('callbackName').value;
        const phone = document.getElementById('callbackPhone').value;
        const message = document.getElementById('callbackMessage').value;

        if (!name || !phone) {
            alert('Please fill in your name and phone number');
            return;
        }

        // Save callback request
        const callbackRequest = {
            name: name,
            phone: phone,
            message: message || '',
            timestamp: new Date().toLocaleString(),
            status: 'pending'
        };

        const requests = JSON.parse(localStorage.getItem('callback_requests')) || [];
        requests.push(callbackRequest);
        localStorage.setItem('callback_requests', JSON.stringify(requests));

        alert('Thank you! We\'ll call you back within 24 hours.');
        callbackModal.classList.remove('show');
        callbackForm.reset();
    });
}

// Initialize profile UI on page load
document.addEventListener('DOMContentLoaded', () => {
    ProfileManager.updateUI();
    SearchManager.init();
});

// --- Admin Order Management ---
const AdminOrderManager = {
    currentFilter: 'all',
    getOrders() {
        try {
            return JSON.parse(localStorage.getItem('raiders_orders')) || [];
        } catch (e) {
            return [];
        }
    },

    saveOrders(orders) {
        localStorage.setItem('raiders_orders', JSON.stringify(orders));
        this.renderOrders(); // Will re-render with the current filter
    },

    updateStatus(orderId, status) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex > -1) {
            orders[orderIndex].status = status;
            this.saveOrders(orders);
            alert(`Order ${orderId} marked as ${status}`);
        }
    },

    promptDispatch(orderId) {
        if (confirm(`Dispatch order ${orderId}? A driver will be assigned and the item will be routed for delivery.`)) {
            const orders = this.getOrders();
            const orderIndex = orders.findIndex(o => o.id === orderId);
            if (orderIndex > -1) {
                orders[orderIndex].status = 'Dispatched';
                AdminDispatchManager.createDispatch(orders[orderIndex]);
                this.saveOrders(orders);
                alert(`Order ${orderId} dispatched! View in Service Dispatch.`);
            }
        }
    },

    setFilter(brand) {
        this.currentFilter = brand;
        this.renderOrders();
    },

    renderOrders(isRefresh = false) {
        const container = document.getElementById('adminOrdersList');
        if (!container) return;

        let orders = this.getOrders();
        
        // Filter logic
        if (this.currentFilter !== 'all') {
            orders = orders.filter(order => 
                order.items.some(item => 
                    item.title.toLowerCase().includes(this.currentFilter.toLowerCase())
                )
            );
        }
        
        if (orders.length === 0) {
            if (this.currentFilter === 'all') {
                container.innerHTML = '<div class="panel" style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No orders received yet.</div>';
            } else {
                container.innerHTML = `<div class="panel" style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No orders found for brand: ${this.currentFilter}.</div>`;
            }
            return;
        }

        let html = '';
        orders.forEach((order, index) => {
            let statusBadge = '';
            let actions = '';
            
            if (order.status === 'Pending') {
                statusBadge = '<span class="badge badge-pending">Pending Review</span>';
                actions = `
                    <button class="btn btn-primary" onclick="AdminOrderManager.updateStatus('${order.id}', 'Accepted')"><i data-lucide="check"></i> Accept</button>
                    <button class="btn btn-outline" style="border-color: #ef4444; color: #ef4444;" onclick="AdminOrderManager.updateStatus('${order.id}', 'Rejected')"><i data-lucide="x"></i> Reject</button>
                `;
            } else if (order.status === 'Accepted') {
                statusBadge = '<span class="badge badge-success">Accepted</span>';
                actions = `
                    <button class="btn btn-primary" style="background-color: #3b82f6;" onclick="AdminOrderManager.promptDispatch('${order.id}')"><i data-lucide="truck"></i> Dispatch Now</button>
                    <button class="btn btn-outline" disabled style="opacity: 0.6;"><i data-lucide="wrench"></i> In Service</button>
                `;
            } else if (order.status === 'Dispatched') {
                statusBadge = '<span class="badge" style="background-color: rgba(59, 130, 246, 0.2); color: #3b82f6; border-color: rgba(59, 130, 246, 0.4);">Out for Delivery</span>';
                actions = `<a href="admin-dispatch.html" class="btn btn-outline" style="grid-column: 1 / -1; text-align: center;"><i data-lucide="map-pin"></i> Track in Dispatch</a>`;
            } else {
                statusBadge = '<span class="badge badge-danger">Rejected</span>';
                actions = `<button class="btn btn-outline" disabled style="opacity: 0.6; border-color: #ef4444; color: #ef4444;"><i data-lucide="ban"></i> Archived</button>`;
            }

            const itemsList = order.items.map(i => `<div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.2rem;"><span style="color:var(--text-secondary);">${i.quantity || 1}x ${i.title}</span><span>₹${i.price}</span></div>`).join('');

            const flashClass = isRefresh && index === 0 && this.currentFilter === 'all' ? 'new-order-flash' : '';

            html += `
                <div class="panel order-card ${flashClass}" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:start; border-bottom:1px solid var(--border-glass); padding-bottom:1rem;">
                        <div>
                            <h3 style="margin-bottom:0.2rem; font-family: monospace;">${order.id}</h3>
                            <p class="text-secondary" style="font-size:0.85rem;">${order.date}</p>
                        </div>
                        ${statusBadge}
                    </div>
                    <div>
                        <p><strong>${order.customer}</strong></p>
                        <p class="text-secondary" style="font-size:0.9rem;">${order.phone}<br>${order.address}</p>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 0.5rem;">${itemsList}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:1.1rem; margin-top: auto;"><span>Total:</span> <span class="text-accent">₹${order.total}</span></div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top:0.5rem;">${actions}</div>
                </div>
            `;
        });
        container.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    },

    init() {
        this.renderOrders();
    }
};

// --- Search Management System ---
const SearchManager = {
    // Hardcoded Database of site content for instant search
    staticDB: [
        { title: "Axor Apex V2", price: 12500, category: "Premium Helmets", image: "https://m.media-amazon.com/images/S/aplus-media-library-service-media/eda0149e-25bf-489e-93bb-1d80aa98dbd3.__CR0,0,970,600_PT0_SX970_V1___.jpg" },
        { title: "Rynox Stealth Evo", price: 18500, category: "Riding Jackets", image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&q=80" },
        { title: "Quad Lock Mount Pro", price: 4999, category: "Tech Gadgets", image: "https://m.media-amazon.com/images/I/61fPSInDU9L._AC_SL1500_.jpg" },
        { title: "Akrapovič Titanium Slip-On", price: 1250, category: "Exhaust Systems", image: "https://images.unsplash.com/photo-1622185124086-162f63d837f8?auto=format&fit=crop&q=80" },
        { title: "Brembo GP4-RX Calipers", price: 1800, category: "Braking", image: "https://images.unsplash.com/photo-1568772585407-9361f9bfce87?auto=format&fit=crop&q=80" },
        { title: "Pirelli Diablo Supercorsa V3", price: 220, category: "Tyres", image: "https://images.unsplash.com/photo-1558980664-2db8c8fa7273?auto=format&fit=crop&q=80" },
        { title: "Öhlins FGRT 200 Forks", price: 2950, category: "Suspension", image: "https://images.unsplash.com/photo-1541094367332-90f7a77ea4f9?auto=format&fit=crop&q=80" },
        { title: "Ducati Panigale V4 S", price: 32000, category: "New Bike", image: "https://images.unsplash.com/photo-1616789916307-a72506e0691e?auto=format&fit=crop&q=80" },
        { title: "KTM 1290 Super Duke R", price: 55000, category: "New Bike", image: "https://images.unsplash.com/photo-1568772585407-9361f9bfce87?auto=format&fit=crop&q=80" },
        { title: "Royal Enfield Classic 350", price: 50000, category: "Used Bike", image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80" },
        { title: "Yamaha YZF R3", price: 20500, category: "Used Bike", image: "https://imgd.aeplcdn.com/310x174/bw/ec/23418/Yamaha-YZFR3-Side-72784.jpg?wm=0&q=75" },
        { title: "Triumph Bonneville", price: 26200, category: "Used Bike", image: "https://tse3.mm.bing.net/th/id/OIP.lvgXV5PAHpO3FMnYjse5bQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" },
        { title: "KTM Duke 390", price: 33100, category: "Used Bike", image: "https://www.thrustzone.com/wp-content/uploads/2020/02/2020-KTM-Duke-390-BS6-Review-9.jpg" },
        { title: "AGV Pista GP RR Carbon", price: 135000, category: "Premium Helmets", image: "https://images.unsplash.com/photo-1618355272254-14f0165a7a7a?auto=format&fit=crop&q=80" },
        { title: "Alpinestars SMX-6 V2 Boots", price: 38000, category: "Boots", image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80" },
        { title: "Cardo Packtalk Edge", price: 32000, category: "Tech & Communication", image: "https://images.unsplash.com/photo-1593005510509-d05b264f1c9c?auto=format&fit=crop&q=80" },
        { title: "Dainese Racing 4 Jacket", price: 45000, category: "Riding Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80" },
        { title: "Rev'it! Sand 4 Gloves", price: 12000, category: "Riding Gloves", image: "https://ucarecdn.com/2be0e196-b930-4170-b177-915d7c5489b8/-/format/auto/-/preview/1080x1080/-/quality/lighter/Features.jpg" }
    ],

    init() {
        this.injectOverlay();
        this.bindEvents();
    },

    injectOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.id = 'globalSearchOverlay';
        overlay.innerHTML = `
            <div class="search-header">
                <button class="search-close" id="closeSearch"><i data-lucide="x" style="width:32px; height:32px;"></i></button>
            </div>
            <div class="search-container">
                <input type="text" class="search-input" id="globalSearchInput" placeholder="Type to search products, bikes, gear..." autocomplete="off">
                <div class="search-results" id="searchResults"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    bindEvents() {
        const triggers = document.querySelectorAll('.search-trigger');
        const overlay = document.getElementById('globalSearchOverlay');
        const closeBtn = document.getElementById('closeSearch');
        const input = document.getElementById('globalSearchInput');

        triggers.forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.classList.add('active');
                setTimeout(() => input.focus(), 100);
                document.body.style.overflow = 'hidden';
            });
        });

        const close = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', close);
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) close();
        });

        // Search Logic
        input.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
    },

    performSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }

        const term = query.toLowerCase();
        
        // Merge Static DB with LocalStorage Dynamic Products
        const dynamicProducts = JSON.parse(localStorage.getItem('raiders_products')) || [];
        const allItems = [...this.staticDB, ...dynamicProducts];

        const results = allItems.filter(item => 
            item.title.toLowerCase().includes(term) || 
            item.category.toLowerCase().includes(term)
        );

        if (results.length === 0) {
            resultsContainer.innerHTML = `<p class="text-secondary" style="text-align:center; margin-top:2rem;">No results found for "${query}"</p>`;
            return;
        }

        resultsContainer.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="SearchManager.selectItem('${item.title}', '${item.price}', '${item.image}', '${item.category}')">
                <div class="search-result-thumb" style="background-image: url('${item.image}')"></div>
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:1.1rem;">${item.title}</h4>
                    <span class="text-secondary" style="font-size:0.85rem;">${item.category}</span>
                </div>
                <div class="text-accent" style="font-weight:bold; font-size:1.1rem;">₹${parseFloat(item.price).toLocaleString()}</div>
                <button class="icon-btn" style="background:var(--accent-color); color:white;"><i data-lucide="arrow-right"></i></button>
            </div>
        `).join('');
        
        if(window.lucide) lucide.createIcons();
    },

    selectItem(title, price, image, category) {
        // Add to cart and redirect to cart
        CartManager.addToCart({ title, price, image, category });
        window.location.href = 'cart.html';
    }
};

// --- Admin Inventory Management ---
const AdminInventoryManager = {
    getInventory() {
        return JSON.parse(localStorage.getItem('raiders_products')) || [];
    },

    saveInventory(products) {
        localStorage.setItem('raiders_products', JSON.stringify(products));
        this.renderInventory();
    },

    addProduct(product) {
        const products = this.getInventory();
        products.push(product);
        this.saveInventory(products);
    },

    deleteProduct(index) {
        if(confirm('Are you sure you want to remove this item?')) {
            const products = this.getInventory();
            products.splice(index, 1);
            this.saveInventory(products);
        }
    },

    renderInventory() {
        const container = document.getElementById('inventoryList');
        if (!container) return;

        const products = this.getInventory();
        
        if (products.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-secondary);">Inventory is empty. Add items to get started.</td></tr>';
            return;
        }

        container.innerHTML = products.map((item, index) => `
            <tr>
                <td style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${item.image}" class="product-thumb" alt="img">
                    <span style="font-weight: 500;">${item.title}</span>
                </td>
                <td><span class="badge" style="margin:0; font-size: 0.75rem;">${item.category}</span></td>
                <td class="text-accent">₹${parseFloat(item.price).toLocaleString()}</td>
                <td><span style="color: var(--success); font-size: 0.9rem;">● Active</span></td>
                <td>
                    <button class="icon-btn" style="color: #ef4444;" onclick="AdminInventoryManager.deleteProduct(${index})"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join('');
        
        if (window.lucide) lucide.createIcons();
    },

    init() {
        this.renderInventory();
    }
};

// --- Admin Dispatch Management ---
const AdminDispatchManager = {
    storageKey: 'raiders_dispatches',
    drivers: [
        { id: 'Mike-7', name: 'Mike', avatar: 'M' },
        { id: 'Sarah-2', name: 'Sarah', avatar: 'S' },
        { id: 'David-T', name: 'David', avatar: 'D' },
        { id: 'Alex-R', name: 'Alex', avatar: 'A' }
    ],

    getDispatches() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    },

    saveDispatches(dispatches) {
        localStorage.setItem(this.storageKey, JSON.stringify(dispatches));
    },

    createDispatch(order) {
        const dispatches = this.getDispatches();
        const randomDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)];
        
        const newDispatch = {
            dispatchId: 'DEL-' + Math.floor(Math.random() * 9000 + 1000),
            orderId: order.id,
            asset: order.items.map(i => i.title).join(', '),
            destination: order.address,
            driver: randomDriver,
            status: 'En Route',
            eta: Math.floor(Math.random() * (45 - 10 + 1) + 10) // Random ETA between 10 and 45 mins
        };

        dispatches.unshift(newDispatch);
        this.saveDispatches(dispatches);
    },

    completeDispatch(dispatchId) {
        if (confirm(`Mark dispatch ${dispatchId} as delivered?`)) {
            let dispatches = this.getDispatches();
            dispatches = dispatches.filter(d => d.dispatchId !== dispatchId);
            this.saveDispatches(dispatches);
            this.renderDispatches();
            alert('Dispatch completed and removed from live view.');
        }
    },

    renderDispatches() {
        const container = document.getElementById('dispatchGrid');
        if (!container) return;
        const dispatches = this.getDispatches();
        if (dispatches.length === 0) {
            container.innerHTML = `<div class="panel" style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No active dispatches.</div>`;
            return;
        }
        container.innerHTML = dispatches.map(dispatch => `<div class="panel"><div style="display:flex; justify-content:space-between; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;"><h3 style="color: #10b981; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="activity"></i> ${dispatch.status}</h3><span class="text-secondary" style="font-family: monospace;">${dispatch.dispatchId}</span></div><p><strong>Asset:</strong> ${dispatch.asset}</p><p class="text-secondary"><strong>Destination:</strong> ${dispatch.destination}</p><p class="text-secondary" style="margin-bottom: 1.5rem;"><strong>Driver:</strong> ${dispatch.driver.name} <br><strong>ETA:</strong> ${dispatch.eta} Minutes</p><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: auto;"><button class="btn btn-outline" onclick="alert('Pinging Driver Radio...')"><i data-lucide="radio"></i> Contact Driver</button><button class="btn btn-primary" onclick="AdminDispatchManager.completeDispatch('${dispatch.dispatchId}')"><i data-lucide="check-circle"></i> Mark Delivered</button></div></div>`).join('');
        if (window.lucide) lucide.createIcons();
    },

    init() {
        this.renderDispatches();
    }
};

// --- Admin Transparency Engine ---
const AdminTransparencyEngine = {
    init() {
        this.render();
        if (window.lucide) lucide.createIcons();
    },

    getProducts() {
        const allProducts = JSON.parse(localStorage.getItem('raiders_products')) || [];
        // Filter for items added via transparency engine or marketplace sell requests
        return allProducts.filter(p => p.isUsedBike || p.category === 'Used Bikes' || p.category === 'Customer Listing');
    },

    calculateQualityScore(product) {
        let score = 100;
        if (product.damages && product.damages.length > 0) {
            score -= product.damages.length * 5; // -5 points per damage item
        }
        return Math.max(score, 60); // Demo floor
    },

    render() {
        const container = document.getElementById('transparencyTableBody');
        if (!container) return;

        const products = this.getProducts();

        if (products.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-secondary" style="text-align:center; padding: 2rem;">No used bikes with quality reports found. Add one from the Control Center.</td></tr>';
            return;
        }

        container.innerHTML = products.map(product => {
            const qualityScore = this.calculateQualityScore(product);
            let qualityText = 'Pristine';
            if (qualityScore < 95) qualityText = 'Excellent';
            if (qualityScore < 90) qualityText = 'Good';
            if (qualityScore < 80) qualityText = 'Fair';

            const damageHTML = product.damages && product.damages.length > 0
                ? product.damages.map(dmg => `<span class="damage-icon"><i data-lucide="alert-triangle" style="width:12px; height:12px;"></i> ${dmg}</span>`).join('')
                : '<span style="font-size: 0.9rem; color: var(--success);">Clean (No Major Faults)</span>';

            return `
                <tr>
                    <td><strong>${product.title}</strong><br><span class="text-secondary">#INV-${product.id.toString().slice(-5)}</span></td>
                    <td>₹${parseFloat(product.price).toLocaleString()}<br><span style="color:#10b981; font-size: 0.8rem;">Active Listing</span></td>
                    <td>${damageHTML}</td>
                    <td><strong>${qualityScore}%</strong><br><span class="text-secondary">${qualityText}</span></td>
                    <td><button class="btn btn-outline" style="padding: 0.4rem 1rem;">Edit Report</button></td>
                </tr>
            `;
        }).join('');

        if(window.lucide) lucide.createIcons();
    }
};

// --- Admin Scanning Management ---
const AdminScanningManager = {
    storageKey: 'raiders_scan_logs',

    getScanLogs() {
        let logs = JSON.parse(localStorage.getItem(this.storageKey));
        if (!logs || logs.length === 0) {
            // Generate mock data for demo
            logs = [
                { date: new Date(Date.now() - 1000 * 60 * 18).toLocaleString(), model: 'Ducati Panigale V4', user: 'Guest (IP: 192...81)', parts: 'Ohlins, Brembo, Akra', confidence: 98.4 },
                { date: new Date(Date.now() - 1000 * 60 * 120).toLocaleString(), model: 'KTM Duke 390', user: 'Member: MikeRider', parts: 'Engine, Tires, Chain', confidence: 96.8 },
                { date: new Date(Date.now() - 1000 * 60 * 60 * 5).toLocaleString(), model: 'BMW R1250 GS', user: 'Guest (IP: 104...22)', parts: 'Suspension, Luggage', confidence: 89.2 },
                { date: new Date(Date.now() - 1000 * 60 * 60 * 12).toLocaleString(), model: 'Kawasaki Z900', user: 'Guest (IP: 45...192)', parts: 'Exhaust, Brakes', confidence: 95.1 },
            ];
            localStorage.setItem(this.storageKey, JSON.stringify(logs));
        }
        return logs;
    },

    addScanLog(logData) {
        const logs = this.getScanLogs();
        logs.unshift(logData); // Add to the top
        if (logs.length > 50) logs.pop(); // Keep the log size manageable
        localStorage.setItem(this.storageKey, JSON.stringify(logs));
    },

    render() {
        const container = document.getElementById('scanLogBody');
        if (!container) return;

        const logs = this.getScanLogs();

        // Update Stats
        document.getElementById('statTotalScans').textContent = logs.length;
        const avg = logs.reduce((sum, log) => sum + log.confidence, 0) / (logs.length || 1);
        document.getElementById('statAvgConfidence').textContent = `${avg.toFixed(1)}%`;
        
        const modelCounts = logs.reduce((acc, log) => {
            acc[log.model] = (acc[log.model] || 0) + 1;
            return acc;
        }, {});
        const mostScanned = Object.keys(modelCounts).sort((a, b) => modelCounts[b] - modelCounts[a])[0];
        document.getElementById('statMostScanned').textContent = mostScanned || 'N/A';

        // Render Table
        container.innerHTML = logs.map(log => {
            let confidenceColor = log.confidence > 95 ? 'var(--success)' : (log.confidence > 90 ? 'var(--warning)' : '#ef4444');
            return `
                <tr>
                    <td class="text-secondary">${log.date}</td>
                    <td><span class="model-tag">${log.model}</span></td>
                    <td>${log.user}</td>
                    <td>${log.parts}</td>
                    <td style="color: ${confidenceColor}; font-weight: 600;">${log.confidence}%</td>
                    <td><button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">View Teardown</button></td>
                </tr>
            `;
        }).join('');
    },

    init() {
        this.render();
        if (window.lucide) lucide.createIcons();
    }
};

// --- Admin OTP Management ---
const AdminOTPManager = {
    getLogs() {
        let logs = JSON.parse(localStorage.getItem('raiders_otp_logs'));
        // Generate mock data if empty for demo purposes
        if (!logs || logs.length === 0) {
            logs = [
                { id: 'LOG-' + Math.floor(Math.random()*9000), time: new Date().toLocaleString(), user: 'John Doe', target: 'MH-12-AB-1234', code: '8821', status: 'Success', ip: '192.168.1.104' },
                { id: 'LOG-' + Math.floor(Math.random()*9000), time: new Date(Date.now() - 1000*60*5).toLocaleString(), user: 'Sarah Connor', target: 'KA-01-XY-9999', code: '1102', status: 'Success', ip: '172.16.0.23' },
                { id: 'LOG-' + Math.floor(Math.random()*9000), time: new Date(Date.now() - 1000*60*25).toLocaleString(), user: 'Unknown Device', target: 'TN-07-ZZ-0000', code: '0000', status: 'Failed', ip: '45.22.19.112' },
                { id: 'LOG-' + Math.floor(Math.random()*9000), time: new Date(Date.now() - 1000*60*60).toLocaleString(), user: 'Mike Ross', target: 'MH-14-GH-7721', code: '9921', status: 'Pending', ip: '10.0.0.55' }
            ];
            localStorage.setItem('raiders_otp_logs', JSON.stringify(logs));
        }
        return logs;
    },

    refresh() {
        // Simulate adding a new log on refresh
        const logs = this.getLogs();
        const newLog = { 
            id: 'LOG-' + Math.floor(Math.random()*9000), 
            time: new Date().toLocaleString(), 
            user: 'System Admin', 
            target: 'INTERNAL-AUDIT', 
            code: Math.floor(1000 + Math.random() * 9000), 
            status: 'Success', 
            ip: '127.0.0.1' 
        };
        logs.unshift(newLog);
        if(logs.length > 20) logs.pop(); // Keep list manageable
        localStorage.setItem('raiders_otp_logs', JSON.stringify(logs));
        this.render();
    },

    clearLogs() {
        if(confirm('Are you sure you want to flush all security logs?')) {
            localStorage.removeItem('raiders_otp_logs');
            this.render();
        }
    },

    render() {
        const container = document.getElementById('otpLogsBody');
        if (!container) return;
        
        const logs = this.getLogs();
        
        // Update Stats
        document.getElementById('statTotal').innerText = logs.length;
        document.getElementById('statSuccess').innerText = logs.filter(l => l.status === 'Success').length;
        document.getElementById('statFailed').innerText = logs.filter(l => l.status === 'Failed').length;

        container.innerHTML = logs.map(log => {
            let badgeClass = log.status === 'Success' ? 'badge-success' : (log.status === 'Failed' ? 'badge-danger' : 'badge-pending');
            let icon = log.status === 'Success' ? 'check-circle' : (log.status === 'Failed' ? 'x-circle' : 'clock');
            
            return `
            <tr class="log-row">
                <td>
                    <div class="log-metadata"><i data-lucide="calendar" style="width:14px;"></i> ${log.time}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">ID: ${log.id}</div>
                </td>
                <td>
                    <div style="font-weight:600;">${log.user}</div>
                    <div class="log-metadata">Web Client</div>
                </td>
                <td><span class="security-badge">${log.target}</span></td>
                <td><span class="font-mono" style="letter-spacing:2px; font-weight:bold;">${log.code}</span></td>
                <td><span class="badge ${badgeClass}" style="display:inline-flex; align-items:center; gap:0.4rem;"><i data-lucide="${icon}" style="width:12px;"></i> ${log.status}</span></td>
                <td class="font-mono" style="color:var(--text-secondary);">${log.ip}</td>
            </tr>
            `;
        }).join('');
        
        if(window.lucide) lucide.createIcons();
    },

    init() {
        this.render();
    }
};

// --- Admin CRM Management ---
const AdminCRMManager = {
    allUsers: [],

    // Aggregates users from Orders and Crew list
    getUsers() {
        const orders = JSON.parse(localStorage.getItem('raiders_orders')) || [];
        const crew = JSON.parse(localStorage.getItem('raiders_crew')) || [];
        const usersMap = new Map();

        // Process Orders to create/update profiles
        orders.forEach(order => {
            // Use phone as unique key if available, else name
            const key = order.phone || order.customer;
            
            if (!usersMap.has(key)) {
                usersMap.set(key, {
                    name: order.customer,
                    phone: order.phone,
                    address: order.address,
                    orders: [],
                    totalSpent: 0,
                    type: 'Customer',
                    joined: new Date(order.date).toLocaleDateString()
                });
            }
            
            const user = usersMap.get(key);
            user.orders.push(order);
            user.totalSpent += parseFloat(order.total);
        });

        // Process Crew to create/update profiles
        crew.forEach(member => {
            // Try to find existing by name
            let existingUser = null;
            for (let u of usersMap.values()) {
                if (u.name === member.name) existingUser = u;
            }

            if (existingUser) {
                existingUser.type = 'Crew Member';
                existingUser.email = member.email;
            } else {
                usersMap.set(member.email, {
                    name: member.name,
                    email: member.email,
                    phone: 'N/A',
                    address: 'N/A',
                    orders: [],
                    totalSpent: 0,
                    type: 'Crew Member',
                    joined: member.joinedDate
                });
            }
        });

        this.allUsers = Array.from(usersMap.values());
        return this.allUsers;
    },

    renderList(users) {
        const container = document.getElementById('crmList');
        if (!container) return;
        
        if (users.length === 0) {
            container.innerHTML = '<p class="text-secondary" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No users found matching your search criteria.</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="panel user-card">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
                    <div style="display:flex; gap:1rem; align-items:center;">
                        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h3 style="margin:0; font-size:1.1rem;">${user.name}</h3>
                            <p class="text-secondary" style="font-size:0.85rem; margin:0;">${user.phone}</p>
                        </div>
                    </div>
                    <span class="tag ${user.type === 'Crew Member' ? 'tag-crew' : 'tag-customer'}">${user.type}</span>
                </div>
                <div style="margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid var(--border-glass);">
                    <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.3rem;">
                        <span class="text-secondary">Lifetime Value:</span>
                        <span class="text-accent" style="font-weight:bold;">₹${user.totalSpent.toFixed(2)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                        <span class="text-secondary">Orders Placed:</span>
                        <span>${user.orders.length}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-top:0.3rem;">
                        <span class="text-secondary">First Seen:</span>
                        <span>${user.joined}</span>
                    </div>
                </div>
                <div>
                    <h4 style="font-size:0.9rem; margin-bottom:0.5rem; color:var(--text-secondary);">Recent Activity</h4>
                    ${user.orders.slice(0, 3).map(o => `
                        <div class="order-history-item">
                            <span>${o.id}</span>
                            <span>₹${o.total}</span>
                        </div>
                    `).join('') || '<p style="font-size:0.85rem; color:var(--text-secondary); font-style:italic;">No orders recorded.</p>'}
                </div>
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();
    },

    init() {
        const users = this.getUsers();

        // Update Stats
        document.getElementById('totalUsers').textContent = users.length;
        const totalRev = users.reduce((sum, u) => sum + u.totalSpent, 0);
        document.getElementById('totalRevenue').textContent = '₹' + totalRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        const topUser = users.sort((a,b) => b.totalSpent - a.totalSpent)[0];
        if (topUser) document.getElementById('topCustomer').textContent = topUser.name;

        this.renderList(users);

        // Search Functionality
        const searchInput = document.getElementById('crmSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = this.allUsers.filter(u => 
                    u.name.toLowerCase().includes(term) || 
                    (u.phone && u.phone.includes(term))
                );
                this.renderList(filtered);
            });
        }
    }
};

// --- Chat System Logic ---
const ChatManager = {
    storageKey: 'raiders_group_chat',
    refreshUI: null,

    getChats() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [
            { name: "Owner (Raiders HQ)", email: "admin", text: "Welcome to the Crew Hub! Share your ride photos or ask about new parts here.", type: "text", time: "System" }
        ];
    },

    saveChats(chats) {
        localStorage.setItem(this.storageKey, JSON.stringify(chats));
        this.updateHomeFeed();
        if (this.refreshUI) this.refreshUI();
    },

    addMessage(user, text, type = 'text') {
        const chats = this.getChats();
        chats.push({
            name: user.name,
            email: user.email,
            text: text,
            type: type,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        this.saveChats(chats);
    },

    deleteMessage(index) {
        const chats = this.getChats();
        chats.splice(index, 1);
        this.saveChats(chats);
    },

    initGroupChat(currentUser) {
        const input = document.getElementById('userMsgInput');
        const sendBtn = document.getElementById('userSendBtn');
        const area = document.getElementById('messagesArea');
        const isAdmin = currentUser.email === 'admin' || currentUser.name.toLowerCase().includes('admin');

        const render = () => {
            const chats = this.getChats();
            area.innerHTML = chats.map((m, i) => {
                const isMe = m.email === currentUser.email;
                let content = '';
                
                if (m.type === 'text') content = m.text;
                else if (m.type === 'image') content = `<img src="${m.text}" class="message-media">`;
                else if (m.type === 'video') content = `<video controls class="message-media"><source src="${m.text}"></video>`;
                else if (m.type === 'sticker') content = `<img src="${m.text}" class="message-sticker">`;
                else if (m.type === 'voice') content = `<div class="voice-msg"><i data-lucide="play-circle"></i><div class="voice-wave"></div><span>0:08</span></div>`;

                return `
                    <div class="message ${isMe ? 'sent' : 'received'}">
                        ${(isAdmin || isMe) ? `<button class="moderation-btn" onclick="ChatManager.deleteMessage(${i})" title="Delete Message"><i data-lucide="trash"></i></button>` : ''}
                        <span class="sender-name">${isMe ? 'You' : m.name}</span>
                        ${content}
                        <span class="message-time">${m.time}</span>
                    </div>
                `;
            }).join('');
            if(window.lucide) lucide.createIcons();
            area.scrollTop = area.scrollHeight;
        };

        this.refreshUI = render;

        sendBtn.onclick = () => {
            if(input.value.trim()) {
                this.addMessage(currentUser, input.value.trim());
                input.value = '';
                render();
            }
        };

        input.onkeypress = (e) => { if(e.key === 'Enter') sendBtn.click(); };

        this.handleMedia = (inputEl) => {
            const file = inputEl.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const type = file.type.startsWith('video') ? 'video' : 'image';
                this.addMessage(currentUser, e.target.result, type);
                render();
            };
            reader.readAsDataURL(file);
        };

        this.sendSticker = () => {
            const stickers = [
                'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', 
                'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                'https://ih1.redbubble.net/image.1118126135.1261/st,small,507x507-pad,600x600,f8f8f8.u2.jpg', // Smooth Operator
                'https://ih1.redbubble.net/image.3846660144.3718/st,small,507x507-pad,600x600,f8f8f8.jpg', // Born to Ride
                'https://ih1.redbubble.net/image.5218731383.6452/st,small,507x507-pad,600x600,f8f8f8.jpg', // Night Rider
                'https://ih1.redbubble.net/image.2393220461.5034/st,small,507x507-pad,600x600,f8f8f8.jpg', // Ghost Rider
                'https://ih1.redbubble.net/image.5113945654.47273/st,small,507x507-pad,600x600,f8f8f8.jpg', // Hey Boo
                'https://ih1.redbubble.net/image.496928362.8362/st,small,507x507-pad,600x600,f8f8f8.jpg', // Cartoon Dog
                'https://ih1.redbubble.net/image.1041838641.5369/st,small,507x507-pad,600x600,f8f8f8.jpg'  // Solo Rider
            ];
            this.addMessage(currentUser, stickers[Math.floor(Math.random()*stickers.length)], 'sticker');
            render();
        };

        this.sendVoice = () => {
            this.addMessage(currentUser, 'voice_blob', 'voice');
            render();
        };

        render();
        setInterval(render, 5000);
    },

    updateHomeFeed() {
        const feed = document.getElementById('homeChatFeed');
        if (!feed) return;
        const chats = this.getChats().slice(-3).reverse();
        feed.innerHTML = chats.map(m => `
            <div class="home-chat-preview">
                <div class="avatar">${m.name.charAt(0)}</div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:700; font-size:0.9rem;">${m.name}</span>
                        <span style="font-size:0.75rem; color:var(--text-secondary);">${m.time}</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">${m.type === 'text' ? m.text : 'Sent a ' + m.type}</p>
                </div>
            </div>
        `).join('');
    }
};

// --- Admin Login ---
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'admin' && password === 'admin') {
                alert('Admin login successful!');
                window.location.href = 'admin.html';
            } else {
                alert('Invalid username or password.');
            }
        });
    }
});

// --- Raiders Button ---
// Initialize Home Chat Feed
document.addEventListener('DOMContentLoaded', () => {
    ChatManager.updateHomeFeed();
    
    // Show chat link if member
    const user = ProfileManager.getUser();
    if (user && user.joined) {
        const chatLink = document.getElementById('navChatLink');
        if (chatLink) chatLink.style.display = 'inline';
    }
});

// --- Bike Customizer System ---
const BikeCustomizer = {
    currentBasePrice: 0,
    addedPrice: 0,
    currentBike: null,

    init() {
        this.injectModal();
    },

    injectModal() {
        const modal = document.createElement('div');
        modal.className = 'modal customizer-modal';
        modal.id = 'bikeCustomizerModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="customizer-preview">
                    <button class="modal-close" onclick="BikeCustomizer.close()" style="position:absolute; top:1rem; right:1rem;">&times;</button>
                    <span class="badge" id="customizerModelName">Bike Model</span>
                    <img id="customizerMainImg" src="" alt="Bike Preview">
                    <div style="margin-top: 2rem; text-align: center;">
                        <p class="text-secondary">Estimated Total</p>
                        <h2 class="text-accent" id="customizerTotalPrice">₹0</h2>
                    </div>
                </div>
                <div class="customizer-controls">
                    <div class="part-category-group">
                        <h4>Select Exhaust System</h4>
                        <div class="parts-options-grid">
                            <div class="part-option active" onclick="BikeCustomizer.updatePart('Exhaust', 0, 'Stock')">
                                <span>Stock</span>
                            </div>
                            <div class="part-option" onclick="BikeCustomizer.updatePart('Exhaust', 1250, 'Akrapovič')">
                                <span>Akrapovič (+₹1250)</span>
                            </div>
                            <div class="part-option" onclick="BikeCustomizer.updatePart('Exhaust', 950, 'Austin Racing')">
                                <span>Austin GP (+₹950)</span>
                            </div>
                        </div>
                    </div>
                    <div class="part-category-group">
                        <h4>Wheels & Tires</h4>
                        <div class="parts-options-grid">
                            <div class="part-option active" onclick="BikeCustomizer.updatePart('Wheels', 0, 'Standard')">
                                <span>Standard</span>
                            </div>
                            <div class="part-option" onclick="BikeCustomizer.updatePart('Wheels', 2200, 'Forged Alloys')">
                                <span>Forged (+₹2200)</span>
                            </div>
                        </div>
                    </div>
                    <div class="part-category-group">
                        <h4>Comfort (Seat)</h4>
                        <div class="parts-options-grid">
                            <div class="part-option active" onclick="BikeCustomizer.updatePart('Seat', 0, 'Standard')">
                                <span>Standard</span>
                            </div>
                            <div class="part-option" onclick="BikeCustomizer.updatePart('Seat', 450, 'Gel Comfort')">
                                <span>Gel (+₹450)</span>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: auto; display: flex; gap: 1rem;">
                        <button class="btn btn-primary full-width" onclick="BikeCustomizer.addToCart()">Add Custom Build to Cart</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    open(title, price, image) {
        this.currentBike = { title, price: parseFloat(price), image };
        this.currentBasePrice = parseFloat(price);
        this.addedPrice = 0;
        
        document.getElementById('customizerModelName').textContent = title;
        document.getElementById('customizerMainImg').src = image;
        this.updateUI();
        
        document.getElementById('bikeCustomizerModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    close() {
        document.getElementById('bikeCustomizerModal').classList.remove('show');
        document.body.style.overflow = '';
    },

    updatePart(category, price, name) {
        // In a real app, we'd swap the image source based on selection
        // For this demo, we update the price
        this.addedPrice = price; // Simple logic: last selected part adds to price
        this.updateUI();
        
        // Update UI highlights
        const options = event.currentTarget.parentElement.querySelectorAll('.part-option');
        options.forEach(opt => opt.classList.remove('active'));
        event.currentTarget.classList.add('active');
    },

    updateUI() {
        const total = this.currentBasePrice + this.addedPrice;
        document.getElementById('customizerTotalPrice').textContent = '₹' + total.toLocaleString();
    },

    addToCart() {
        const total = this.currentBasePrice + this.addedPrice;
        const customItem = {
            title: `Custom ${this.currentBike.title}`,
            price: total,
            image: this.currentBike.image,
            category: 'Custom Build'
        };
        CartManager.addToCart(customItem);
        this.close();
        window.location.href = 'cart.html';
    }
};

// Initialize Customizer
document.addEventListener('DOMContentLoaded', () => {
    BikeCustomizer.init();
});

// Update existing ProfileManager.saveUser to refresh navigation
const originalSaveUser = ProfileManager.saveUser;
ProfileManager.saveUser = function(userData) {
    originalSaveUser.call(this, userData);
    const chatLink = document.getElementById('navChatLink');
    if (chatLink) {
        chatLink.style.display = (userData && userData.joined) ? 'inline' : 'none';
    }
};

// --- Modification Request System ---

// --- Notification Management System ---
const NotificationManager = {
    storageKey: 'raiders_user_notifications',

    // Retrieves all notifications for all users
    getAllNotifications() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch (e) {
            console.error("Error parsing notifications from localStorage:", e);
            return {};
        }
    },

    // Saves all notifications
    saveAllNotifications(notifications) {
        localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    },

    addNotification(userEmail, message) {
        const notifications = this.getAllNotifications();
        if (!notifications[userEmail]) notifications[userEmail] = [];
        notifications[userEmail].push({
            id: Date.now(),
            message: message,
            read: false,
            time: new Date().toLocaleString()
        });
        this.saveAllNotifications(notifications);
        ProfileManager.updateUI();
    },

    getUnreadCount(userEmail) {
        const notifications = this.getAllNotifications();
        const userNotes = notifications[userEmail] || [];
        return userNotes.filter(n => !n.read).length;
    },

    clearNotifications(userEmail) {
        const notifications = this.getAllNotifications();
        if (notifications[userEmail]) {
            notifications[userEmail].forEach(n => n.read = true);
            this.saveAllNotifications(notifications);
        }
        ProfileManager.updateUI();
    }
};

const ModifyManager = {
    storageKey: 'raiders_modify_requests',

    submitRequest(e) {
        e.preventDefault();
        const user = ProfileManager.getUser();
        if (!user) {
            alert('Please login to submit a modification request.');
            return;
        }

        const model = document.getElementById('modifyBikeModel').value;
        const description = document.getElementById('modifyDescription').value; // This handles questions/notes
        const photoInput = document.getElementById('modifyBikePhoto');
        const parts = Array.from(document.querySelectorAll('.modify-checklist input:checked')).map(cb => cb.value);

        if (parts.length === 0) {
            alert('Please select at least one part to modify.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const requests = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            const newRequest = {
                id: 'MOD-' + Date.now(),
                customer: user.name,
                email: user.email,
                model: model,
                description: description,
                parts: parts,
                image: event.target.result,
                status: 'Pending',
                date: new Date().toLocaleString()
            };
            requests.unshift(newRequest);
            localStorage.setItem(this.storageKey, JSON.stringify(requests));
            NotificationManager.addNotification(user.email, `Modification request for ${model} has been submitted.`);
            
            alert('Modification request submitted to Owner! You will be notified once accepted.');
            document.getElementById('modifyModal').classList.remove('show');
            e.target.reset();
        };
        reader.readAsDataURL(photoInput.files[0]);
    },

    renderAdminRequests() {
        const container = document.getElementById('adminModifyList');
        if (!container) return;
        const requests = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="text-secondary" style="text-align:center;">No modification requests found.</p>';
            return;
        }

        container.innerHTML = requests.map(req => `
            <div class="panel" style="margin-bottom: 1rem; border-left: 4px solid ${req.status === 'Accepted' ? 'var(--success)' : (req.status === 'Rejected' ? '#ef4444' : 'var(--accent-color)')}; background: rgba(255,255,255,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap: wrap; gap: 1rem;">
                    <div style="display:flex; gap:1.5rem; flex: 1;">
                        <img src="${req.image}" style="width:120px; height:120px; object-fit:cover; border-radius:0.5rem; border: 1px solid var(--border-glass);">
                        <div>
                            <h4 style="margin:0; font-size: 1.2rem;">${req.model} <span class="badge" style="font-size:0.7rem; padding:0.1rem 0.5rem;">${req.status}</span></h4>
                            <p class="text-secondary" style="font-size:0.85rem; margin: 0.2rem 0;">Customer: <strong>${req.customer}</strong> (${req.email})</p>
                            <p class="text-secondary" style="font-size:0.85rem;">Date: ${req.date}</p>
                            <div style="margin-top: 0.8rem; background: rgba(0,0,0,0.2); padding: 0.8rem; border-radius: 0.4rem;">
                                <p style="font-size:0.9rem; margin-bottom: 0.4rem;"><strong>Requested Parts:</strong> ${req.parts.join(', ')}</p>
                                <p style="font-size:0.9rem; margin: 0;"><strong>Customer Questions/Notes:</strong> "${req.description || 'No notes provided.'}"</p>
                            </div>
                        </div>
                    </div>
                    ${req.status === 'Pending' ? `
                        <div style="display:flex; gap:0.5rem; align-items: center;">
                            <button class="btn btn-primary" onclick="ModifyManager.updateStatus('${req.id}', 'Accepted')"><i data-lucide="check" style="width:16px;"></i> Accept</button>
                            <button class="btn btn-outline" style="color:#ef4444; border-color:#ef4444;" onclick="ModifyManager.updateStatus('${req.id}', 'Rejected')"><i data-lucide="x" style="width:16px;"></i> Reject</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        if (window.lucide) lucide.createIcons();
    },

    updateStatus(id, status) {
        const requests = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        const index = requests.findIndex(r => r.id === id);
        if (index > -1) {
            requests[index].status = status;
            localStorage.setItem(this.storageKey, JSON.stringify(requests));
            this.renderAdminRequests();
            if (status === 'Accepted') {
                // Notify the user
                const request = requests[index];
                NotificationManager.addNotification(request.email, `Your modification request for ${request.model} was ACCEPTED!`);
                
                alert('Request Accepted! Customer is now invited to the WhatsApp Group.');
                window.open('https://chat.whatsapp.com/mock-raiders-modify-group', '_blank');
            }
        }
    }
};

// --- User Profile Request Display ---
ModifyManager.renderUserRequests = function() {
    const container = document.getElementById('userModifyRequests');
    if (!container) return;
    const user = ProfileManager.getUser();
    if (!user) return;

    // Clear notifications when user views their requests
    NotificationManager.clearNotifications(user.email);

    const requests = (JSON.parse(localStorage.getItem(this.storageKey)) || []).filter(r => r.email === user.email);
    
    if (requests.length === 0) {
        container.innerHTML = '<p class="text-secondary" style="padding: 1rem; text-align: center; border: 1px dashed var(--border-glass); border-radius: 0.5rem;">No active modification requests.</p>';
        return;
    }

    container.innerHTML = requests.map(req => `
        <div class="info-item" style="flex-direction: column; align-items: flex-start; gap: 1rem;">
            <div style="display:flex; justify-content:space-between; width: 100%; align-items: center;">
                <div style="display:flex; gap: 1rem; align-items: center;">
                    <img src="${req.image}" style="width:50px; height:50px; border-radius: 0.4rem; object-fit: cover; border: 1px solid var(--border-glass);">
                    <div>
                        <h4 style="margin:0;">${req.model}</h4>
                        <span class="badge" style="font-size: 0.7rem; padding: 0.1rem 0.5rem;">${req.status}</span>
                    </div>
                </div>
                ${req.status === 'Accepted' ? `
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="window.open('https://chat.whatsapp.com/mock-raiders-modify-group', '_blank')">Join WhatsApp Group</button>
                ` : ''}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                <strong>Target Parts:</strong> ${req.parts.join(', ')}
            </div>
        </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
};

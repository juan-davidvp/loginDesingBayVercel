document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    let userLoggedIn = false;

    // Verificar si el usuario está logueado
    fetch('/api/session')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user) {
                userLoggedIn = true;
                const userSessionDiv = document.getElementById('user-session');
                userSessionDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem; color: white; font-family: sans-serif; font-size: 16px;">
                        <span style="font-weight: bold;">Hola, ${data.user.name}</span>
                        <form action="/auth/logout" method="POST" style="margin: 0;">
                            <button type="submit" style="background-color: #F5A42A; color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: bold;">
                                Salir
                            </button>
                        </form>
                    </div>
                `;
            }
        })
        .catch(err => console.error('Error fetching user session:', err));

    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    window.addToCart = function(artwork) {
        const cart = getCart();
        const existingProductIndex = cart.findIndex(item => item.id === artwork.id);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity++;
        } else {
            artwork.quantity = 1;
            // Asignar un precio aleatorio entre 50 y 500
            artwork.price = Math.floor(Math.random() * 451) + 50;
            cart.push(artwork);
        }
        saveCart(cart);
        alert(`${artwork.title} ha sido añadido al carrito.`);
        updateCartCount();
    };

    function displayCart() {
        const cart = getCart();
        if (cartContainer) {
            cartContainer.innerHTML = '';
            if (cart.length === 0) {
                cartContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
                return;
            }

            cart.forEach((item, index) => {
                const cartItem = `
                    <div class="cart-item">
                        <img src="${item.imageUrl}" alt="${item.title}">
                        <div class="cart-item-info">
                            <p class="cart-item-title">${item.title}</p>
                            <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                            <div class="cart-item-quantity">
                                <button onclick="updateQuantity(${index}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity(${index}, 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${index})">Eliminar</button>
                        </div>
                    </div>
                `;
                cartContainer.insertAdjacentHTML('beforeend', cartItem);
            });
            updateCartTotal();
        }
    }

    window.removeFromCart = function(index) {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        displayCart();
        updateCartCount();
    };

    window.updateQuantity = function(index, change) {
        let cart = getCart();
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            saveCart(cart);
            displayCart();
            updateCartCount();
        }
    };

    function updateCartTotal() {
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalElement) {
            cartTotalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
    
    function updateCartCount() {
        const cart = getCart();
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartIcon = document.querySelector('.carro a');
        if (cartIcon) {
            let countElement = cartIcon.querySelector('.cart-count');
            if (!countElement) {
                countElement = document.createElement('span');
                countElement.className = 'cart-count';
                cartIcon.appendChild(countElement);
            }
            if (cartCount > 0) {
                countElement.textContent = cartCount;
                countElement.style.display = 'flex';
            } else {
                countElement.style.display = 'none';
            }
        }
    }


    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (userLoggedIn) {
                const cart = getCart();
                if (cart.length > 0) {
                    alert('¡Compra realizada con éxito!');
                    localStorage.removeItem('cart');
                    displayCart();
                    updateCartCount();
                } else {
                    alert('Tu carrito está vacío.');
                }
            } else {
                window.location.href = '/login';
            }
        });
    }

    displayCart();
    updateCartCount();
});

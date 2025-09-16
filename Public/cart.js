//const Swal = require('sweetalert2')

document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    let userLoggedIn = false;
    let userId = null;

    // Verificar si el usuario está logueado
    fetch('/api/session')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user) {
                userLoggedIn = true;
                userId = data.user.id;
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


    // Obtener el carrito desde localStorage
    function getCart() {
        const raw = JSON.parse(localStorage.getItem('cart')) || [];
        return raw.map(i => {
            const priceRaw = i.price;
            // Quitar símbolos/no numéricos y convertir a número (acepta "$", comas, etc.)
            const priceNumber = typeof priceRaw === 'number'
                ? priceRaw
                : Number(String(priceRaw).replace(/[^0-9.-]+/g, '')) || 0;
            return {
                ...i,
                price: priceNumber,
                quantity: Number(i.quantity) || 1
            };
        });
    }

    // Guardar el carrito en localStorage
    function saveCart(cart) {
        const safe = cart.map(i => ({
            ...i,
            price: Number(i.price) || 0,
            quantity: Number(i.quantity) || 1
        }));
        localStorage.setItem('cart', JSON.stringify(safe));
    }

    // Mostrar el carrito en la página
    function displayCart() {
        const cart = getCart();
        if (cartContainer) {
            cartContainer.innerHTML = '';
            if (cart.length === 0) {
                cartContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
                checkoutButton.disabled = true; // Deshabilitar botón si el carrito está vacío
                return;
            }
            
            checkoutButton.disabled = false; // Habilitar si hay items

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

    // Añadir un producto al carrito
    window.addToCart = function(artwork) {
        const cart = getCart();
        const existingProductIndex = cart.findIndex(item => item.id === artwork.id);

        // Asegurar que artwork.price sea número
        artwork.price = Number(artwork.price) || artwork.price;
        if (!artwork.price) {
            artwork.price = Math.floor(Math.random() * 451) + 50; // fallback si no hay precio válido
        }
        artwork.quantity = Number(artwork.quantity) || 1;

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity++;
        } else {
            artwork.quantity = 1;
            cart.push(artwork);
        }
        saveCart(cart);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'success',
                title: `${artwork.title} ha sido añadido al carrito.`,
                showConfirmButton: false,
                timer: 2500
            });
        } else {
            alert(`${artwork.title} ha sido añadido al carrito.`);
        }
        updateCartCount();
    };

    // Eliminar un producto del carrito
    window.removeFromCart = function(index) {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        displayCart();
        updateCartCount();
    };

    // Actualizar la cantidad de un producto en el carrito
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
    
    // Actualizar el precio total del carrito
    function updateCartTotal() {
        const cart = getCart();
        const total = cart.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            return sum + (price * qty);
        }, 0);
        if (cartTotalElement) {
            cartTotalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
    
    // Actualizar el contador del carrito en el icono
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

    // Manejar el proceso de checkout
    if (checkoutButton) {
        checkoutButton.addEventListener('click', async () => {
            if (userLoggedIn) {
                const cart = getCart();
                if (cart.length > 0) {
                    
                    checkoutButton.disabled = true;
                    checkoutButton.textContent = 'Procesando...';

                    try {
                        const response = await fetch('/api/purchase', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ cart: cart }),
                        });

                        const result = await response.json();

                        if (response.ok && result.success) {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Excelente!',
                                text: 'Tu compra ha sido procesada con éxito.',
                                timer: 2000,
                                showConfirmButton: false,
                                toast: true
                            });
                            localStorage.removeItem('cart'); // Vaciar el carrito
                            displayCart();
                            updateCartCount();
                        } else {
                            // Mostrar mensaje de error del servidor (ej. "Debe iniciar sesión")
                            alert(`Error: ${result.message || 'No se pudo procesar la compra.'}`);
                        }
                    } catch (error) {
                        console.error('Error en el checkout:', error);
                        Swal.fire({
                        icon: "error",
                        title: "Error Servidor",
                        text: "Ocurrió un error al procesar tu compra. Por favor, intenta nuevamente más tarde.",
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#f5592aff"
                        });
                    } finally {
                        checkoutButton.disabled = false;
                        checkoutButton.textContent = 'Comprar';
                    }

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Carrito Vacío",
                        text: "Tu carrito está vacío. Añade productos antes de proceder al pago.",
                        confirmButtonText: "Entendido",
                        confirmButtonColor: "#F5A42A"
                        });
                }
            } else {
                // Si no está logueado, redirigir a la página de login
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: "error",
                        title: "Usuario no autenticado",
                        text: "Debes iniciar sesión para realizar una compra.",
                        confirmButtonText: "Login",
                        confirmButtonColor: "#F5A42A"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/login';
                        }
                    });
                } else {
                    window.location.href = '/login';
                }
            }
        });
    }

    displayCart();
    updateCartCount();
});

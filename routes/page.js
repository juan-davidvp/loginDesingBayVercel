const express = require('express');
const path = require('path');
const router = express.Router();
const purchaseController = require('../controllers/purchase');

// Middleware para proteger rutas
const protectRoute = (req, res, next) => {
    if (req.session.user) {
        next();                             // Si el usuario está autenticado, continúa
    } else {
        res.redirect('/login');             // Si no, redirige al login
    }
};

// Rutas de la paginas del E-commerce 
router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');  // Si ya está logueado desde la pagina principal, lo mandamos al dashboard
    }
    res.sendFile(path.join(process.cwd(), 'views', 'index.html'));
});

// Configuracion de la ruta del aviso legal
router.get('/avisoLegal', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'avisolegal.html'));
});

// Configuracion de la ruta del FAQ
router.get('/preguntas', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'preguntas.html'));
});

// Configuracion de la ruta del contacto
router.get('/contacto', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'contacto.html'));
});

// Configuracion de la ruta del quienes somos
router.get('/quienesSomos', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'quienessomos.html'));
});

// Configuracion de la ruta de los productos
router.get('/productos', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'products.html'));
});

// Configuracion de la ruta del carrito de compras
router.get('/cart', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'carrito.html'));
});

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');  // Si ya está logueado desde la pagina del login, lo mandamos al dashboard
    }
    res.sendFile(path.join(process.cwd(), 'views', 'login.html'));
});

// --- Protected dashboard route, serves the logged-in version of the main page ---
router.get('/dashboard', protectRoute, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'dashboard.html'));
});

// --- NEW API ROUTE ---
// Obtener datos del usuario mediante la API para el registro
router.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: { name: req.session.user.name, email: req.session.user.email } });
    } else {
        res.status(401).json({ success: false, message: 'No authenticated session found.' });
    }
});

module.exports = router;

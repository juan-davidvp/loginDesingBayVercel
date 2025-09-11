const express = require('express');
const path = require('path');
const router = express.Router();

// Middleware para proteger rutas
const protectRoute = (req, res, next) => {
    if (req.session.user) {
        next(); // Si hay sesión de usuario, continúa
    } else {
        res.redirect('/login'); // Si no, redirige al login
    }
};

// Ruta principal, redirige a login o dashboard
router.get('/', (req, res) => {
    // Si ya está logueado, lo mandamos al dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(process.cwd(), 'views', 'index.html'));
});

router.get('/avisoLegal', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'avisolegal.html'));
});

router.get('/preguntas', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'preguntas.html'));
});

router.get('/contacto', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'contacto.html'));
});

router.get('/quienesSomos', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'quienessomos.html'));
});

router.get('/productos', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'products.html'));
});



// Ruta para servir el archivo de login
router.get('/login', (req, res) => {
    // Si ya está logueado, lo mandamos al dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(process.cwd(), 'views', 'login.html'));
});


// Protected dashboard route, serves the logged-in version of the main page
router.get('/dashboard', protectRoute, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views', 'dashboard.html'));
});

// --- NEW API ROUTE ---
// API route to get current user session data
router.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: { name: req.session.user.name, email: req.session.user.email } });
    } else {
        res.status(401).json({ success: false, message: 'No authenticated session found.' });
    }
});

module.exports = router;

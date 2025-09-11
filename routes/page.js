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


// Ruta para servir el archivo de login
router.get('/login', (req, res) => {
    // Si ya está logueado, lo mandamos al dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(process.cwd(), 'views', 'login.html'));
});

// Ruta protegida de ejemplo (dashboard)
router.get('/dashboard', protectRoute, (req, res) => {
    // Aquí podrías servir otra página HTML o enviar datos para una app de una sola página
    res.send(`
        <h1>Bienvenido, ${req.session.user.name}!</h1>
        <p>Este es tu panel de control.</p>
        <form action="/auth/logout" method="POST">
            <button type="submit">Cerrar Sesión</button>
        </form>
    `);
});

module.exports = router;

const User = require('../models/user'); // Importar el modelo de Mongoose
const bcrypt = require('bcryptjs');

// --- REGISTRO DE USUARIO ---
exports.register = async (req, res) => {
    const { name, email, password, passwordResend } = req.body;

    if (!name || !email || !password || !passwordResend) {
        return res.status(400).json({ success: false, message: 'Por favor, complete todos los campos.' });
    }
    if (password !== passwordResend) {
        return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden.' });
    }

    try {
        // Mongoose se encarga de encriptar la contraseña gracias al middleware pre-save
        const newUser = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({ success: true, message: `Usuario ${name} registrado exitosamente!` });

    } catch (error) {
        console.error("Error en la función de registro:", error);
        // Manejar error de email duplicado (código 11000)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'El email ya se encuentra registrado.' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};


// --- INICIO DE SESIÓN ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Por favor ingrese su email y contraseña.' });
    }

    try {
        // 1. Buscar el usuario y explícitamente pedir la contraseña (que por defecto no se incluye)
        const user = await User.findOne({ email: email }).select('+password');

        // 2. Verificar si el usuario existe y si la contraseña es correcta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Email o Contraseña incorrecta.' });
        }

        // 3. Si todo es correcto, crear la sesión del usuario
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        req.session.save(err => {
            if (err) {
                console.error("Error saving session:", err);
                return res.status(500).json({ success: false, message: 'Error al guardar la sesión.' });
            }
            res.status(200).json({ success: true, redirectUrl: '/dashboard' });
        });

    } catch (error) {
        console.log("Error en la función de login:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};


// --- CERRAR SESIÓN ---
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session: ", err);
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};


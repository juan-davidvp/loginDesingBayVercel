const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, ingrese un nombre.']
    },
    email: {
        type: String,
        required: [true, 'Por favor, ingrese un email.'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Por favor, ingrese una contraseña.'],
        minlength: 6, // Se recomienda un mínimo de caracteres
        select: false // Evita que la contraseña se envíe en las consultas por defecto
    },
    // Campo añadido para guardar referencia a las compras del usuario
    purchases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase'
    }]
});

// Middleware (hook) para encriptar la contraseña ANTES de guardarla
userSchema.pre('save', async function(next) {
    // Solo encriptar si la contraseña ha sido modificada (o es nueva)
    if (!this.isModified('password')) return next();

    // Hashear la contraseña con un "cost factor" de 12
    this.password = await bcrypt.hash(this.password, 12);

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

//Importaciones
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo'); // 1. Importar connect-mongo

// Configuración de variables de entorno
dotenv.config({ path: './.env' });

//Conexion a la base de datos con moongose
const mongoConnection = mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connection successful!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

//Inicializacion de express
const app = express();

// Configuración de directorio público
const publicDirectory = path.join(__dirname, './Public');
app.use(express.static(publicDirectory));

// Middlewares para parsear el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Configuración AVANZADA de express-session con MongoStore
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions', // Nombre de la colección para las sesiones
        ttl: 14 * 24 * 60 * 60 // = 14 días.
    }),
    cookie: {
        maxAge: 60 * 60 * 1000, // 1 hora
        secure: process.env.NODE_ENV === 'production', // Usar cookies seguras en producción
        httpOnly: true,
    }
}));

// Definición de Rutas
app.use('/', require('./routes/page.js'));
app.use('/auth', require('./routes/auth.js'));
app.use('/api/purchase', require('./routes/purchase.js'));

// 3. Eliminar app.listen y exportar la app
// El servidor solo se iniciará localmente. En Vercel, esto no se ejecutará.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server on port ${PORT}`);
    });
}

// ¡Esta línea es crucial para Vercel!
module.exports = app; 
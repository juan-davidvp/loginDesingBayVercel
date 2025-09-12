const Purchase = require('../models/purchase');
const User = require('../models/user');

// Se define la función del controlador
const createPurchase = async (req, res) => {
    // Verificar si el usuario está logueado a través de la sesión
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Debe iniciar sesión para realizar una compra.' });
    }

    const { cart } = req.body;

    // Validar que el carrito no esté vacío
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ success: false, message: 'El carrito está vacío o no es válido.' });
    }

    try {
        const userId = req.session.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        // Calcular el monto total desde el backend para seguridad
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Mapear los items del carrito al formato del modelo de compra
        const purchaseItems = cart.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            artworkApiId: item.id,
            dimensions: item.dimensions,
            origin: item.origin,
            imageUrl: item.imageUrl
        }));

        // Crear el nuevo documento de compra
        const newPurchase = new Purchase({
            user: userId,
            items: purchaseItems,
            totalAmount: totalAmount
        });

        // Guardar la compra en la base de datos
        await newPurchase.save();

        // Añadir la referencia de la nueva compra al array de compras del usuario
        user.purchases.push(newPurchase._id);
        await user.save();

        // Enviar respuesta de éxito
        res.status(201).json({ success: true, message: 'Compra realizada con éxito.', purchaseId: newPurchase._id });

    } catch (error) {
        console.error('Error al procesar la compra:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al procesar la compra.' });
    }
};

// Se exporta un objeto que contiene la función del controlador.
// Esta es la forma más robusta de exportar.
module.exports = {
    createPurchase
};


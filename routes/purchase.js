const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase');

// Esta ruta manejará las peticiones POST a /api/purchase/
router.post('/', purchaseController.createPurchase);

module.exports = router;

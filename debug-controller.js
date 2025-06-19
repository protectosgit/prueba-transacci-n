#!/usr/bin/env node

const express = require('express');
const cors = require('cors');

// Script para interceptar exactamente qué datos llegan al controlador

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para logear todo lo que llega
app.use('/debug', (req, res, next) => {
    console.log('\n🔍 === DEBUG MIDDLEWARE ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    
    // Análisis específico del body
    if (req.body) {
        console.log('\n📊 ANÁLISIS DEL BODY:');
        console.log('- reference:', req.body.reference, '(tipo:', typeof req.body.reference, ')');
        console.log('- amount:', req.body.amount, '(tipo:', typeof req.body.amount, ')');
        console.log('- cartItems:', req.body.cartItems ? `${req.body.cartItems.length} items` : 'undefined');
        console.log('- customer:', req.body.customer ? 'presente' : 'undefined');
        console.log('- delivery:', req.body.delivery ? 'presente' : 'undefined');
        
        if (req.body.cartItems && req.body.cartItems.length > 0) {
            console.log('\n🛒 CART ITEMS:');
            req.body.cartItems.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.product?.name} x${item.quantity} = $${item.product?.price * item.quantity}`);
            });
        }
    }
    console.log('=== FIN DEBUG ===\n');
    
    next();
});

// Endpoint de debug
app.post('/debug/create-transaction', (req, res) => {
    console.log('🎯 === PROCESANDO TRANSACCIÓN ===');
    
    const { reference, amount, customer, delivery, cartItems, paymentMethod } = req.body;
    
    console.log('📥 DATOS EXTRAÍDOS:');
    console.log('- reference:', reference);
    console.log('- amount:', amount, '(tipo:', typeof amount, ')');
    console.log('- cartItems:', cartItems ? cartItems.length : 'undefined');
    console.log('- customer:', customer ? customer.email : 'undefined');
    
    // Simular el cálculo que hace el controlador
    let calculatedAmount = amount;
    if (!calculatedAmount && cartItems && cartItems.length > 0) {
        calculatedAmount = cartItems.reduce((total, item) => {
            const itemPrice = parseFloat(item.product?.price || 0);
            const quantity = parseInt(item.quantity || 1);
            return total + (itemPrice * quantity);
        }, 0);
        console.log('💰 Amount calculado desde cartItems:', calculatedAmount);
    }
    
    if (!calculatedAmount) {
        calculatedAmount = 0;
        console.log('💰 Amount por defecto:', calculatedAmount);
    }
    
    const transactionData = {
        reference,
        amount: calculatedAmount,
        customerData: customer || { email: 'no-email@example.com' },
        deliveryData: delivery || null,
        cartItems: cartItems || [],
        paymentMethod: paymentMethod || 'CARD'
    };
    
    console.log('📤 DATOS FINALES PARA USE CASE:');
    console.log(JSON.stringify(transactionData, null, 2));
    
    res.json({
        success: true,
        debug: {
            receivedAmount: amount,
            calculatedAmount: calculatedAmount,
            cartItemsCount: cartItems ? cartItems.length : 0,
            transactionData: transactionData
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🔍 Servidor debug corriendo en puerto ${PORT}`);
    console.log('📡 Envía tus datos a: http://localhost:3001/debug/create-transaction');
    console.log('🎯 Para probar, ejecuta: node debug-frontend-call.js\n');
});

module.exports = app; 
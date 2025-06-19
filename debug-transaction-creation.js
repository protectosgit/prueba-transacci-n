#!/usr/bin/env node

// Script para debuggear el problema de creación de transacciones

async function debugTransactionCreation() {
    const BASE_URL = 'https://back-pasarela.onrender.com';
    
    console.log('🔍 === DEBUG: CREACIÓN DE TRANSACCIONES ===\n');

    // Datos exactos que envía tu frontend
    const frontendData = {
        reference: "DEBUG_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
        amount: "10200000", // String como lo envía el frontend
        cartItems: [
            {
                product: {
                    id: 3,
                    name: "Nevera LG No Frost",
                    price: 1200000,
                    description: "Refrigerador LG 420 litros No Frost con dispensador de agua"
                },
                quantity: 1
            },
            {
                product: {
                    id: 5,
                    name: "iPhone 15 Pro",
                    price: 4500000,
                    description: "Apple iPhone 15 Pro 128GB con chip A17 Pro y camara de 48MP"
                },
                quantity: 2
            }
        ],
        customer: {
            firstName: "feliciano",
            lastName: "Mosuquera", 
            email: "felixx-21@hotmail.com",
            phone: "3145552585"
        },
        delivery: {
            address: "careera 34 ",
            city: "medellin ",
            department: "Antioquia",
            postalCode: "050001",
            recipientName: "felix",
            recipientPhone: "3145585965"
        },
        paymentMethod: "CARD"
    };

    console.log('📤 DATOS QUE ENVÍA EL FRONTEND:');
    console.log(`📋 Reference: ${frontendData.reference}`);
    console.log(`💰 Amount: ${frontendData.amount} (tipo: ${typeof frontendData.amount})`);
    console.log(`🛒 CartItems: ${frontendData.cartItems.length} productos`);
    
    // Calcular amount manualmente para verificar
    const calculatedAmount = frontendData.cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
    console.log(`🧮 Amount calculado: ${calculatedAmount}`);
    console.log(`👤 Customer: ${frontendData.customer.firstName} ${frontendData.customer.lastName}\n`);

    try {
        // Crear transacción
        console.log('📡 Enviando al backend...');
        const response = await fetch(`${BASE_URL}/api/payments/create-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(frontendData)
        });

        const result = await response.json();
        
        console.log('📥 RESPUESTA DEL BACKEND:');
        if (result.success) {
            const transaction = result.data;
            console.log(`✅ Status: ${response.status}`);
            console.log(`🆔 ID: ${transaction.id}`);
            console.log(`💰 Amount guardado: ${transaction.amount} (debería ser ${calculatedAmount})`);
            console.log(`🛒 CartItems guardados: ${transaction.cartItems ? transaction.cartItems.length : 0} (debería ser ${frontendData.cartItems.length})`);
            console.log(`📦 Total items: ${transaction.totalItems || 0}`);
            
            // Verificar datos específicos
            console.log('\n🔍 ANÁLISIS DETALLADO:');
            console.log(`Amount correcto: ${parseFloat(transaction.amount) === calculatedAmount ? '✅' : '❌'}`);
            console.log(`CartItems correcto: ${(transaction.cartItems && transaction.cartItems.length === frontendData.cartItems.length) ? '✅' : '❌'}`);
            console.log(`Customer correcto: ${transaction.customer && transaction.customer.email === frontendData.customer.email ? '✅' : '❌'}`);
            
            // Mostrar cartItems guardados
            if (transaction.cartItems && transaction.cartItems.length > 0) {
                console.log('\n📦 CART ITEMS GUARDADOS:');
                transaction.cartItems.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.product?.name} x${item.quantity} = $${item.product?.price * item.quantity}`);
                });
            } else {
                console.log('\n❌ NO SE GUARDARON CART ITEMS');
            }
            
        } else {
            console.log(`❌ Error: ${result.error}`);
        }

        // Verificar consultando la transacción
        console.log('\n🔍 VERIFICACIÓN POR CONSULTA:');
        const checkResponse = await fetch(`${BASE_URL}/api/payments/${frontendData.reference}`);
        const checkResult = await checkResponse.json();
        
        if (checkResult.success) {
            const checked = checkResult.data;
            console.log(`💰 Amount en DB: ${checked.amount}`);
            console.log(`🛒 CartItems en DB: ${checked.cartItems ? checked.cartItems.length : 0}`);
            console.log(`📦 Total items en DB: ${checked.totalItems || 0}`);
        } else {
            console.log(`❌ No se pudo consultar: ${checkResult.error}`);
        }

    } catch (error) {
        console.error('💥 ERROR:', error.message);
    }
}

if (require.main === module) {
    debugTransactionCreation();
}

module.exports = debugTransactionCreation; 
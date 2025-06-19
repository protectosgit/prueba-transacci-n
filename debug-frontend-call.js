#!/usr/bin/env node

async function debugFrontendCall() {
    // Datos EXACTOS que envía tu frontend (basado en lo que mostraste)
    const frontendData = {
        reference: "15113-1750366683-84480", // Tu referencia real
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

    console.log('🚀 === ENVIANDO DATOS EXACTOS DEL FRONTEND ===\n');
    console.log('📤 Payload a enviar:');
    console.log(JSON.stringify(frontendData, null, 2));

    try {
        // 1. Enviar al servidor debug local
        console.log('\n1️⃣ Enviando a servidor debug local...');
        const localResponse = await fetch('http://localhost:3001/debug/create-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(frontendData)
        });

        if (localResponse.ok) {
            const localResult = await localResponse.json();
            console.log('✅ Respuesta del debug local:');
            console.log(JSON.stringify(localResult, null, 2));
        } else {
            console.log('❌ Error en servidor debug local:', localResponse.status);
        }

        // 2. Enviar al backend real
        console.log('\n2️⃣ Enviando al backend real...');
        const realResponse = await fetch('https://back-pasarela.onrender.com/api/payments/create-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(frontendData)
        });

        const realResult = await realResponse.json();
        
        console.log('📥 Respuesta del backend real:');
        console.log('Status:', realResponse.status);
        console.log('Body:', JSON.stringify(realResult, null, 2));

        if (realResult.success) {
            const transaction = realResult.data;
            console.log('\n📊 ANÁLISIS COMPARATIVO:');
            console.log(`Amount enviado: ${frontendData.amount}`);
            console.log(`Amount guardado: ${transaction.amount}`);
            console.log(`CartItems enviados: ${frontendData.cartItems.length}`);
            console.log(`CartItems guardados: ${transaction.cartItems ? transaction.cartItems.length : 0}`);
            console.log(`¿Amount correcto?: ${parseFloat(transaction.amount) === 10200000 ? '✅' : '❌'}`);
            console.log(`¿CartItems correcto?: ${transaction.cartItems && transaction.cartItems.length === 2 ? '✅' : '❌'}`);
        }

    } catch (error) {
        console.error('💥 ERROR:', error.message);
    }
}

// Esperar un poco antes de ejecutar para que el servidor debug esté listo
setTimeout(debugFrontendCall, 1000);

module.exports = debugFrontendCall; 
#!/usr/bin/env node

async function testFinalFix() {
    const BASE_URL = 'https://back-pasarela.onrender.com';
    
    console.log('🎯 === PRUEBA FINAL CON ARREGLOS ===\n');

    // Datos con nueva referencia
    const testData = {
        reference: `FINAL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        amount: "10200000",
        cartItems: [
            {
                product: {
                    id: 3,
                    name: "Nevera LG No Frost",
                    price: 1200000,
                    description: "Refrigerador LG 420 litros"
                },
                quantity: 1
            },
            {
                product: {
                    id: 5,
                    name: "iPhone 15 Pro",
                    price: 4500000,
                    description: "Apple iPhone 15 Pro 128GB"
                },
                quantity: 2
            }
        ],
        customer: {
            firstName: "Felix",
            lastName: "Mosquera",
            email: "felix.final@ejemplo.com",
            phone: "3001234567"
        },
        delivery: {
            address: "Calle 123 #45-67",
            city: "Medellín",
            department: "Antioquia",
            postalCode: "05001",
            recipientName: "Felix Mosquera",
            recipientPhone: "3001234567"
        },
        paymentMethod: "CARD"
    };

    console.log('📋 DATOS DE PRUEBA:');
    console.log(`Referencia: ${testData.reference}`);
    console.log(`Amount: ${testData.amount}`);
    console.log(`CartItems: ${testData.cartItems.length} productos\n`);

    try {
        // Crear transacción directamente
        console.log('1️⃣ Creando transacción desde frontend...');
        const createResponse = await fetch(`${BASE_URL}/api/payments/create-transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const createResult = await createResponse.json();
        
        if (createResult.success) {
            const transaction = createResult.data;
            console.log('✅ TRANSACCIÓN CREADA:');
            console.log(`🆔 ID: ${transaction.id}`);
            console.log(`💰 Amount: $${transaction.amount} ${parseFloat(transaction.amount) === 10200000 ? '✅' : '❌'}`);
            console.log(`🛒 CartItems: ${transaction.cartItems ? transaction.cartItems.length : 0} ${transaction.cartItems && transaction.cartItems.length === 2 ? '✅' : '❌'}`);
            console.log(`📦 Total items: ${transaction.totalItems || 0} ${transaction.totalItems === 3 ? '✅' : '❌'}`);
            console.log(`👤 Customer: ${transaction.customer?.email === testData.customer.email ? '✅' : '❌'}`);
            
            if (transaction.cartItems && transaction.cartItems.length > 0) {
                console.log('\n📦 CART ITEMS GUARDADOS:');
                transaction.cartItems.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.product?.name} x${item.quantity} = $${(item.product?.price || 0) * item.quantity}`);
                });
            }

            // Generar URL de Wompi si todo está correcto
            if (parseFloat(transaction.amount) === 10200000 && transaction.cartItems && transaction.cartItems.length === 2) {
                console.log('\n🎉 ¡DATOS CORRECTOS! Generando URL de Wompi...');
                
                const integrityData = {
                    reference: testData.reference,
                    amount_in_cents: 10200000 * 100,
                    currency: 'COP'
                };

                const integrityResponse = await fetch(`${BASE_URL}/api/payments/integrity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(integrityData)
                });

                const integrityResult = await integrityResponse.json();
                
                const wompiUrl = new URL('https://checkout.co.uat.wompi.dev/p/');
                wompiUrl.searchParams.append('public-key', 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7');
                wompiUrl.searchParams.append('currency', 'COP');
                wompiUrl.searchParams.append('amount-in-cents', integrityData.amount_in_cents);
                wompiUrl.searchParams.append('reference', testData.reference);
                wompiUrl.searchParams.append('signature:integrity', integrityResult.integrity);
                wompiUrl.searchParams.append('customer-email', testData.customer.email);
                wompiUrl.searchParams.append('redirect-url', 'https://main.d10nqda7yg14nv.amplifyapp.com/payment-result');

                console.log('\n🔗 URL PARA PAGO REAL:');
                console.log(wompiUrl.toString());
                console.log('\n💳 DATOS DE TARJETA DE PRUEBA:');
                console.log('Número: 4242424242424242');
                console.log('CVV: 123');
                console.log('Fecha: 12/29');
                console.log('Nombre: FELIX MOSQUERA');
            }
        } else {
            console.log(`❌ Error: ${createResult.error}`);
        }

    } catch (error) {
        console.error('\n💥 ERROR:', error.message);
    }
}

if (require.main === module) {
    testFinalFix();
}

module.exports = testFinalFix; 
#!/usr/bin/env node

async function testRealPurchase() {
    const BASE_URL = 'https://back-pasarela.onrender.com';
    
    console.log('🛒 === SIMULANDO COMPRA REAL DESDE FRONTEND ===\n');

    try {
        // 1. Obtener productos
        console.log('1️⃣ Obteniendo productos...');
        const productsResponse = await fetch(`${BASE_URL}/api/products`);
        const productsData = await productsResponse.json();
        const product = productsData.data[0];
        console.log(`✅ Producto: ${product.name} - $${product.price}\n`);

        // 2. Simular datos del frontend (exactos)
        const purchaseData = {
            reference: `REAL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            amount: parseFloat(product.price), // Monto explícito
            customer: {
                firstName: 'Felix',
                lastName: 'Mosquera',
                email: 'felix.test@ejemplo.com',
                phone: '3001234567'
            },
            delivery: {
                address: 'Calle 123 #45-67',
                city: 'Medellín',
                department: 'Antioquia',
                postalCode: '05001',
                recipientName: 'Felix Mosquera',
                recipientPhone: '3001234567'
            },
            cartItems: [{
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description
                },
                quantity: 1
            }],
            paymentMethod: 'CARD'
        };

        console.log('2️⃣ Datos de compra preparados:');
        console.log(`📋 Referencia: ${purchaseData.reference}`);
        console.log(`💰 Amount: $${purchaseData.amount}`);
        console.log(`🛒 CartItems: ${purchaseData.cartItems.length} producto(s)`);
        console.log(`👤 Cliente: ${purchaseData.customer.firstName} ${purchaseData.customer.lastName}\n`);

        // 3. Crear transacción (como lo hace el frontend)
        console.log('3️⃣ Creando transacción...');
        const createResponse = await fetch(`${BASE_URL}/api/payments/create-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchaseData)
        });

        const createResult = await createResponse.json();
        
        if (!createResult.success) {
            throw new Error(`Error creando transacción: ${createResult.error}`);
        }

        console.log('✅ Transacción creada exitosamente:');
        console.log(`🆔 ID: ${createResult.data.id}`);
        console.log(`💰 Amount guardado: $${createResult.data.amount}`);
        console.log(`🛒 CartItems guardados: ${createResult.data.cartItems ? createResult.data.cartItems.length : 0}`);
        console.log(`📦 Total items: ${createResult.data.totalItems || 0}\n`);

        // 4. Verificar que se guardó correctamente
        console.log('4️⃣ Verificando transacción guardada...');
        const checkResponse = await fetch(`${BASE_URL}/api/payments/${purchaseData.reference}`);
        const checkResult = await checkResponse.json();

        if (checkResult.success) {
            const transaction = checkResult.data;
            console.log('📊 Verificación exitosa:');
            console.log(`💰 Amount: $${transaction.amount} ${transaction.amount > 0 ? '✅' : '❌'}`);
            console.log(`🛒 CartItems: ${transaction.cartItems ? transaction.cartItems.length : 0} ${transaction.cartItems && transaction.cartItems.length > 0 ? '✅' : '❌'}`);
            console.log(`📦 Total items: ${transaction.totalItems || 0} ${transaction.totalItems > 0 ? '✅' : '❌'}`);
            console.log(`📍 Delivery: ${transaction.delivery ? 'Sí' : 'No'} ${transaction.delivery ? '✅' : '⚠️'}`);
        }

        // 5. Generar URL de Wompi
        console.log('\n5️⃣ Generando URL de Wompi...');
        const integrityData = {
            reference: purchaseData.reference,
            amount_in_cents: Math.round(purchaseData.amount * 100),
            currency: 'COP'
        };

        const integrityResponse = await fetch(`${BASE_URL}/api/payments/integrity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(integrityData)
        });

        const integrityResult = await integrityResponse.json();
        
        const wompiUrl = new URL('https://checkout.co.uat.wompi.dev/p/');
        wompiUrl.searchParams.append('public-key', 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7');
        wompiUrl.searchParams.append('currency', 'COP');
        wompiUrl.searchParams.append('amount-in-cents', integrityData.amount_in_cents);
        wompiUrl.searchParams.append('reference', purchaseData.reference);
        wompiUrl.searchParams.append('signature:integrity', integrityResult.integrity);
        wompiUrl.searchParams.append('customer-email', purchaseData.customer.email);
        wompiUrl.searchParams.append('redirect-url', 'https://main.d10nqda7yg14nv.amplifyapp.com/payment-result');

        console.log('✅ URL de pago generada\n');

        // 6. Simular pago exitoso
        console.log('6️⃣ Simulando pago exitoso en Wompi...');
        const webhookData = {
            event: 'transaction.updated',
            data: {
                transaction: {
                    id: `wompi_${Date.now()}`,
                    reference: purchaseData.reference,
                    amount_in_cents: integrityData.amount_in_cents,
                    status: 'APPROVED',
                    status_message: 'Transacción aprobada',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            }
        };

        const webhookResponse = await fetch(`${BASE_URL}/api/payments/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });

        const webhookResult = await webhookResponse.json();
        console.log(`✅ Webhook procesado: ${webhookResult.success ? 'EXITOSO' : 'FALLÓ'}`);

        // 7. Verificar estado final
        console.log('\n7️⃣ Estado final de la transacción:');
        const finalResponse = await fetch(`${BASE_URL}/api/payments/${purchaseData.reference}`);
        const finalResult = await finalResponse.json();

        if (finalResult.success) {
            const final = finalResult.data;
            console.log(`📊 Estado: ${final.status}`);
            console.log(`💰 Amount: $${final.amount}`);
            console.log(`🛒 CartItems: ${final.cartItems ? final.cartItems.length : 0}`);
            console.log(`📦 Total items: ${final.totalItems || 0}`);
            console.log(`🎯 Wompi ID: ${final.wompiTransactionId || 'N/A'}`);
        }

        // 8. Verificar stock
        console.log('\n8️⃣ Verificando stock...');
        const stockResponse = await fetch(`${BASE_URL}/api/products`);
        const stockData = await stockResponse.json();
        const updatedProduct = stockData.data.find(p => p.id === product.id);
        const stockDiff = product.stock - updatedProduct.stock;
        
        console.log(`📦 Stock inicial: ${product.stock}`);
        console.log(`📦 Stock actual: ${updatedProduct.stock}`);
        console.log(`📉 Reducción: ${stockDiff} ${stockDiff > 0 ? '✅ CORRECTO' : '❌ NO SE REDUJO'}`);

        console.log('\n🎉 === PRUEBA COMPLETADA ===');
        console.log('\n🔗 Para probar manualmente:');
        console.log(wompiUrl.toString());
        console.log('\n💳 Datos de prueba:');
        console.log('Número: 4242424242424242');
        console.log('CVV: 123');
        console.log('Fecha: 12/29');

    } catch (error) {
        console.error('\n💥 ERROR:', error.message);
    }
}

if (require.main === module) {
    testRealPurchase();
}

module.exports = testRealPurchase; 
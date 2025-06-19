#!/usr/bin/env node

async function testFullSale() {
    const BASE_URL = 'https://back-pasarela.onrender.com';
    
    console.log('🛒 === PRUEBA DE VENTA COMPLETA ===\n');

    try {
        // 1. Verificar que el backend responda
        console.log('1️⃣ Verificando backend...');
        const healthResponse = await fetch(`${BASE_URL}/api/products`);
        if (!healthResponse.ok) {
            throw new Error('Backend no responde correctamente');
        }
        console.log('✅ Backend funcionando\n');

        // 2. Obtener productos disponibles
        console.log('2️⃣ Obteniendo productos...');
        const productsResponse = await fetch(`${BASE_URL}/api/products`);
        const productsData = await productsResponse.json();
        
        if (!productsData.success || !productsData.data || productsData.data.length === 0) {
            throw new Error('No hay productos disponibles');
        }
        
        const product = productsData.data[0];
        console.log(`✅ Producto encontrado: ${product.name} - $${product.price}`);
        console.log(`📦 Stock disponible: ${product.stock}\n`);

        // 3. Generar datos de prueba
        const testData = {
            reference: `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            amount: parseFloat(product.price),
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

        console.log('3️⃣ Datos de la transacción:');
        console.log(`📋 Referencia: ${testData.reference}`);
        console.log(`💰 Monto: $${testData.amount}`);
        console.log(`👤 Cliente: ${testData.customer.firstName} ${testData.customer.lastName}`);
        console.log(`📧 Email: ${testData.customer.email}\n`);

        // 4. Crear transacción
        console.log('4️⃣ Creando transacción...');
        const createResponse = await fetch(`${BASE_URL}/api/payments/create-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const createResult = await createResponse.json();
        
        if (!createResult.success) {
            throw new Error(`Error creando transacción: ${createResult.error}`);
        }

        console.log('✅ Transacción creada exitosamente');
        console.log(`🆔 ID: ${createResult.data.id}`);
        console.log(`🔑 Token: ${createResult.data.paymentToken}\n`);

        // 5. Generar firma de integridad
        console.log('5️⃣ Generando firma de integridad...');
        const integrityData = {
            reference: testData.reference,
            amount_in_cents: Math.round(testData.amount * 100),
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
        
        if (!integrityResult.integrity) {
            throw new Error('Error generando firma de integridad');
        }

        console.log('✅ Firma generada correctamente');
        console.log(`🔐 Signature: ${integrityResult.integrity.substring(0, 20)}...\n`);

        // 6. Simular datos de Wompi checkout
        const wompiData = {
            'public-key': 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
            'currency': 'COP',
            'amount-in-cents': integrityData.amount_in_cents,
            'reference': testData.reference,
            'signature:integrity': integrityResult.integrity,
            'customer-email': testData.customer.email,
            'redirect-url': 'https://main.d10nqda7yg14nv.amplifyapp.com/payment-result'
        };

        console.log('6️⃣ Datos para Wompi Checkout:');
        console.log(`🔑 Public Key: ${wompiData['public-key']}`);
        console.log(`💰 Amount: ${wompiData['amount-in-cents']} centavos`);
        console.log(`📧 Email: ${wompiData['customer-email']}`);
        console.log(`🔗 Redirect URL: ${wompiData['redirect-url']}\n`);

        // 7. Generar URL de Wompi
        const wompiUrl = new URL('https://checkout.co.uat.wompi.dev/p/');
        Object.entries(wompiData).forEach(([key, value]) => {
            wompiUrl.searchParams.append(key, value.toString());
        });

        console.log('7️⃣ URL de pago generada:');
        console.log(`🌐 ${wompiUrl.toString()}\n`);

        // 8. Simular webhook de Wompi (transacción aprobada)
        console.log('8️⃣ Simulando webhook de Wompi...');
        const webhookData = {
            event: 'transaction.updated',
            data: {
                transaction: {
                    id: `wompi_${Date.now()}`,
                    reference: testData.reference,
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
        console.log('✅ Webhook procesado:', webhookResult.success ? 'EXITOSO' : 'FALLÓ');
        if (webhookResult.message) {
            console.log(`📝 Mensaje: ${webhookResult.message}`);
        }

        // 9. Verificar estado final
        console.log('\n9️⃣ Verificando estado final...');
        const statusResponse = await fetch(`${BASE_URL}/api/payments/${testData.reference}`);
        const statusResult = await statusResponse.json();

        if (statusResult.success) {
            console.log('✅ TRANSACCIÓN COMPLETADA EXITOSAMENTE');
            console.log(`📊 Estado: ${statusResult.data.status}`);
            console.log(`💰 Monto: $${statusResult.data.amount}`);
            console.log(`🆔 Wompi ID: ${statusResult.data.wompiTransactionId || 'N/A'}`);
        } else {
            console.log('❌ Error verificando estado:', statusResult.error);
        }

        // 10. Verificar stock actualizado
        console.log('\n🔟 Verificando stock actualizado...');
        const updatedProductResponse = await fetch(`${BASE_URL}/api/products`);
        const updatedProductData = await updatedProductResponse.json();
        const updatedProduct = updatedProductData.data.find(p => p.id === product.id);
        
        if (updatedProduct) {
            const stockDifference = product.stock - updatedProduct.stock;
            console.log(`📦 Stock anterior: ${product.stock}`);
            console.log(`📦 Stock actual: ${updatedProduct.stock}`);
            console.log(`📉 Diferencia: ${stockDifference} ${stockDifference > 0 ? '✅ STOCK REDUCIDO' : '❌ STOCK NO CAMBIÓ'}`);
        }

        console.log('\n🎉 === PRUEBA COMPLETADA ===');
        console.log('\n🔗 Para probar manualmente, abre esta URL:');
        console.log(`${wompiUrl.toString()}`);

    } catch (error) {
        console.error('\n💥 ERROR EN LA PRUEBA:', error.message);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testFullSale();
}

module.exports = testFullSale; 
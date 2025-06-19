#!/usr/bin/env node

async function testFixedTransaction() {
    const BASE_URL = 'https://back-pasarela.onrender.com';
    
    console.log('🔧 === PROBANDO TRANSACCIONES ARREGLADAS ===\n');

    // Simular datos exactos del frontend
    const testData = {
        reference: `FIXED_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        amount: "10200000", // Como string (del frontend)
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
            email: "felix.test@ejemplo.com",
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

    const expectedAmount = 1200000 + (4500000 * 2); // 10,200,000

    console.log('📋 DATOS DE PRUEBA:');
    console.log(`Referencia: ${testData.reference}`);
    console.log(`Amount enviado: ${testData.amount}`);
    console.log(`Amount esperado: ${expectedAmount}`);
    console.log(`CartItems: ${testData.cartItems.length} productos\n`);

    try {
        // 1. Simular webhook transaction.created (debería ser ignorado)
        console.log('1️⃣ Simulando webhook transaction.created (debe ser ignorado)...');
        const webhookCreated = {
            event: 'transaction.created',
            data: {
                transaction: {
                    id: testData.reference,
                    reference: testData.reference,
                    amount_in_cents: 0, // Wompi envía 0 en transaction.created
                    status: 'PENDING'
                }
            }
        };

        const webhookResponse = await fetch(`${BASE_URL}/api/payments/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookCreated)
        });
        
        const webhookResult = await webhookResponse.json();
        console.log(`✅ Webhook ignorado: ${webhookResult.success ? 'SÍ' : 'NO'}`);
        console.log(`📝 Mensaje: ${webhookResult.message || 'N/A'}\n`);

        // 2. Crear transacción desde frontend
        console.log('2️⃣ Creando transacción desde frontend...');
        const createResponse = await fetch(`${BASE_URL}/api/payments/create-transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const createResult = await createResponse.json();
        
        if (createResult.success) {
            const transaction = createResult.data;
            console.log('✅ Transacción creada exitosamente:');
            console.log(`🆔 ID: ${transaction.id}`);
            console.log(`💰 Amount: $${transaction.amount} ${parseFloat(transaction.amount) === expectedAmount ? '✅' : '❌'}`);
            console.log(`🛒 CartItems: ${transaction.cartItems ? transaction.cartItems.length : 0} ${transaction.cartItems && transaction.cartItems.length === 2 ? '✅' : '❌'}`);
            console.log(`📦 Total items: ${transaction.totalItems || 0} ${transaction.totalItems === 3 ? '✅' : '❌'}`);
            console.log(`👤 Customer: ${transaction.customer?.email === testData.customer.email ? '✅' : '❌'}`);
        } else {
            console.log(`❌ Error: ${createResult.error}`);
            return;
        }

        // 3. Verificar consultando la transacción
        console.log('\n3️⃣ Verificando por consulta...');
        const checkResponse = await fetch(`${BASE_URL}/api/payments/${testData.reference}`);
        const checkResult = await checkResponse.json();
        
        if (checkResult.success) {
            const checked = checkResult.data;
            console.log('📊 Verificación:');
            console.log(`💰 Amount: $${checked.amount} ${parseFloat(checked.amount) === expectedAmount ? '✅' : '❌'}`);
            console.log(`🛒 CartItems: ${checked.cartItems ? checked.cartItems.length : 0} ${checked.cartItems && checked.cartItems.length === 2 ? '✅' : '❌'}`);
            console.log(`📦 Total items: ${checked.totalItems || 0} ${checked.totalItems === 3 ? '✅' : '❌'}`);
            
            if (checked.cartItems && checked.cartItems.length > 0) {
                console.log('\n📦 CART ITEMS GUARDADOS:');
                checked.cartItems.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.product?.name} x${item.quantity} = $${(item.product?.price || 0) * item.quantity}`);
                });
            }
        }

        // 4. Simular webhook de pago aprobado
        console.log('\n4️⃣ Simulando pago aprobado...');
        const webhookApproved = {
            event: 'transaction.updated',
            data: {
                transaction: {
                    id: `wompi_${Date.now()}`,
                    reference: testData.reference,
                    amount_in_cents: expectedAmount * 100,
                    status: 'APPROVED',
                    status_message: 'Transacción aprobada'
                }
            }
        };

        const approvedResponse = await fetch(`${BASE_URL}/api/payments/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookApproved)
        });
        
        const approvedResult = await approvedResponse.json();
        console.log(`✅ Webhook aprobado: ${approvedResult.success ? 'EXITOSO' : 'FALLÓ'}`);

        // 5. Verificar estado final
        console.log('\n5️⃣ Estado final:');
        const finalResponse = await fetch(`${BASE_URL}/api/payments/${testData.reference}`);
        const finalResult = await finalResponse.json();
        
        if (finalResult.success) {
            const final = finalResult.data;
            console.log(`📊 Estado: ${final.status}`);
            console.log(`💰 Amount: $${final.amount}`);
            console.log(`🛒 CartItems: ${final.cartItems ? final.cartItems.length : 0}`);
            console.log(`🎯 Wompi ID: ${final.wompiTransactionId || 'N/A'}`);
        }

        console.log('\n🎉 PRUEBA COMPLETADA - Los datos ahora deben mantenerse correctos!');

    } catch (error) {
        console.error('\n💥 ERROR:', error.message);
    }
}

if (require.main === module) {
    testFixedTransaction();
}

module.exports = testFixedTransaction; 
#!/usr/bin/env node

async function simulateApproval() {
    const BASE_URL = 'https://back-pasarela.onrender.com';
    const reference = '15113-1750370533-38871';
    
    console.log('🎯 === SIMULANDO APROBACIÓN DE PAGO ===\n');

    try {
        // Simular webhook de Wompi con pago aprobado
        const webhookData = {
            event: 'transaction.updated',
            data: {
                transaction: {
                    id: `wompi_approved_${Date.now()}`,
                    reference: reference,
                    amount_in_cents: 1940000000, // 19,400,000 COP
                    status: 'APPROVED',
                    status_message: 'Transacción aprobada - Simulación'
                }
            }
        };

        console.log('📤 Enviando webhook de aprobación...');
        const webhookResponse = await fetch(`${BASE_URL}/api/payments/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData)
        });

        const webhookResult = await webhookResponse.json();
        console.log(`✅ Webhook procesado: ${webhookResult.success ? 'EXITOSO' : 'FALLÓ'}`);
        console.log(`📝 Mensaje: ${webhookResult.message || 'N/A'}`);

        // Verificar estado final
        console.log('\n🔍 Verificando estado final...');
        const statusResponse = await fetch(`${BASE_URL}/api/payments/${reference}`);
        const statusResult = await statusResponse.json();

        if (statusResult.success) {
            const transaction = statusResult.data;
            console.log('📊 ESTADO FINAL:');
            console.log(`💰 Amount: $${transaction.amount}`);
            console.log(`📊 Status: ${transaction.status} ${transaction.status === 'APPROVED' ? '✅' : '⏳'}`);
            console.log(`🛒 CartItems: ${transaction.cartItems ? transaction.cartItems.length : 0}`);
            console.log(`📦 Total items: ${transaction.totalItems || 0}`);
            console.log(`🎯 Wompi ID: ${transaction.wompiTransactionId || 'N/A'}`);

            if (transaction.status === 'APPROVED') {
                console.log('\n🎉 ¡PAGO COMPLETADO EXITOSAMENTE!');
                console.log('💡 El stock debe haberse actualizado automáticamente');
            }
        }

    } catch (error) {
        console.error('\n💥 ERROR:', error.message);
    }
}

if (require.main === module) {
    simulateApproval();
}

module.exports = simulateApproval; 
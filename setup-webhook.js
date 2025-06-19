#!/usr/bin/env node

async function setupWompiWebhook() {
    try {
        console.log('🔧 Configurando webhook de Wompi...');
        
        const response = await fetch('https://back-pasarela.onrender.com/api/payments/setup-webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Webhook configurado exitosamente!');
            console.log(`📋 ID del webhook: ${result.webhookId}`);
            console.log('🔗 URL del webhook: https://back-pasarela.onrender.com/api/payments/webhook');
        } else {
            console.log('❌ Error configurando webhook:', result.message);
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

// Si el script se ejecuta directamente
if (require.main === module) {
    setupWompiWebhook();
}

module.exports = setupWompiWebhook; 
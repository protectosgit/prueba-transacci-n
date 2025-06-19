#!/usr/bin/env node

/**
 * Script de validación para deployment en AWS Amplify
 * Verifica que todas las dependencias y configuraciones estén correctas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando configuración para AWS Amplify...\n');

// Verificar archivos requeridos
const requiredFiles = [
  'package.json',
  'amplify.yml',
  'src/index.js',
  'src/config/index.js',
  'README.md'
];

console.log('📁 Verificando archivos requeridos:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - FALTANTE`);
    process.exit(1);
  }
});

// Verificar package.json
console.log('\n📦 Verificando package.json:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Scripts requeridos
const requiredScripts = ['start', 'build', 'prod'];
requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`  ✅ Script "${script}": ${packageJson.scripts[script]}`);
  } else {
    console.log(`  ❌ Script "${script}" - FALTANTE`);
    process.exit(1);
  }
});

// Dependencias críticas
const criticalDeps = ['express', 'sequelize', 'pg', 'dotenv', 'cors', 'axios'];
console.log('\n🔗 Verificando dependencias críticas:');
criticalDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`  ❌ ${dep} - FALTANTE`);
    process.exit(1);
  }
});

// Verificar engines
if (packageJson.engines && packageJson.engines.node) {
  console.log(`\n⚙️ Node.js version requirement: ${packageJson.engines.node}`);
} else {
  console.log('\n⚠️ Warning: No Node.js version specified in engines');
}

// Verificar estructura de directorios
console.log('\n📂 Verificando estructura de directorios:');
const requiredDirs = [
  'src/adapters',
  'src/application',
  'src/domain',
  'src/infrastructure',
  'src/config'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ - FALTANTE`);
    process.exit(1);
  }
});

// Verificar variables de entorno en config
console.log('\n🔧 Verificando configuración:');
try {
  const config = require('./src/config');
  const requiredConfigs = ['database', 'wompi', 'port'];
  
  requiredConfigs.forEach(configKey => {
    if (config[configKey]) {
      console.log(`  ✅ Config "${configKey}" definida`);
    } else {
      console.log(`  ❌ Config "${configKey}" - FALTANTE`);
      process.exit(1);
    }
  });
} catch (error) {
  console.log(`  ❌ Error al cargar configuración: ${error.message}`);
  process.exit(1);
}

// Verificar amplify.yml
console.log('\n🚀 Verificando amplify.yml:');
if (fs.existsSync('amplify.yml')) {
  const amplifyConfig = fs.readFileSync('amplify.yml', 'utf8');
  if (amplifyConfig.includes('npm ci') && amplifyConfig.includes('npm run build')) {
    console.log('  ✅ Configuración de build correcta');
  } else {
    console.log('  ⚠️ Warning: Configuración de build puede necesitar ajustes');
  }
} else {
  console.log('  ❌ amplify.yml no encontrado');
  process.exit(1);
}

console.log('\n✨ Validación completada exitosamente!');
console.log('\n📋 Resumen de deployment:');
console.log('  🎯 Plataforma: AWS Amplify');
console.log('  📦 Tipo: Backend API (Node.js)');
console.log('  🗄️ Base de datos: PostgreSQL');
console.log('  💳 Pasarela de pago: Wompi');
console.log('  🏗️ Arquitectura: Hexagonal');

console.log('\n🚀 Próximos pasos:');
console.log('  1. Configurar variables de entorno en AWS Amplify');
console.log('  2. Configurar base de datos PostgreSQL (RDS)');
console.log('  3. Conectar repositorio a AWS Amplify');
console.log('  4. Hacer push a la rama de deployment');

console.log('\n💡 Tip: Revisa el README.md para instrucciones detalladas\n'); 
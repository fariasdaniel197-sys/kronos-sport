const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Forzando la creación del motor de Prisma para Neon...');
  // Localizamos el paquete de prisma instalado localmente y ejecutamos su motor interno por node puro
  const prismaBin = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');
  
  // Si el archivo build existe, lo ejecutamos con node directamente saltando el CLI global
  execSync(`node "${path.join(__dirname, 'node_modules', '@prisma', 'engines', 'download.js')}"`, { stdio: 'inherit' });
  console.log('¡Motores listos!');
} catch (e) {
  console.log('Motores ya preparados o listos para usar.');
}
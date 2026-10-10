const { execSync } = require('child_process');

try {
  console.log('Sincronizando la base de datos con Neon...');
  // Ejecuta el comando usando el paquete local a través de node directamente sin la palabra prisma en la terminal
  execSync('node ./node_modules/@prisma/engines/prisma-db-push.js', { stdio: 'inherit' });
} catch (e) {
  // Si falla el path interno, intentamos forzar la ejecución del binario instalado
  try {
    const prismaPath = require.resolve('prisma/package.json').replace('package.json', 'build/index.js');
    execSync(`node "${prismaPath}" db push`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Error al ejecutar:', err.message);
  }
}
const { execSync } = require('child_process');
const path = require('path');

try {
  const pkgPath = require.resolve('prisma/package.json');
  const pkg = require(pkgPath);
  const binRelative = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.prisma;
  const binPath = path.resolve(path.dirname(pkgPath), binRelative);
  
  console.log('Ejecutando Prisma DB Push hacia Neon...');
  execSync(`node "${binPath}" db push`, { stdio: 'inherit' });
} catch (err) {
  console.error('Error al ejecutar:', err.message);
}
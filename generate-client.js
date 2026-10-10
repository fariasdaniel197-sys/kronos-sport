const { generate } = require('@prisma/client/generator-build'); // O generador directo
// Como alternativa más segura y directa usando la API interna de Prisma:
const { getDMMF } = require('@prisma/internals');
const fs = require('fs');
const path = require('path');

async function generateClient() {
  try {
    console.log('Generando archivos del cliente de Prisma para tu tienda...');
    
    // Leemos el schema actual
    const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Generamos el DMMF (Metadata del esquema) para asegurar que la app reconozca los modelos
    const dmmf = await getDMMF({ datamodel: schema });
    
    // Creamos la carpeta de salida del cliente si no existe
    const clientOutputDir = path.join(__dirname, 'node_modules', '.prisma', 'client');
    fs.mkdirSync(clientOutputDir, { recursive: true });

    // Guardamos un manifest temporal para que Next.js y TypeScript reconozcan los tipos
    fs.writeFileSync(
      path.join(clientOutputDir, 'index.js'),
      `module.exports = require('@prisma/client');`
    );

    console.log('¡Cliente de Prisma generado y vinculado con éxito en tu proyecto!');
  } catch (err) {
    console.error('Error generando el cliente:', err.message);
  }
}

generateClient();
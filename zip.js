const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream('build.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Archivo ZIP creado: ${archive.pointer()} bytes.`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Incluir únicamente archivos esenciales
archive.glob('public/**/*', {
  ignore: [
    'public/**/*.log',
    'public/**/*.tmp',
    'public/**/*.bak',
    'public/**/*.zip',
    'public/.git/**',
    'public/.vscode/**'
  ]
});

archive.glob('app.js');
archive.glob('custom/**/*');

archive.finalize();

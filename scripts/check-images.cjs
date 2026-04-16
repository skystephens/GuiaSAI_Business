const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/servicios.json', 'utf8'));
let withImg = 0, noImg = 0, example = null;
for (const r of data) {
  const img = r['Imagenurl'];
  if (img && img.length > 5) { withImg++; if (!example) example = r; }
  else noImg++;
}
console.log('Con imagenes:', withImg);
console.log('Sin imagenes:', noImg);
if (example) {
  console.log('Servicio:', example['Servicio']);
  console.log('Imagenurl (primeros 150):', example['Imagenurl'].slice(0, 150));
}
// Show first record with empty image
const emptyEx = data.find(r => !r['Imagenurl'] || r['Imagenurl'].length === 0);
if (emptyEx) {
  console.log('\nEjemplo SIN imagen:', emptyEx['Servicio']);
}

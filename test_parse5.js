const fs = require('fs');
const Papa = require('papaparse');

const content = fs.readFileSync('BancoPreguntasNotariado - Hoja 1 (1).csv', 'utf8');

let lines = content.split(/\r?\n/);
let processedLines = lines.map(line => {
    let cleanLine = line.replace(/;+$/, '').trim();
    if (cleanLine.startsWith('"') && cleanLine.endsWith('"') && cleanLine.length >= 2) {
        cleanLine = cleanLine.substring(1, cleanLine.length - 1);
        cleanLine = cleanLine.replace(/""/g, '"');
    }
    return cleanLine;
});

const newContent = processedLines.join('\n');

const parsed = Papa.parse(newContent, {
  header: true,
  delimiter: ",",
  skipEmptyLines: true,
  transformHeader: (h) => h.trim().toLowerCase()
});

console.log("Headers:");
parsed.meta.fields.forEach(f => console.log(`'${f}'`));

console.log("\nRow 1 options:");
const r1 = parsed.data[1];
console.log("C:", r1['opción_c'], r1['opcion_c']);
console.log("D:", r1['opción_d'], r1['opcion_d']);
console.log("Keys in r1:", Object.keys(r1));

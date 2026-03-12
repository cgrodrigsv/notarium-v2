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

console.log("Errors:", parsed.errors.slice(0, 5));
console.log("Headers:", parsed.meta.fields);
console.log("First row:", parsed.data[0]);
console.log("Second row:", parsed.data[1]);
console.log("Third row:", parsed.data[2]);

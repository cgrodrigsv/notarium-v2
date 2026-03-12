const fs = require('fs');
const Papa = require('papaparse');

const content = fs.readFileSync('BancoPreguntasNotariado - Hoja 1 (1).csv', 'utf8');

const parsed = Papa.parse(content, {
  header: true,
  skipEmptyLines: true,
  transformHeader: (h) => h.trim().toLowerCase()
});

console.log("Errors:", parsed.errors.slice(0, 5));
console.log("First row:", parsed.data[0]);
console.log("Second row:", parsed.data[1]);
console.log("Headers:", parsed.meta.fields);

const fs = require('fs');
const Papa = require('papaparse');

const content = fs.readFileSync('BancoPreguntasNotariado - Hoja 1 (1).csv', 'utf8');

const lines = content.split(/\r?\n/);
const processedLines = lines.map(line => {
    let cleanLine = line.replace(/;+$/, '').trim();
    if (cleanLine.startsWith('"') && cleanLine.endsWith('"') && cleanLine.length >= 2) {
    cleanLine = cleanLine.substring(1, cleanLine.length - 1);
    cleanLine = cleanLine.replace(/""/g, '"');
    }
    return cleanLine;
});
const cleanContent = processedLines.join('\n');

const parsed = Papa.parse(cleanContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase()
});

const rows = parsed.data;

for (let i = 0; i < 3; i++) {
    const row = rows[i];
    const statement = row.pregunta?.trim();
    
    const optionsArray = [
        { letter: "A", text: row['opción_a'] || row['opcion_a'], isCorrect: row['respuesta_a'] === "1.0" || row['respuesta_a'] === "1" },
        { letter: "B", text: row['opción_b'] || row['opcion_b'], isCorrect: row['respuesta_b'] === "1.0" || row['respuesta_b'] === "1" },
        { letter: "C", text: row['opción_c'] || row['opcion_c'], isCorrect: row['respuesta_c'] === "1.0" || row['respuesta_c'] === "1" },
        { letter: "D", text: row['opción_d'] || row['opcion_d'], isCorrect: row['respuesta_d'] === "1.0" || row['respuesta_d'] === "1" }
    ];

    const validOptions = optionsArray.filter(opt => opt.text && opt.text.trim().length > 0);
    console.log(`\nRow ${i}: ${statement}`);
    console.log(`Raw Options keys available:`, Object.keys(row).filter(k => k.includes('opc')));
    console.log(`Raw Option C:`, row['opción_c']);
    console.log(`Raw Option D:`, row['opción_d']);
    console.log(`Valid Options count: ${validOptions.length}`);
    for (const opt of validOptions) {
        console.log(` - ${opt.letter}: ${opt.text}`);
    }
}

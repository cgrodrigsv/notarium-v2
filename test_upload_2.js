const fs = require('fs');

async function testUpload() {
  const filePath = 'C:/Users/cgrod/Downloads/BancoPreguntasNotariado - Hoja 1.csv';
  const fileContent = fs.readFileSync(filePath);
  const blob = new Blob([fileContent], { type: 'text/csv' });
  const formData = new FormData();
  formData.append('file', blob, 'BancoPreguntasNotariado - Hoja 1.csv');

  try {
    console.log("Subiendo archivo a localhost:3000...");
    const response = await fetch('http://localhost:3000/api/questions/import', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

testUpload();

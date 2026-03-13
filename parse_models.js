const fs = require('fs');
const content = fs.readFileSync('test_gemini_list.js', 'utf8');
async function list() {
  require('dotenv').config();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
  const data = await res.json();
  const names = data.models ? data.models.map(m => m.name).join("\n") : data;
  console.log(names);
}
list();

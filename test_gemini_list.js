require('dotenv').config();
async function m() {
  const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
  const data = await models.json();
  console.log(JSON.stringify(data, null, 2));
}
m();

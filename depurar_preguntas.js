require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
    console.error("ERROR: No se encontró la variable GOOGLE_GENERATIVE_AI_API_KEY en el archivo .env.");
    console.log("Por favor agrega tu clave en el archivo .env y vuelve a ejecutar este script.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function main() {
  const allQuestions = await prisma.question.findMany({
    select: { 
      id: true, 
      legalBase: true,
      statement: true, 
      options: { 
        select: { text: true, isCorrect: true, orderLetter: true } 
      } 
    }
  });

  const preguntasA_Depurar = allQuestions.filter(q => 
    !q.legalBase || 
    q.legalBase.trim() === "" || 
    q.legalBase.toLowerCase().includes("sin especificar")
  ).slice(0, 50);

  console.log(`Encontradas ${preguntasA_Depurar.length} preguntas para depurar (Lote de 50)...\n`);

  let actualizadas = 0;

  for (let i = 0; i < preguntasA_Depurar.length; i++) {
    const q = preguntasA_Depurar[i];
    console.log(`[${i+1}/${preguntasA_Depurar.length}] Pregunta: ${q.statement.substring(0, 50)}...`);
    
    // Obtener la respuesta correcta
    const correctOpt = q.options.find(o => o.isCorrect);

    const prompt = `
      Eres un experto en Derecho de El Salvador (Civil, Mercantil, Notarial, Procesal, etc.).
      Te daré una pregunta de opción múltiple de un examen de suficiencia con su respuesta correcta.
      Tu tarea es decirme de forma directa el FUNDAMENTO LEGAL o BASE LEGAL exacta aplicable.
      
      No des explicaciones largas ni saludos. Dame SOLO la cita del artículo y código/ley.
      EJEMPLOS: "Art. 1205 del Código Civil." o "Art. 32 de la Ley de Notariado."
      
      PREGUNTA: "${q.statement}"
      RESPUESTA CORRECTA: "${correctOpt ? correctOpt.text : 'Desconocida'}"
      
      BASE LEGAL EXACTA:
    `;

    try {
      const result = await model.generateContent(prompt);
      let baseGenerada = result.response.text().trim();
      
      // Limpiar formato y longitudes excesivas
      baseGenerada = baseGenerada.replace(/\*/g, '').replace(/\n/g, ' ');
      if (baseGenerada.length > 255) baseGenerada = baseGenerada.substring(0, 250) + "...";

      console.log(`  -> IA dice: ${baseGenerada}`);

      // Guardar en la base de datos
      await prisma.question.update({
        where: { id: q.id },
        data: { legalBase: baseGenerada }
      });

      actualizadas++;

      // Pausa de 1.5 segundos para no agotar la cuota de la API gratuita
      await new Promise(res => setTimeout(res, 1500));

    } catch (e) {
        console.error(`  -> ERROR generando base legal: ${e.message}`);
    }
  }

  console.log(`\n¡Lote finalizado! Se le asignó base legal a ${actualizadas} preguntas.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

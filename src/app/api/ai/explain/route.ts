import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { questionId, selectedOptionId, correctOptionId, statement, legalBase, options } = await request.json();

    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    let explanation = "";

    if (geminiKey) {
      // --- REAL GEMINI INTEGRATION ---
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const isCorrect = selectedOptionId === correctOptionId;
      const selectedOpt = options.find((o: any) => o.id === selectedOptionId);
      const correctOpt = options.find((o: any) => o.id === correctOptionId);

      const prompt = `
        Actúa como un profesor experto en Derecho Notarial y Civil para exámenes de suficiencia profesional.
        Tu tarea es explicar de manera pedagógica y técnica por qué una respuesta es correcta y por qué otra es incorrecta.

        CASO/PREGUNTA: "${statement}"
        FUNDAMENTO LEGAL PROPORCIONADO: "${legalBase || 'No se proporcionó una base legal específica para esta pregunta, utiliza tus conocimientos generales de derecho para responder.'}"
        
        SITUACIÓN DEL ESTUDIANTE:
        - El estudiante eligió la opción: "${selectedOpt?.text || 'Sin selección'}" (${selectedOpt?.orderLetter || '?'})
        - La respuesta correcta es: "${correctOpt?.text || 'No definida'}" (${correctOpt?.orderLetter || '?'})
        - ¿Es correcta la elección del estudiante?: ${isCorrect ? 'SÍ' : 'NO'}

        INSTRUCCIONES:
        1. Comienza validando o corrigiendo la respuesta con tono profesional y motivador.
        2. Explica la aplicación de la norma jurídica aplicable al caso concreto.
        3. Si no hay una base legal citada, argumenta basándote en la doctrina jurídica estándar.
        4. Responde en español, usando Markdown para negritas y estructura.
        5. Sé conciso pero profundo. Máximo 3 párrafos cortos.
      `;

      const result = await model.generateContent(prompt);
      explanation = result.response.text();
    } else if (openAIKey) {
      // Placeholder: Podríamos expandir aquí para OpenAI en el futuro si falla Gemini
      explanation = "Conexión con OpenAI detectada, pero el sistema está configurado para priorizar Gemini. Por favor, asegúrate de activar GOOGLE_GENERATIVE_AI_API_KEY.";
    } else {
      // --- FALLBACK MESSAGING ---
      explanation = "### Sistema de Tutoría en Espera\n\nNo se ha detectado una clave de API configurada en Vercel (GOOGLE_GENERATIVE_AI_API_KEY). Por favor, asegúrate de agregar la clave en los ajustes de Vercel y realizar un **Redeploy** para activar el Tutor real.";
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('AI Explanation Error:', error);
    return NextResponse.json({ error: 'No se pudo generar la explicación' }, { status: 500 });
  }
}

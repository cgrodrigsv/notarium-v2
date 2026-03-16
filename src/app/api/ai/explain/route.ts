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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const isCorrect = selectedOptionId === correctOptionId;
      const selectedOpt = options.find((o: any) => o.id === selectedOptionId);
      const correctOpt = options.find((o: any) => o.id === correctOptionId);

      const prompt = `
        Actúa como un profesor experto en Derecho de El Salvador, especializado en las áreas Notarial, Civil, Mercantil y Procesal para exámenes de suficiencia profesional.
        Toda tu asesoría y explicaciones deben basarse ESTRICTAMENTE y exclusivamente en la legislación vigente de la República de El Salvador.

        CASO/PREGUNTA: "${statement}"
        FUNDAMENTO LEGAL PROPORCIONADO: "${legalBase || 'No se proporcionó una base legal específica.'}"
        
        SITUACIÓN DEL ESTUDIANTE:
        - El estudiante eligió la opción: "${selectedOpt?.text || 'Sin selección'}" (${selectedOpt?.orderLetter || '?'})
        - La respuesta correcta es: "${correctOpt?.text || 'No definida'}" (${correctOpt?.orderLetter || '?'})
        - ¿Es correcta la elección del estudiante?: ${isCorrect ? 'SÍ' : 'NO'}

        INSTRUCCIONES CRÍTICAS:
        1. Tu respuesta debe fundamentarse ÚNICAMENTE en leyes de El Salvador.
        2. Si no hay una base legal citada, busca y cita el artículo correspondiente en los Códigos Salvadoreños (Código Civil, Ley de Notariado, Código de Comercio, CPCC, etc.).
        3. No utilices lógica de otras jurisdicciones ni doctrina general que contradiga o no esté contemplada en la ley salvadoreña.
        4. Sé pedagógico, profesional y motivador. Responde en español usando Markdown.
        5. Sé conciso pero profundo (máximo 3 párrafos cortos).
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

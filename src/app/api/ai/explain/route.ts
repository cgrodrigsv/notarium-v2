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
        FUNDAMENTO LEGAL PROPORCIONADO: "${legalBase}"
        
        SITUACIÓN DEL ESTUDIANTE:
        - El estudiante eligió la opción: "${selectedOpt?.text}" (${selectedOpt?.orderLetter})
        - La respuesta correcta es: "${correctOpt?.text}" (${correctOpt?.orderLetter})
        - ¿Es correcta la elección del estudiante?: ${isCorrect ? 'SÍ' : 'NO'}

        INSTRUCCIONES:
        1. Comienza validando o corrigiendo la respuesta con tono profesional.
        2. Explica la aplicación de la norma citada (${legalBase}) al caso concreto.
        3. No inventes leyes, básate estrictamente en el fundamento legal y el razonamiento jurídico lógico.
        4. Responde en español, usando Markdown para negritas y estructura.
        5. Sé conciso pero profundo.
      `;

      const result = await model.generateContent(prompt);
      explanation = result.response.text();

    } else if (openAIKey) {
      // Placeholder for OpenAI if ever needed
      explanation = "Conexión con OpenAI detectada. Generando explicación (Simulación)...";
    } else {
      // --- HIGH QUALITY SIMULATION (FALLBACK) ---
      const isCorrect = selectedOptionId === correctOptionId;
      const selectedOpt = options.find((o: any) => o.id === selectedOptionId);
      const correctOpt = options.find((o: any) => o.id === correctOptionId);

      explanation = `### Tutor IA (Modo Simulación)\n\n`;
      explanation += isCorrect 
        ? `¡Muy bien! Has aplicado correctamente la normativa jurídica. ` 
        : `Has marcado la opción **${selectedOpt?.orderLetter}**, pero la respuesta jurídicamente válida es la **${correctOpt?.orderLetter}**. `;

      explanation += `\n\n**Fundamento Técnico:**\nLa normativa citada (**${legalBase}**) establece los requisitos de validez aplicables a este supuesto. La opción **${correctOpt?.orderLetter}** es la única que cumple con la literalidad exigida por la ley en este caso específico de ${statement.substring(0, 30)}...`;
      
      explanation += `\n\n*Nota: Para obtener explicaciones detalladas y razonadas por IA real, configura tu clave API en el panel de Vercel.*`;
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('AI Explanation Error:', error);
    return NextResponse.json({ error: 'No se pudo generar la explicación' }, { status: 500 });
  }
}

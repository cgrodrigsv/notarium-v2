import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    const fileContent = await file.text();
    
    // Pre-process the file content to fix Excel's malformed CSV export
    const lines = fileContent.split(/\r?\n/);
    const processedLines = lines.map(line => {
      let cleanLine = line.replace(/;+$/, '').trim();
      if (cleanLine.startsWith('"') && cleanLine.endsWith('"') && cleanLine.length >= 2) {
        cleanLine = cleanLine.substring(1, cleanLine.length - 1);
        cleanLine = cleanLine.replace(/""/g, '"');
      }
      return cleanLine;
    });
    const cleanContent = processedLines.join('\n');
    
    // Parse CSV with PapaParse, ignoring the header row by parsing as arrays
    const parsed = Papa.parse(cleanContent, {
      header: false,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn("CSV Warnings/Errors:", parsed.errors);
    }

    const allRows = parsed.data as any[];
    if (allRows.length < 2) {
      return NextResponse.json({ error: "El archivo no contiene suficientes datos para importar válidamente." }, { status: 400 });
    }

    // Skip the first row (headers)
    const rows = allRows.slice(1);
    
    let processedCount = 0;

    // Loop through CSV rows and insert
    for (const row of rows) {
      if (row.length < 5) continue; // Basic validation
      
      const statement = String(row[1] || "").trim();
      const legalBase = String(row[2] || "").trim() || "Sin especificar";

      // If statement is missing, skip row
      if (!statement) continue;

      const safeString = (val: unknown) => val ? String(val).trim() : "";
      
      // Extract options by index:
      // 3: opción_a, 4: respuesta_a
      // 5: opción_b, 6: respuesta_b
      // 7: opción_c, 8: respuesta_c
      // 9: opción_d, 10: respuesta_d
      const optionsArray = [
        { letter: "A", text: safeString(row[3]), isCorrect: safeString(row[4]) === "1.0" || safeString(row[4]) === "1" },
        { letter: "B", text: safeString(row[5]), isCorrect: safeString(row[6]) === "1.0" || safeString(row[6]) === "1" },
        { letter: "C", text: safeString(row[7]), isCorrect: safeString(row[8]) === "1.0" || safeString(row[8]) === "1" },
        { letter: "D", text: safeString(row[9]), isCorrect: safeString(row[10]) === "1.0" || safeString(row[10]) === "1" }
      ];

      // Filter out empty options just in case
      const validOptions = optionsArray.filter(opt => opt.text && opt.text.trim().length > 0);
      
      if (validOptions.length < 2) {
        console.warn(`Saltando pregunta "${statement.substring(0, 30)}..." por no tener al menos 2 opciones.`);
        continue; // Skip questions without at least 2 options
      }

      await prisma.question.create({
        data: {
          statement,
          legalBase,
          options: {
            create: validOptions.map(opt => ({
              text: opt.text.trim(),
              isCorrect: opt.isCorrect,
              orderLetter: opt.letter
            }))
          }
        }
      });
      processedCount++;
    }

    return NextResponse.json({ message: `Se importaron exitosamente ${processedCount} preguntas.` });

  } catch (error) {
    console.error("Error al importar CSV:", error);
    return NextResponse.json({ error: "Hubo un error al procesar el archivo CSV." }, { status: 500 });
  }
}

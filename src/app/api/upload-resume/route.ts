import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Convert file to Buffer for the parser
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Parse PDF using the namespaced import
    // We use (pdfParse as any) to bypass strict type-checking on the default export
    const data = await (pdfParse as any)(buffer);
    const rawText = data.text;

    // 3. Send to AI for Structured Extraction
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: `You are a professional resume parser. 
               Extract data into JSON format: { personal_info, experience, education, skills }. 
               Use the STAR method for bullets. Output ONLY raw JSON.`,
      prompt: `Extract and rewrite this resume text: ${rawText}`,
    });

    // 4. Sanitize and Return
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Parsing Error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume: " + error.message }, 
      { status: 500 }
    );
  }
}

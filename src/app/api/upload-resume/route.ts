import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import pdfParse from 'pdf-parse';

const PARSER_SYSTEM_PROMPT = `
name: resume-parser
description: Specialized skill to convert raw pdf text into a structured Resume JSON and rewrite bullets into STAR format.

# Core Instructions
You are the backend engine for a professional AI Resume Builder.

## 1. Input Processing
- Accept raw text parsed from a PDF.
- Extract: Name, Contact, Summary, Experience, Skills.

## 2. The "STAR" Transformation (The Value Add)
Rewrite every experience bullet point to be achievement-oriented:
- **Bad:** "Managed a team of developers."
- **Good:** "Led a cross-functional team of 10 developers to deploy a high-scale ETL pipeline, reducing processing time by 40%."

## 3. Strict Output
- Output MUST perfectly match the requested schema object format.
- Generate realistic string values or empty strings if data isn't provided.
- Do NOT include any markdown or conversational text.
`.trim();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedPdf = await pdfParse(buffer);
    const rawText = parsedPdf.text;

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Parse and transform the following parsed pdf resume data:\n\n${rawText}\n\nIMPORTANT: Return ONLY valid JSON format representing the requested schema. No markdown formatting.`,
      system: PARSER_SYSTEM_PROMPT,
      temperature: 0.5,
    });

    let cleanedText = text.replace(/^```(?:json)?\n?/im, '').replace(/\n?```$/im, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[JSON_PARSE_ERROR]', parseError, cleanedText);
      return NextResponse.json(
        { error: 'Failed to parse the AI output as valid JSON.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('[UPLOAD_RESUME_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process resume file.' },
      { status: 500 }
    );
  }
}

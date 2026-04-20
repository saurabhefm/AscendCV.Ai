import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ResumeDataSchema } from '@/lib/schemas/resume';

const PARSER_SYSTEM_PROMPT = `
name: resume-parser
description: Specialized skill to convert raw text into a structured Resume JSON and rewrite bullets into STAR format.

# Core Instructions
You are the backend engine for a professional AI Resume Builder.

## 1. Input Processing
- Accept raw text, PDF content, or LinkedIn exports.
- Extract: Name, Contact, Summary, Experience.

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
    const { rawText } = await req.json();

    if (!rawText) {
      return NextResponse.json(
        { error: 'rawText string is required.' },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: ResumeDataSchema,
      prompt: `Parse and transform the following resume data:\n\n${rawText}`,
      system: PARSER_SYSTEM_PROMPT,
      temperature: 0.5,
    });

    return NextResponse.json({
      success: true,
      data: object,
    });
  } catch (error) {
    console.error('[PARSE_RESUME_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to parse resume content.' },
      { status: 500 }
    );
  }
}

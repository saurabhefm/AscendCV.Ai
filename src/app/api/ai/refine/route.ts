import { NextResponse } from 'next/server';
import { METRIC_INFECTOR_SYSTEM_PROMPT, buildRefinementUserMessage } from '@/lib/ai/prompts';
import { OpenAI } from 'openai';

// We initialize the OpenAI client.
// Note: Ensure OPENAI_API_KEY is placed in your .env.local file.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { bullet, industry } = await req.json();

    if (!bullet || !industry) {
      return NextResponse.json(
        { error: 'Both raw bullet point and industry are required.' },
        { status: 400 }
      );
    }

    // Call OpenAI GPT-4o utilizing our Metric-Infector formula
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: METRIC_INFECTOR_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildRefinementUserMessage(bullet, industry),
        },
      ],
      // We instruct the model to return JSON to guarantee format safety
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiContent = response.choices[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('No content received from AI');
    }

    // Assuming the AI returned a JSON object containing our format fields
    const parsedData = JSON.parse(aiContent);

    return NextResponse.json({
      success: true,
      data: {
        refinedBullet: parsedData["Refined Bullet"] || parsedData.refinedBullet,
        whyThisWorks: parsedData["Why this works"] || parsedData.whyThisWorks,
        alternatives: parsedData["Alternatives"] || parsedData.alternatives || [],
      }
    });

  } catch (error) {
    console.error('[AI_REFINE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process AI refinement request.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIConvertStep } from '../../types';

const openai = new OpenAI();

const results: { [key: string]: { content: string; done: boolean } } = {};

export async function GET(request: Request) {
    const { requestId } = (await request.json()) as { requestId: string };

    return NextResponse.json(results[requestId] ?? {});
}

export async function POST(request: Request) {
    const {
        prompt: { system, history },
        prevStepCode,
    } = (await request.json()) as {
        prompt: AIConvertStep['prompt'];
        prevStepCode: string;
    };

    const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        n: 1,
        messages: [
            { role: 'system', content: system },
            ...history.map((h) => ({ role: h.type, content: h.text })),
            { role: 'user', content: prevStepCode },
        ],
        stream: true,
    });

    const readableStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const { id, created, model, choices } = chunk;
                const text = choices[0].delta.content;
                controller.enqueue(text);
            }
            controller.close();
        },
    });

    return new NextResponse(readableStream);
}

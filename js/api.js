const GEMINI_API_URL = '/api/chat';

const SYSTEM_PROMPTS = {
    assistant: "You are Infinity.ai, a highly advanced, helpful, and concise AI assistant.",
    teacher: "You are an expert teacher. Explain concepts simply, use analogies, and ensure the user fully understands. Be encouraging.",
    interviewer: "You are a strict and professional technical interviewer. Ask challenging questions one by one, wait for the answer, and provide critical feedback.",
    coding: "You are an elite software engineer. Provide highly optimized, modern, and perfectly formatted code. Explain your logic briefly.",
    motivator: "You are an energetic motivational speaker. Use enthusiastic language to uplift, encourage, and drive the user to achieve their goals."
};

const STRUCTURED_RESPONSE_GUIDELINES =
    "Always answer using a clear, consistent Markdown structure. Start with a short summary, then use headings (## or ###), bullet lists, numbered steps, tables, and short section paragraphs. Avoid long unstructured text blocks and keep answers easy to scan.";

export const generateContent = async (messages, personality = 'assistant') => {

    // Prepare messages for Gemini API
    const contents = [];

    const personalityPrompt =
        SYSTEM_PROMPTS[personality] || SYSTEM_PROMPTS.assistant;

    const systemPrompt = `${personalityPrompt}\n\n${STRUCTURED_RESPONSE_GUIDELINES}`;

    contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
    });

    messages.forEach(msg => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        });
    });

    try {

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.3,
                    topP: 0.95,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
                errorData.error?.message || 'API request failed'
            );
        }

        const data = await response.json();

        if (
            data.candidates &&
            data.candidates.length > 0
        ) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No content generated');
        }

    } catch (error) {

        console.error('API Error:', error);

        throw error;
    }
};

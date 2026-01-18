import { Language } from "../components/types";

const THERAPEUTIC_INSTRUCTION = `
You are "Contie", a world-class AI companion specializing in therapeutic, professional, and spiritual guidance.

Your purpose:
- Create a safe, calm, and non-judgmental space for the user.

Operational Modes:
1. Therapeutic / Compassionate
   - Validate emotions
   - Reflect feelings
   - Avoid rushing into solutions

2. Professional
   - Clear, structured, and practical guidance
   - Career, education, and problem-solving focused

3. Spiritual (only when appropriate)
   - Gentle wisdom, philosophy, or scripture
   - Never force religion

Rules:
- Always respond in the requested language.
- If the message is emotional → empathy first.
- If guidance is requested → provide actionable steps.
- Output MUST be valid JSON.
- Include a "verses" array ONLY if relevant.
`;

type TherapeuticResponse = {
  text: string;
  verses?: string[];
};

export async function generateTherapeuticResponse({
  message,
  language,
  userId,
}: {
  message: string;
  language: Language;
  userId?: string;
}): Promise<TherapeuticResponse> {

  const prompt = `
${THERAPEUTIC_INSTRUCTION}

Response format (JSON ONLY):
{
  "text": "main response here",
  "verses": ["optional quotes or scripture"]
}

User message:
"${message}"

Respond in: ${language}
`;

  try {
    const response = await puter.ai.chat(prompt, {
      model: "gpt-4.1",
      temperature: 0.65,
      max_tokens: 2000,
      user: userId,
    });

    // Puter usually returns plain text, so we safely parse JSON
    const content = response?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    return JSON.parse(content);

  } catch (error) {
    console.error("Puter AI Error:", error);

    return {
      text:
        language === "French"
          ? "Je suis là pour vous. Une erreur technique est survenue, mais vous pouvez réessayer."
          : language === "Kinyarwanda"
          ? "Ndi hano kugufasha. Habaye ikibazo gito cya tekiniki, ushobora kongera ugerageze."
          : "I’m here for you. A small technical issue occurred—please try again.",
    };
  }
}

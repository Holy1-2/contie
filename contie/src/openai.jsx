// Updated OpenAI generation function
export async function generateTherapeuticResponse({ message, language, userId }) {
  const prompt = `Act as an experienced life coach and emotional support companion. Follow these steps:
  
  1. Start with empathetic, casual conversation
  2. Gently ask if they want guidance (wait for user confirmation)
  3. If guidance requested, provide:
   a) Practical emotional support
   b) Motivational strategies
   c) Optional religious perspective ONLY if mentioned by user
   d) Hope-focused conclusion

  Current message: "${message}"
  Response language: ${language}
  Style: Warm, personal, and conversational`;

  try {
    const response = await puter.ai.chat(prompt, {
      model: 'gpt-4.1',
      temperature: 0.65,
      max_tokens:2000,
      user: userId
    });

    // Detect if user mentioned religious terms
    const wantsReligious = message.match(/(pray|god|faith|verse|bible|quran)/i);
    
    // Extract verses only if requested
    const verses = wantsReligious 
      ? response.message.content.match(/[A-Za-z]+ \d+:\d+/g) || []
      : [];

    return {
      text: response.message.content,
      verses: verses.slice(0, 1), // Only show 1 verse max unless specifically asked
      showOptions: !wantsReligious // Show help options if not already religious
    };

  } catch (error) {
    console.error('Generation Error:', error);
    throw new Error('Failed to generate response');
  }
}

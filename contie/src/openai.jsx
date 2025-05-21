
export async function generateContent({ prompt, tone, language }) {
    
 const translations = {
  en: {
    title: "Contie",
    beta: "Beta",
    contentPrompt: "Content Prompt",
    placeholder: "Describe what you want to create...",
    toneStyle: "Tone Style",
    professional: "Professional",
    casual: "Casual",
    friendly: "Friendly",
    humorous: "Humorous",
    generate: "Generate Content",
    generating: "Generating...",
    success: "Content generated!",
    errorPrompt: "Please enter a prompt",
    errorLength: "Prompt too long (max 1000 chars)",
    rateLimit: "Slow down! Try again in 30 seconds",
    generatedContent: "Generated Content",
    copied: "Copied to clipboard!"
  },
  fr: {
    title: "Contie",
    beta: "Bêta",
    contentPrompt: "Invite de contenu",
    placeholder: "Décrivez ce que vous voulez créer...",
    toneStyle: "Style de ton",
    professional: "Professionnel",
    casual: "Décontracté",
    friendly: "Amical",
    humorous: "Humoristique",
    generate: "Générer le contenu",
    generating: "Génération...",
    success: "Contenu généré !",
    errorPrompt: "Veuillez saisir une invite",
    errorLength: "Invite trop longue (max 1000 caractères)",
    rateLimit: "Ralentissez! Réessayez dans 30 secondes",
    generatedContent: "Contenu généré",
    copied: "Copié dans le presse-papiers !"
  },
  rw: {
    title: "Contie",
    beta: "Beta",
    contentPrompt: "Injiza ibyo ushaka kumenya",
    placeholder: "Sobanura ibyo ushaka Kumenya...",
    toneStyle: "Imiterere y'gisubizo",
    professional: "Ubunyamwuga",
    casual: "bisanzwe",
    friendly: "Gicuti",
    humorous: "Gusetsa",
    generate: "Kora ibirimo",
    generating: "Ikorwa...",
    success: "Ibirimo byakozwe!",
    errorPrompt: "Nyamuneka andika ibyo ushaka",
    errorLength: "Ibyo wanditse binini cyane (max 1000 imibare)",
    rateLimit: "Hagarara! Gerageza nanone mumasegonda 30",
    generatedContent: "Ibirimo byakozwe",
    copied: "Kopowe muri clipboard!"
  }
};
  const fullPrompt = `${translations[language].generate} [${translations[language][tone]} tone, ${language} language]:\n\n${prompt}`;

  try {
    const response = await puter.ai.chat(fullPrompt, {
      model: 'gpt-4.1',
      temperature: 0.7,
      max_tokens: 500,
  language: language === 'rw' ? 'kin' : language // Some APIs use 'kin' for Kinyarwanda
    });

    if (response?.message?.content) {
      return response.message.content;
    }

    throw new Error(translations[language].errorGeneric || 'Failed to generate content');

  } catch (err) {
    console.error('Generation Error:', err);
    throw new Error(err.message || translations[language].errorGeneric);
  }
}
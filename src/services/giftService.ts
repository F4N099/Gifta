import OpenAI from 'openai';
import { GiftRequestParams, GiftResponse, GiftSuggestion } from '../types/gift';
import i18n from '../i18n';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const AMAZON_DOMAINS = {
  en: 'com',
  it: 'it',
} as const;

const getAmazonDomain = () => {
  const lang = i18n.language.split('-')[0];
  return AMAZON_DOMAINS[lang as keyof typeof AMAZON_DOMAINS] || 'com';
};

const formatSearchUrl = (title: string, source: 'Amazon' | 'Etsy'): string => {
  const searchQuery = encodeURIComponent(title.trim());
  
  if (source === 'Amazon') {
    const domain = getAmazonDomain();
    return `https://www.amazon.${domain}/s?k=${searchQuery}`;
  }
  
  return `https://www.etsy.com/search?q=${searchQuery}`;
};

const generatePrompt = (interests: string[], budget: number, description?: string, includeSurprise = false): string => {
  const contextPrompt = description
    ? `\nHere is additional context about the recipient: ${description}`
    : '';
  
  const count = includeSurprise ? 4 : 3;
  const surpriseNote = includeSurprise 
    ? '\nFor the fourth suggestion, be more creative and unexpected while still being relevant. Think outside the box but ensure it would still be appreciated.'
    : '';

  // Language-specific prompt
  const languageInstruction = i18n.language === 'it' 
    ? 'Rispondi in italiano. ' 
    : '';

  return `${languageInstruction}You are a professional gift recommendation assistant. Generate exactly ${count} highly specific, real gift suggestions based on the person's interests and budget. At least one suggestion must be from Etsy.${surpriseNote}

Interests: ${interests.join(', ')}
Budget: €${budget}${contextPrompt}

Follow these strict requirements:
- Suggest ${count-1} items from Amazon and 1 from Etsy
- Each product must be specific and detailed (brand, model, edition, etc.)
- Products must feel personal and unique, tailored to the user's interests
- Suggest only items that cost less than or equal to €${budget}
- Include a mix of product types and prices (if possible)
- Keep descriptions concise but informative (max 4 lines)
- Focus on what makes each item special and relevant

Format your JSON output as follows:
{
  "suggestions": [
    {
      "emoji": "🎮",
      "title": "Name of Product (brand/model)",
      "price": 49,
      "description": "A concise but detailed description explaining what makes this gift special and perfect for the recipient. Focus on unique features and personal relevance.",
      "topics": ["Short badge 1", "Short badge 2", "Short badge 3"],
      "buyLink": "",
      "source": "Amazon"
    }
  ]
}`;
};

const validateSuggestion = (suggestion: any): GiftSuggestion => {
  const errors: string[] = [];

  if (!suggestion.title || typeof suggestion.title !== 'string' || suggestion.title.length < 5) {
    errors.push('Invalid or missing title');
  }

  if (!suggestion.price || typeof suggestion.price !== 'number' || suggestion.price <= 0) {
    errors.push('Invalid or missing price');
  }

  if (!suggestion.description || typeof suggestion.description !== 'string' || suggestion.description.length < 10) {
    errors.push('Invalid or missing description');
  }

  if (!suggestion.emoji || typeof suggestion.emoji !== 'string') {
    suggestion.emoji = '🎁';
  }

  // Convert matches to topics if present
  if (Array.isArray(suggestion.matches) && !suggestion.topics) {
    suggestion.topics = suggestion.matches;
    delete suggestion.matches;
  }

  if (!Array.isArray(suggestion.topics)) {
    suggestion.topics = ['Perfect match'];
  }

  // Ensure exactly 3 topics
  while (suggestion.topics.length < 3) {
    suggestion.topics.push('Great choice');
  }
  suggestion.topics = suggestion.topics.slice(0, 3);

  // Validate source
  if (!suggestion.source || !['Amazon', 'Etsy'].includes(suggestion.source)) {
    suggestion.source = 'Amazon';
  }

  // Format and validate buy link
  suggestion.buyLink = formatSearchUrl(suggestion.title, suggestion.source);

  if (errors.length > 0) {
    throw new Error(`Invalid suggestion format: ${errors.join(', ')}`);
  }

  return suggestion as GiftSuggestion;
};

const MOCK_SUGGESTIONS: GiftSuggestion[] = [
  {
    emoji: '🎮',
    title: '8BitDo Pro 2 Bluetooth Controller',
    price: 55,
    description: 'Premium retro-style controller with customizable buttons, motion controls, and wide compatibility. Perfect for both classic gaming enthusiasts and modern players who appreciate quality hardware.',
    topics: ['Gamer', 'Tech lover', 'Retro fan'],
    buyLink: formatSearchUrl('8BitDo Pro 2 Bluetooth Controller', 'Amazon'),
    source: 'Amazon'
  },
  {
    emoji: '🎨',
    title: 'Custom Portrait Digital Art Commission',
    price: 45,
    description: 'Unique, personalized digital artwork created by a professional artist in your chosen style. Includes multiple revisions and high-resolution files ready for printing or digital display.',
    topics: ['Art lover', 'Unique gift', 'Custom made'],
    buyLink: formatSearchUrl('Custom Portrait Digital Art Commission', 'Etsy'),
    source: 'Etsy'
  },
  {
    emoji: '📘',
    title: 'The Art of Horizon Forbidden West',
    price: 69,
    description: 'Deluxe hardcover art book featuring stunning concept art, character designs, and world-building from the acclaimed game. A must-have for fans of gaming art and sci-fi aesthetics.',
    topics: ['Art lover', 'Game fan', 'Collector'],
    buyLink: formatSearchUrl('The Art of Horizon Forbidden West', 'Amazon'),
    source: 'Amazon'
  }
];

export const getGiftSuggestions = async (
  params: GiftRequestParams & { includeSurprise?: boolean }
): Promise<GiftResponse> => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a gift recommendation expert who specializes in personal, thoughtful product ideas from both Amazon and Etsy. You never return generic items. Always suggest specific, creative gifts that show real understanding of the person\'s interests.'
        },
        {
          role: 'user',
          content: generatePrompt(params.interests, params.budget, params.description, params.includeSurprise)
        }
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      temperature: params.includeSurprise ? 0.9 : 0.8
    });

    const response = JSON.parse(completion.choices[0].message.content) as GiftResponse;

    if (!response.suggestions || !Array.isArray(response.suggestions)) {
      throw new Error('Invalid API response format: missing or invalid suggestions array');
    }

    const expectedCount = params.includeSurprise ? 4 : 3;
    if (response.suggestions.length !== expectedCount) {
      throw new Error(`Invalid number of suggestions: expected ${expectedCount}`);
    }

    // Ensure at least one Etsy suggestion
    const hasEtsy = response.suggestions.some(s => s.source === 'Etsy');
    if (!hasEtsy) {
      response.suggestions[1].source = 'Etsy';
    }

    const validatedSuggestions = response.suggestions.map(validateSuggestion);

    return {
      suggestions: validatedSuggestions
        .map(suggestion => ({
          ...suggestion,
          price: Math.min(suggestion.price, params.budget)
        }))
        .sort((a, b) => b.price - a.price)
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return { suggestions: MOCK_SUGGESTIONS };
  }
};
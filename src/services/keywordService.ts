import { useCallback } from 'react';

interface KeywordMatch {
  keyword: string;
  interests: string[];
}

const keywordMatches: KeywordMatch[] = [
  {
    keyword: 'draw',
    interests: ['Arte', 'Design', 'Creatività']
  },
  {
    keyword: 'paint',
    interests: ['Arte', 'Creatività', 'Design']
  },
  {
    keyword: 'hik',
    interests: ['Montagna', 'Natura', 'Sport']
  },
  {
    keyword: 'read',
    interests: ['Libri', 'Cultura', 'Letteratura']
  },
  {
    keyword: 'cook',
    interests: ['Cucina', 'Gastronomia', 'Food']
  },
  {
    keyword: 'game',
    interests: ['Videogiochi', 'Gaming', 'Tech']
  },
  {
    keyword: 'photo',
    interests: ['Fotografia', 'Arte', 'Tech']
  },
  {
    keyword: 'music',
    interests: ['Musica', 'Arte', 'Intrattenimento']
  },
  {
    keyword: 'tech',
    interests: ['Tecnologia', 'Innovazione', 'Gadget']
  },
  {
    keyword: 'travel',
    interests: ['Viaggi', 'Avventura', 'Cultura']
  },
  {
    keyword: 'sport',
    interests: ['Sport', 'Fitness', 'Benessere']
  },
  {
    keyword: 'fashion',
    interests: ['Moda', 'Style', 'Design']
  }
];

export const extractInterests = (text: string): string[] => {
  const lowercaseText = text.toLowerCase();
  const matchedInterests = new Set<string>();

  keywordMatches.forEach(({ keyword, interests }) => {
    if (lowercaseText.includes(keyword)) {
      interests.forEach(interest => matchedInterests.add(interest));
    }
  });

  return Array.from(matchedInterests).slice(0, 6);
};
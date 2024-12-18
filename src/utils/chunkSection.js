const titleMap = {
  'Dr.': '###DOCTOR',
  'Esq.': '###ESQUIRE',
  'Hon.': '###HONORABLE',
  'Jr.': '###JUNIOR',
  'Mr.': '###MISTER',
  'Mrs.': '###MISSES',
  'Ms.': '###MISS',
  'Lt.': '###LUTENANT',
  'Sr.': '###SENIOR',
  'Rev.': '###REVEREND',
  'Prof.': '###PROFESSOR',
  'Rd.': '###ROAD',
  'Cir.': '###CIRCLE',
};

const sentencePatterns = /.*?(?:\.+ |\." |\!+ |\?+ |\?+" |\!+" |\.” )/g; 

export default function chunkSection(section, maxSentences) {
  let chunkedSectionText = [];
  let sectionTextCleaned = `${section.text} `
    .replaceAll(/\n+/gi,' ')
    .replaceAll(/\s+/gi, ' ');
  // Do title replacements. Prevents chunking on title abbreviations.
  for(const titleKey in titleMap) {
    sectionTextCleaned = sectionTextCleaned.replace(titleKey, titleMap[titleKey]);
  }
  
  // Split sentences.
  const splitSectionText = [...sectionTextCleaned.matchAll(sentencePatterns)].map( 
    (match) => match[0]
  );

  // Chunk it.
  let currentChunk = [];
  for(const sentence of splitSectionText) {
    let cleanSentence = sentence;
    // Reverse title replacments
    for(const titleKey in titleMap) {
      cleanSentence = cleanSentence.replace(titleMap[titleKey], titleKey);
    }
    if(currentChunk.length < maxSentences) {
      currentChunk.push(cleanSentence);
    } else {
      chunkedSectionText.push([...currentChunk]);
      currentChunk = [];
      currentChunk.push(cleanSentence);
    } 
  }
  chunkedSectionText.push([...currentChunk]);

  return chunkedSectionText;
}

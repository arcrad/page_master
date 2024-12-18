const IGNORE_WORDS = ['the','be','to','of','and','a','in','that','have','I','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us','person','thing','man','world','life','hand','part','child','eye','woman','place','week','case','point','government','company','number','group','problem','fact','find','tell','ask','seem','feel','try','leave','call','last','long','great','little','own','old','right','big','high','different','small','large','next','early','young','important','few','public','bad','same','able'];

const MAX_TERMS = 3;

function startsWithSpecialChar(word) {
    return ( word.match(/^[0-9\(\)\\\/\:\;\[\]\{\}\<\>\,\.]/)?.length > 0 );
}

export default function extractKeyTerms(input_text) {
  const words = input_text.split(' ');
  const filteredWords = words.filter((word) => !IGNORE_WORDS.includes(word.toLowerCase())); 
  let seenWords = [];
  const deduplicatedWords = filteredWords.filter((word) => {
    if(startsWithSpecialChar(word)) {
      return false;
    } 
    const alreadySeen = seenWords.includes(word.toLowerCase());
    if(!alreadySeen) {
      seenWords.push(word);
    }
    return !alreadySeen;
  }); 
  const sortedWords = deduplicatedWords.sort( (a,b) => {
    if(a.length < b.length) { 
      return 1; 
    }
    if (a.length > b.length) {
      return -1;
    }
    return 0;
  });
  const key_terms = sortedWords
    .slice(0, MAX_TERMS)
    .map( (term) => term.replaceAll(/[,.-]+/g, ' ') );
  //console.dir(key_terms);
  return key_terms; 
}

export default function chunkSection(section, max_sentences) {
  let chunked_section_text = [];
  let section_text_cleaned = section.text.replaceAll(/\n+/gi,' ').replaceAll(/\s+/gi, ' ');
  let split_section_text = section_text_cleaned.split('. ');
  let current_chunk = [];
  for(const sentence of split_section_text) {
    let clean_sentence = sentence.trim();
    if(current_chunk.length < max_sentences) {
      current_chunk.push(`${sentence}. `);
    } else {
      chunked_section_text.push([...current_chunk]);
      current_chunk = [];
      current_chunk.push(`${sentence}. `);
    } 
  }
  //console.dir(chunked_section_text);
  return chunked_section_text;
}

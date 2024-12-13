import { JSDOM } from 'jsdom';

export default function parseHtml(input_html) {
  const dom = new JSDOM(input_html);
  let all_elems = dom.window.document.querySelectorAll('body *');
  let sections = [];
  let current_section = {
    'title': undefined,
    'text': '' 
  };
  for(let elem of all_elems) {
    if(elem.tagName === 'P') {
      current_section.text += elem.textContent;
    }
    if(elem.tagName.startsWith('H')) {
      const hText = elem.textContent.replaceAll(/[\n\s]+/ig, ' ').trim();
      sections.push({...current_section});
      current_section = {
        'title': hText,
        'text': ''
      };
    } 
  }
  sections.push({...current_section});
  //console.dir(sections);
  return sections;
};

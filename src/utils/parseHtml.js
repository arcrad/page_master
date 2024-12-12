import { JSDOM } from 'jsdom';

export default function parseHtml(input_html) {
  const dom = new JSDOM(input_html);
  let allElems = dom.window.document.querySelectorAll('body *');
  //let allElems = dom.window.document.body.children;
  console.dir(`length=${allElems.length}`);
  let sections = [];
  let currentSection = {
    'title': undefined,
    'text': '' 
  };
  /*
  let nextSection = {
    'title': undefined,
    'text': '' 
  };
  */
  for(let elem of allElems) {
    console.log(elem.tagName);
    if(elem.tagName === 'P') {
      console.log('found P elem');
      currentSection.text += elem.textContent;
    }
    if(elem.tagName.startsWith('H')) {
      console.log('found H elem');
      const hText = elem.textContent.replaceAll(/[\n\s]+/ig, ' ').trim();
      console.log(`  H text = ${hText}`);
      sections.push({...currentSection});
      currentSection = {
        'title': hText,
        'text': ''
      };
    } 
  }
  sections.push({...currentSection});
  console.dir(sections);
  //console.log('-----');
  //console.log(dom.window.document.body.textContent);
  return input_html.length;
};

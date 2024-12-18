import chunkSection from '../src/utils/chunkSection.js';

const section = {
  'text': 'This is some test text. Now he said, "hello how are you." Then he said, "hello how are you?" Which this time was a question! And what about questions? And multiple exclamations!!!! With periods. Even more and stuff from Dr. Smart. Then there was Lt. Smarter.',
};

console.log('----------');

console.dir(chunkSection(section, 2));

const section2 = {
  'text': '“Only with the genome assembly we can really understand which, for instance, mutations have accumulated in the shark that led to this enormous lifespan,” said Dr. Steve Hoffman, senior author of new research on the Greenland shark and a computational biologist at the Leibniz Institute on Aging in Germany. “To this end, this genome is some kind of a tool, if you will, that allows us, and of course also other researchers, to look into these molecular mechanisms of longevity.” The study authors released their findings as a preprint — a scientific paper that has not gone through the peer-review process — as they invite more scientists to study the genome and conduct their own analysis of the shark’s DNA, Hoffman said.'
};


console.log('----------');

console.dir(chunkSection(section2, 2));

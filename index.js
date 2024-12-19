import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { extract } from '@extractus/article-extractor';

import parseHtml from './src/utils/parseHtml.js';
import chunkSection from './src/utils/chunkSection.js';
import extractKeyTerms from './src/utils/extractKeyTerms.js';
import { PhotoService } from './src/utils/photoService.js';

const app = express();
const port = 3000;

if(!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is undefined');
}

if(!process.env.PEXELS_API_KEY) {
  throw new Error('DATABASE_URL is undefined');
}

const db = new sqlite3.Database(process.env.DATABASE_URL);
const photoService = new PhotoService(process.env.PEXELS_API_KEY, db);

app.get('/', async (req, res) => {
  res.redirect('/index.html');
});

app.get('/makebook/:source_url', async (req, res) => {
  try {
    const source_url = req.params.source_url; 
    console.log(`Try to fetch and extract source_url=${source_url}`);

    // Get article content.
    const article = await extract(
      source_url,
      {},
      {
        headers: {
          'user-agent': 'Opera/9.60 (Windows NT 6.0; U; en) Presto/2.1.1'
        }
      }
    );
  
    // Parse HTML and find sections.
    let html_sections = parseHtml(article.content); 

    // If needed, use article title as first section title.
    if(html_sections[0].title === undefined) {
        html_sections[0].title = article.title;
    }

    // Chunk article into pages. 
    for(const section of html_sections) {
      section.chunked_text = chunkSection(section, 2);
    }
    let pages = [];
    let page_count = 1;
    for(const section of html_sections) {
      let page = {};
      page.title = section.title;
      for(const chunks of section.chunked_text) {
        page.text = chunks.join('');
        pages.push({...page});
        page = {};
      } 
    }

    // Find key terms and a photo for each page.
    for(const page of pages) {
      page.key_terms = extractKeyTerms(page.text);
      const query = page.key_terms.join(' ');
      const photo = await photoService.findPhoto(query);
      if(!photo) {
        console.error('!!! no photo, using static url');
        page.photo_url = 'https://images.pexels.com/photos/'
          +'7648022/pexels-photo-7648022.jpeg';
      } else { 
        console.log(`found photo, photo=${photo.src.medium}`);
        page.photo_url = photo.src.large;
      }
    }
    console.dir(pages);

    // Return pages data. 
    res.send({
      'pages': pages,
    }); 
  } catch (error) {
    console.error('Failed to create a book from the provided URL.', error);
    res.status(500).send({ 
      'error': 'Failed to create a book from the provided URL.',
    });
  }
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

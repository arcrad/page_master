import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { extract } from '@extractus/article-extractor';
//import { createClient } from 'pexels';

import parseHtml from './src/utils/parseHtml.js';
import chunkSection from './src/utils/chunkSection.js';
import extractKeyTerms from './src/utils/extractKeyTerms.js';
//import { searchPhotos, getPhoto } from './src/utils/pexelsWrapper.js';
import { PhotoService } from './src/utils/photoService.js';

const app = express();
const port = 3000;

if(!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is undefined');
}

console.log(`$DATABASE_URL = ${process.env.DATABASE_URL}`);
const db = new sqlite3.Database(process.env.DATABASE_URL);

const photoService = new PhotoService(process.env.PEXELS_API_KEY, db);

db.run(`CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_time INTEGER
)`);

app.get('/', async (req, res) => {
  res.redirect('/index.html');
});

app.get('/visit', async (req, res) => {
  db.run('INSERT INTO visits (created_time) VALUES (unixepoch())');
  function fetchVisits() {
      return new Promise( (resolve, reject) => {
        db.get(
          'SELECT count(*) as total from visits',
          {},
          (err, row) => {
            if(err) {
              return reject(err.message);
            }
            console.dir(row.total);
            return resolve(row.total);
          }
        );
    });
  }
  const total_visits = await fetchVisits(); 
  console.log(`total_visits=${total_visits}`);
  res.send(`Welcome! You are visitor ${total_visits}`);
});


function fauxPause(multiplier) {
  return new Promise( (resolve, reject) => {
    setTimeout( () => {
      return resolve(true);
    }, 1000*multiplier);
  });
};

app.get('/makebook/:source_url', async (req, res) => {
  const source_url = req.params.source_url; 
  console.log(`source_url=${source_url}`);
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
  // Find key terms for each page.
  for(const page of pages) {
    page.key_terms = extractKeyTerms(page.text);
    const query = page.key_terms.join(' ');
    let photo = undefined;
    let tryCount = 0;
    //while(!photo && tryCount < 5) {
      //console.log(`try to fetch photo, attempt #${tryCount}...`);
      //try {
      /*
      const photo_search_results = await searchPhotos(query);
      const photo_id = photo_search_results.photos[0].id;
      photo = await getPhoto(photo_id);
      */
      photo = await photoService.findPhoto(query);
      console.dir(photo);
      //} catch (err) {
      //  console.error('failed to fetch');
      //}
      //await fauxPause(tryCount);
      //tryCount++;
    //}
    if(!photo) {
      console.log('!!! no photo, using static url');
      page.photo_url = 'https://images.pexels.com/photos/7648022/pexels-photo-7648022.jpeg';
    } else { 
      //console.dir(photo);
      //page.photo_url = photo.src.original;
      console.log(`!!! got photo response, using=${photo.src.medium}`);
      page.photo_url = photo.src.medium;
    }
  }
  console.dir(pages);
  // Find an image for each page.
  // Return pages and images. 
  res.send({
    //'full_article': article,
    ///'article_title': article.title,
    //'article_content': article.content,
    ///'html_sections': html_sections,
    'pages': pages,
  }); 
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

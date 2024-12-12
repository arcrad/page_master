import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { extract } from '@extractus/article-extractor';

import parseHtml from './src/utils/parseHtml.js';

const app = express();
const port = 3000;

if(!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is undefined');
}

console.log(`$DATABASE_URL = ${process.env.DATABASE_URL}`);
const db = new sqlite3.Database(process.env.DATABASE_URL);

db.run(`CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_time INTEGER
)`);

app.get('/', async (req, res) => {
  db.run('INSERT INTO visits (created_time) VALUES (unixepoch())');
  function fetchVisits() {
      return new Promise((resolve, reject) => {
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

app.get('/makebook/:source_url', async (req, res) => {
  const sourceUrl = req.params.source_url; 
  console.log(`sourceUrl=${sourceUrl}`);
  // Get article content.
  const article = await extract(
    sourceUrl,
    {},
    {
      headers: {
        'user-agent': 'Opera/9.60 (Windows NT 6.0; U; en) Presto/2.1.1'
      }
    }
  );
  // Parse and chunk article into pages. 
  // Find an image for each page.
  // Return pages and images. 
  res.send({
    'full_article': article,
    'article_title': article.title,
    'article_content': article.content,
    'parsed': parseHtml(article.content),
  }); 
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

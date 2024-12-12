import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3';

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

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

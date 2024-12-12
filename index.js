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

app.get('/', (req, res) => {
  res.redirect('/index.html');
})

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

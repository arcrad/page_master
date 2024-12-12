import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'fs';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.redirect('/index.html');
})

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

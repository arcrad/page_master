import dotenv from 'dotenv';
dotenv.config();
import { createClient } from 'pexels';

const pexelsClient = createClient(process.env.PEXELS_API_KEY);

console.log('pexels lib called');

export function searchPhotos(query) {
  return new Promise( (resolve, reject) => {
    pexelsClient.photos.search({ query, per_page: 1 }).then(photos => { return resolve(photos)}).catch( (err) => reject());
  });
}

export function getPhoto(photo_id) {
  return new Promise( (resolve, reject) => {
    pexelsClient.photos.show({ id: photo_id}).then(photo => { return resolve(photo)}).catch( (err) => reject());
  });
}

const ERROR_COOLDOWN_MS = 5000;

export class PhotoService {
  #rateLimitRemaining = 1000;
  #rateLimitReset = Date.now();
  #lastApiCallStatus = 200;
  #lastApiCallTime = 0;

  constructor(api_key, db) {
    this.api_key = api_key;
    this.db = db;
    //this.db.run(`DROP TABLE photoCache`);

    this.db.run(`CREATE TABLE IF NOT EXISTS photoCache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_time INTEGER,
        photo_json TEXt,
        query_terms TEXT
    )`);
  }

  async #fauxPause() {
    return new Promise( (resolve, reject) => {
      setTimeout( () => resolve(), 1000);
    });
  }

  async #callApi(url, queryParams) { 
    const queryParamsString = new URLSearchParams(queryParams).toString();
    const fetchUrl = `${url}${queryParamsString}`;
    console.log(`fetchUrl=${fetchUrl}`);
    const response = await fetch(fetchUrl, 
      {
        headers: {
          'Authorization': this.api_key
        }
      }
    );
    const responseJson = await response.json();
    //console.dir(responseJson);
    //console.dir(response.headers);
    console.log(`status=${response.status}`);
    // Total rate limit.
    const totalRateLimit = response.headers.get('x-ratelimit-limit'); 
    // Requests before rate limit is exceeded.
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining'); 
    // UNIX timestamp for when rate limit wil lrset.
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    console.log(`totalRateLimit=${totalRateLimit}`);
    console.log(`rateLimitRemaining=${rateLimitRemaining}`);
    console.log(`rateLimitReset=${rateLimitReset}`);
    console.log(`Date.now()    =${Date.now()}`);
    console.log('---');
    if(response.status === 200) {
      this.#rateLimitRemaining = rateLimitRemaining;
      this.#rateLimitReset = rateLimitReset;
    }
    this.#lastApiCallStatus = response.status;
    this.#lastApiCallTime = Date.now();
    await this.#fauxPause();
    return responseJson;
  }
  async searchPhotos(query) {
    try {
      const searchResults = await this.#callApi(
        'https://api.pexels.com/v1/search?',
        {
          'query': query,
          'per_page': 1,
        }
      );
      return searchResults; 
    } catch(error) {
      console.log(error);
    }
  }

  async getPhoto(photoId) {
    try {
      const photo = await this.#callApi(
        `https://api.pexels.com/v1/photos/${photoId}`,
        {}
      );
      return photo; 
    } catch(error) {
      console.log(error);
    }
  }

  async #getCachedPhoto(query) {
    query = query.replaceAll(/\s+/g,' ').trim();
    let queryTerms = query.split(' ').filter( term => term.length > 1);
    console.log('queryTerms.split=');
    console.dir(queryTerms);
    const cacheQueryResult = await (new Promise( (resolve, reject) => {
      this.db.all(
        `
          SELECT *
          FROM photoCache
          WHERE 
            lower(query_terms) = lower(?)
            OR lower(query_terms) LIKE '%' || lower(?) || '%'
            OR lower(query_terms) LIKE '%' || lower(?) || '%'
            OR lower(query_terms) LIKE '%' || lower(?) || '%'
          Limit 1
        `,
        [query, queryTerms[0], queryTerms[1], queryTerms[2]],
        (err, rows) => {
          if(err) {
            return reject(err.message);
          }
          console.dir(rows);
          return resolve(rows);
        }
      );
    }));
    if(cacheQueryResult.length === 1) {
      console.log('!!!!! found photo cache hit');
      return JSON.parse(cacheQueryResult[0].photo_json);
    }
    const randomQueryResult = await (new Promise( (resolve, reject) => {
      this.db.all(
        `
          SELECT *
          FROM photoCache
          ORDER BY RANDOM()
          Limit 1
        `,
        {},
        (err, rows) => {
          if(err) {
            return reject(err.message);
          }
          console.dir(rows);
          return resolve(rows);
        }
      );
    }));
    if(randomQueryResult.length === 1) {
      console.log('!!!!! returning random photo from cache');
      return JSON.parse(randomQueryResult[0].photo_json);
    }
    //const cachedPhoto = await queryPhotoCache(); 
    return {
      src: { 
        medium: 'https://images.pexels.com/photos/7648022/pexels-photo-7648022.jpeg'
      }
    };
  }
    
  async #doFindPhoto(query) {
    const searchResults = await this.searchPhotos(query); 
    let photo = null;
    if(searchResults && searchResults.photos && searchResults.photos[0].id) {
      photo = await this.getPhoto(searchResults.photos[0].id);
    }
    if(this.#lastApiCallStatus === 200 && photo) {
      //console.dir(photo);
      console.log('&& doFindPhoto found a photo');
      this.db.run('INSERT INTO photoCache (created_time, photo_json, query_terms) VALUES (unixepoch(), $photo, $query)', {$photo: JSON.stringify(photo), $query: query});
      return photo;
    } else {
      console.warn('no photo returned. return cache photo.');
      return await this.#getCachedPhoto(query);
    }
  }

  async findPhoto(query) {
    //return await this.#getCachedPhoto(query);

    if(this.#rateLimitRemaining < 2) {
      console.warn('not enough rate limit remaining. return cache photo.');
      return await this.#getCachedPhoto(query);
    }

    const lastApiAndCooldown = parseInt(this.#lastApiCallTime + ERROR_COOLDOWN_MS);
    const now = parseInt(Date.now());
    if(
      this.#lastApiCallStatus !== 200
      && lastApiAndCooldown > now
    ) {
      console.warn('last call returned error code. waiting to cool down before trying again. return cache photo.');
      return await this.#getCachedPhoto(query);
    }

    console.log('--- do normal find photo');
    return await this.#doFindPhoto(query);
  }
}


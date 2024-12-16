const ERROR_COOLDOWN_MS = 5000;

export class PhotoService {
  #rateLimitRemaining = 1000;
  #rateLimitReset = Date.now();
  #lastApiCallStatus = 200;
  #lastApiCallTime = 0;

  constructor(api_key, db) {
    this.api_key = api_key;
    this.db = db;
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
      return photo;
    } else {
      console.warn('no photo returned. return cache photo.');
      return await this.#getCachedPhoto(query);
    }
  }

  async findPhoto(query) {
    // Crude caching:
    if(this.#rateLimitRemaining < 1) {
      console.warn('no rate limit remaining. return cache photo.');
      return await this.#getCachedPhoto(query);
    } else if(this.#lastApiCallStatus !== 200) {
      console.warn('last call returned error code');
      const lastApiAndCooldown = parseInt(this.#lastApiCallTime + ERROR_COOLDOWN_MS);
      const now = parseInt(Date.now());
      console.dir(`lastApiAndCooldown=${lastApiAndCooldown}, now =${now}`);
      if(lastApiAndCooldown > now) {
        console.warn('waiting to cool down before trying again. return cache photo.');
        return await this.#getCachedPhoto(query);
      } else {
        console.warn('cooldown period elapsed. trying request again');
        return await this.#doFindPhoto(query);
      }
    } else {
      console.log('--- do normal find photo');
     return await this.#doFindPhoto(query);
    }
    return await this.#getCachedPhoto(query);
  }
}


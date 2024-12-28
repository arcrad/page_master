# Page Master 

Want to read a news article or other web page, but your children want you to read them a picture book instead? Have no fear, Page Master is just the thing you need. Give it a URL and it will turn any website into a book where each page has a bit of the content and an image. Now you can read your article and entertain your kids at the same time! 

# How it Works

The process is essentially:

- Fetch webpage from the URL provided
- Extract "main" content from webpage
- Split content into short chunks
- Find a relevant stock image for each chunk
- Put each chunk and image on a page
- Present all the pages as a book that can be flipped through

The implementation of all of this is very much a minimal viable prototype. The content extraction is based on a third party library. The chunking logic is simple and fragile, and the keyword extraction algorithm is hilariously basic. There is a caching layer between the free stock image API just so things can function somewhat reliably when the API inevitably errors out or exceeds the rate limit. 

# A Bit More Detail

If you're interested, the following describes some of the functionality in a bit more detail. 

## Content Extraction

Content extraction is provided by the [@extractus/article-extractor](https://github.com/extractus/article-extractor) third-party library. I have only minimally evaluated it for robustness and safety. It seems to work reliably on CNN and Reuters, and a few other random news sites, but I have not tested it extensively. Definitely saved me a lot of effort, but this is likely a good place to start to improve the overall robustness of this application. 

## Chunking Logic 

The goal is to break down the content into sentences so that just a few can be put onto each page. Currently it is hard-coded to put just two sentences per page. However the logic that breaks down the content into sentences is not much more complicated than splitting on the ". " pattern. 

The current approach uses matchAll() with a regex that tries to break on various typical sentence ending patterns. Things like period+space, quote+period, question-mark+space, etc. We also want to avoid splitting on abbreviations like "Dr." and "Lt." so those are replaced with placeholders prior to splitting and then restored after. That's it. Certainly lots of room for improvement. 

## Keyword Extraction

To lookup stock images, we need to get a handful of keywords to query with. To get keywords the approach is: split the content on spaces, filter out common words (stop words), de-duplicate the list, and then finally sort by word length and pick the top-N words. Obviously the longest words are the most representative of of the core ideas in the content and there are absolutely no better ways to extract key words. Obviously. 

## Stock Images 

The stock images are from the free [Pexels](https://www.pexels.com/) API. Pretty cool service but would be nicer if queries could involve some filters like style/type of image, images with space for copy, and if images provided focal-point metadata. Perhaps a good idea for a future project.

## Stock Image Caching 

I noticed that occasionally during testing the Pexels API would return 429s if I made too many requests in short succession even if I wasnt over the monthly rate limit. I found out later that they have a per hour rate limit as well. If this happened during testing, it would definitely happen if more than a handful of people ever tried to use it at once in Production. So I implemented a caching layer using sqlite to help mitigate this.

Every time a stock image is successfully fetched from Pexels, the image URL returned is saved along with the query terms that found it. If in the future the Pexels API errors out, the cache is queried instead to try to find a suitable image. If no good matches are found, a random image from the cache is returned. 
Over time, the cache will grow and that should improve the chances of a cache hit and a relevant result coming back. But since it will always return something, that means the service will continue to function at the very least.

# Try it Out 

[Page Master](https://page-master.fly.dev) is available for anyone to try out. Be sure to let me know if it breaks in some spectacular fashion.  

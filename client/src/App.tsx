import { useState, useRef } from 'react'

import './App.css'
import { Book, Page } from './Book.tsx';

function App() {
  const [pageData, setPageData] = useState([])
  const [currentPage, setCurrentPage] = useState(0);
  const url = useRef('');
 
  async function getPageData() {
    const encoded_url = encodeURIComponent(url.current.value);
    const get_page_data_url = `/makebook/${encoded_url}`;
    let response = await fetch(get_page_data_url);
    let responseJson = await response.json();
    const pages = responseJson.pages;
    console.dir(pages);
    setPageData(pages);
  }
    
  function prevPage() {
    setCurrentPage((num) => (num - 1 < 0) ? 1 : num-1);
  }

  function nextPage() {
    setCurrentPage((num) => (num + 1 > pageData.length-1) ? pageData.length-1 : num+1);
  }

  const pages = pageData.map( (page, index) => {
    return (
      <Page key={index} number={index}>
        { page.title && <h3>{page.title}</h3>}
        <img src={page.photo_url} style={{'max-width':'100%'}}/>
        <p>{page.text}</p>
      </Page>
    );
  });

  return (
    <>
      <div>
        <h1>Page Master</h1>
        <div>
          <div>
            <input type="text" ref={url}/>
            <button onClick={getPageData}>Fetch</button>
          </div>
          <div>
            <button onClick={prevPage}>Prev</button> 
            <button onClick={nextPage}>Next</button> 
          </div>
          <Book currentPage={currentPage}>
            {pages}
          </Book>
        </div>
      </div>
    </>
  )
}

export default App

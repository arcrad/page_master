import { useState, useRef } from 'react'

import { Book, Page } from './Book.tsx';

const initialBookData = [
  {
    title: 'What is Page Master?',
    content_component: function () { return (
      <div><p>Give Page Master the URL for a news article (or any website) and click the <strong>Book It</strong> button. Page Master will break the article down into pages and find a relevant image for each page. The goal is to make a boring article more interesting so you can read it yourself and to your children at the same time.</p></div>
    )},
    photo_url: 'https://images.pexels.com/photos/7648022/pexels-photo-7648022.jpeg',
    justification_index: 1
  },
  {
    title: 'More Informaton',
    content_component: function () { return (
      <div>
        <p>Made by Jonathan Maiorana</p>
        <p><a href="https://github.com/arcrad/page_master">@arcrad/page_master</a></p>
        <p>Let me know if you find an article that doesn't work or if something else weird happens.</p>
      </div>
    )},
    photo_url: 'https://images.pexels.com/photos/7653099/pexels-photo-7653099.jpeg',
    justification_index: 1

  },
  {
    text: 'Why are you still looking at the instructions? Make a book already!',
    photo_url: 'https://images.pexels.com/photos/15391839/pexels-photo-15391839.jpeg',
    justification_index: 1
  }
];
function App() {
  //const [pageData, setPageData] = useState([])
  const [pageData, setPageData] = useState(initialBookData);
  const [currentPage, setCurrentPage] = useState(0);
  const [topBarVisible, setTopBarVisible] = useState(true);
  const url = useRef('');
 

  async function getPageData() {
    const encoded_url = encodeURIComponent(url.current.value);
    const get_page_data_url = `/makebook/${encoded_url}`;
    let response = await fetch(get_page_data_url);
    let responseJson = await response.json();
    const pages = responseJson.pages;
    const updatedPages = pages.map( (page) => {
      return (
        {
          ...page,
          'justification_index': Math.floor(Math.random()*3)
        }
      )
    });
    console.dir(updatedPages);
    setPageData(updatedPages);
    setTopBarVisible(false);
  }
    
  function firstPage() {
    setCurrentPage(0);
  }

  function prevPage() {
    setCurrentPage((num) => (num - 1 < 0) ? 0 : num-1);
  }

  function nextPage() {
    setCurrentPage((num) => (num + 1 > pageData.length-1) ? pageData.length-1 : num+1);
  }
  
  function toggleTopBar() {
    setTopBarVisible( (s) => !s);
  }


  const pages = pageData.map( (page, index) => {
    return (
      <Page key={index} imageUrl={page.photo_url} number={index} justificationIndex={page.justification_index}>
        { page.title && <h2>{page.title}</h2>}
        { page.text && <p>{page.text}</p> }
        { page.content_component && page.content_component() }
      </Page>
    );
  });

  const topBarClasses = 'topBar' + (topBarVisible ? ' visible' : ' hidden');

  return (
    <>
      <div className="mainContainer">
        <div>
          <Book currentPage={currentPage}>
            {pages}
          </Book>
          { 
            pages.length > 0 && (
              <div className="bookNav">
                <button 
                  onClick={prevPage}
                  disabled={(currentPage === 0)}
                >Previous</button> 
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === (pageData.length-1)}
                >Next</button> 
                <button 
                  onClick={firstPage}
                >↺</button>
              </div>
            )
          }
        </div>
        <div className={topBarClasses}>
          <div className="titleContainer">
            <h1>Page Master</h1>
            <div className="controlsContainer">
              <input type="text" ref={url}/>
              <button onClick={getPageData}>Book It</button>
            </div>
          </div>
          <div className="topBarToggleContainer">
            <button onClick={toggleTopBar}>
              { topBarVisible ? '▲' : '▼' }
            </button>
        </div>
        </div>
      </div>
    </>
  )
}

export default App

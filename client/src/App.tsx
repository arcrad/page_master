import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react';

import { Book, Page } from './Book.tsx';

const initialBookData = [
  {
    title: 'What is Page Master?',
    content_component: function () { return (
      <div><p>Give Page Master the URL for a news article (or any website) and click the <strong>Book It</strong> button. Page Master breaks the article up into pages and finds a picture for each page.</p><p>The goal is to make a boring article more interesting so you can read it yourself and to your children at the same time.</p><p>You can also simplify the content of each page so its easier for a kid to understand it. Enable this with the <strong>Simplify Content</strong> option via the gear icon.</p></div>
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
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [simplify, setSimplify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const url = useRef(null);

  async function getBookData() {
    if(!url.current.value || url.current.value.length < 5) {
      setErrors( (e) => [...e, 'URL is invalid']);
      return;
    }
    let simplifyQueryParam = '';
    if(simplify) {
      simplifyQueryParam = '?simplify=1';
    }
    setLoading(true);
    const encodedUrl = encodeURIComponent(url.current.value);
    const getPageDataUrl = `/makebook/${encodedUrl}${simplifyQueryParam}`;
    let response = null;
    let responseJson = null;
    try {
      response = await fetch(getPageDataUrl);
    } catch (error) {
      setErrors( (e) => [...e, 'API call error']);
      setLoading(false);
      return;
    }
    try {
      responseJson = await response.json();
    } catch(error) {
      setErrors( (e) => [...e, 'Error parsing JSON response']);
      setLoading(false);
      return;
    }
    if(!responseJson) {
      responseJson = {};
      responseJson.error = 'No JSON response recieved';
    }
    if( responseJson?.error ) {
      setErrors( (e) => [...e, responseJson.error]);
      setLoading(false);
      return;
    }
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
    setLoading(false);
    setErrors([]);
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

  function toggleOptionsVisibility() {
    setOptionsVisible( (s) => !s);
  }

  function toggleSimplifyOption(evnet) {
    setSimplify(event.target.checked);
  }

  function closeErrorItem(index) {
    console.log(index);
    setErrors( (e) => {
      const newErrors = e.toSpliced(index, 1);
      return newErrors;
    });
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

  const errorsList = errors.map( (error, index) =>
    <motion.li layout key={index}
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="errorItem"
    >
      <div className="errorItemContent">
        {error}
        <button onClick={() => closeErrorItem(index)}>X</button>
      </div>
    </motion.li>
  );

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
        {
          loading &&
          <div className="loadingIndicator">
            <div className="spinner">
              Loading...
            </div>
          </div>
        }
        <div className={topBarClasses}>
          <div className="topBarContainer">
            <div className="titleContainer">
              <h1>Page Master</h1>
              <button
                className={ "toggleOptionsButton" + (optionsVisible ? ' optionsVisible' : '' )}
                type="button"
                aria-label="Options"
                onClick={toggleOptionsVisibility}
              >
              </button>
            </div>
            <div className="controlsContainer">
              <div className="actions">
                <input type="text" ref={url}/>
                <button onClick={getBookData}>Book It</button>
              </div>
              {
                optionsVisible &&
                <div className="options">
                  <h2>Options</h2>
                  <div className="optionRow">
                    <label for="simplify">Simplify content? </label>
                    <input type="checkbox" name="simplify" id="simplifyCheckbox" onChange={toggleSimplifyOption} checked={simplify}/>
                  </div>
                  <div className="optionDescriptionRow">
                    <p>Rephrases the text on each page so it's easier to understand.</p>
                  </div>
                </div>
              }
            </div>
          </div>
          <div className="topBarToggleContainer">
            <button onClick={toggleTopBar}>
              { topBarVisible ? '▲' : '▼' }
            </button>
        </div>
        </div>
        <ul className="errorsList">
          { errorsList }
        </ul>
      </div>
    </>
  )
}

export default App

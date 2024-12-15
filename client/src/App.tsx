import { useState, useRef } from 'react'

import './App.css'
import { Book, Page } from './Book.tsx';

const staticTestBookData = [
  {
    text: 'Local officials from New Jersey’s Morris and Somerset counties acknowledged the “recurring reports of drone activity” and the public’s concerns in a joint press release Thursday. Officials have directed the public to share tips, sightings and video of potential drone sightings. “The FBI-Newark and the NJ State Police are asking for the public to report any information related to the recent sightings of possible drones. ',
    key_terms: [ 'acknowledged', 'information', '“recurring' ],
    photo_url: 'https://images.pexels.com/photos/7648022/pexels-photo-7648022.jpeg'
  },
  {
    text: 'Anyone with relevant information is asked to call the FBI at 1-800-CALL-FBI (1-800-225-5324) or submit it online at tips.fbi.gov. Citizens can also upload videos through the latter website,” the release said. The chief executive of a company that tracks unauthorized drone flights said they’ve recorded more than a million flight violations, and he believes changes need to be made. ',
    key_terms: [ 'tips fbi gov ', 'unauthorized', 'information' ],
    photo_url: 'https://images.pexels.com/photos/7653099/pexels-photo-7653099.jpeg'
  },
  {
    text: '“The laws that regulate aircraft are not built to empower police to deal with the drones,” Axon CEO Rick Smith told CNN News Central Friday, “so if your local state fair has a drone coming towards it that police believe might be dangerous, right now there’s nothing they can do about it. “It’s good that this is drawing attention to a bigger problem,” Smith said. This story has been updated with additional information. ',
    key_terms: [ 'information ', 'dangerous ', 'additional' ],
    photo_url: 'https://images.pexels.com/photos/15391839/pexels-photo-15391839.jpeg'
  }
];
function App() {
  //const [pageData, setPageData] = useState([])
  const [pageData, setPageData] = useState(staticTestBookData)
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
        { page.title && <h3>{page.title}</h3>}
        <p>{page.text}</p>
      </Page>
    );
  });

  const topBarClasses = 'topBar' + (topBarVisible ? ' visible' : ' hidden');

  return (
    <>
      <div className="mainContainer">
        <div className={topBarClasses}>
          <h1>Page Master</h1>
          <div>
            <input type="text" ref={url}/>
            <button onClick={getPageData}>Book It</button>
          </div>
        </div>
        <div className="topBarToggleContainer">
          <button onClick={toggleTopBar}>
            { topBarVisible ? '^' : 'V' }
          </button>
        </div>
        <div>
          { 
            pages.length > 0 && (
              <div className="bookNav">
                <button onClick={prevPage}>Prev</button> 
                <button onClick={nextPage}>Next</button> 
              </div>
            )
          }
          <Book currentPage={currentPage}>
            {pages}
          </Book>
        </div>
      </div>
    </>
  )
}

export default App

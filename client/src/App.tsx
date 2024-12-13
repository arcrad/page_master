import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [page_data, setPageData] = useState(null)
  const url = useRef('');
 
  async function getPageData() {
    const encoded_url = encodeURIComponent(url.current.value);
    const get_page_data_url = `/makebook/${encoded_url}`;
    let response = await fetch(get_page_data_url);
    console.dir(response);
  }

  return (
    <>
      <div>
        <h1>Page Master</h1>
        <div>
          <input type="text" ref={url}/>
          <button onClick={getPageData}>Fetch</button>
        </div>
      </div>
    </>
  )
}

export default App

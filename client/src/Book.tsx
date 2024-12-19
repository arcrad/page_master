import { useContext } from 'react';
import './Book.css';

import { BookContext } from './BookContextProvider.ts';

export function Book({currentPage, children}) {
  const bookContextValue = {
    currentPage: currentPage,
  };
  return (
    <BookContext.Provider value={bookContextValue}>
    <div className="book">
      BOOK
      {children}
    </div>
    </BookContext.Provider>
  );
}

const JUSTIFICATION = ['flex-start', 'center', 'flex-end'];

export function Page({number, imageUrl, justificationIndex, children}) {
  const bookContext = useContext(BookContext);
  let stateClass = "";
  if(number === bookContext.currentPage) {
    stateClass = " current";
  } else if (number < bookContext.currentPage) {
    stateClass = " past";
  } else if (number > bookContext.currentPage) {
    stateClass = " upcoming";
  }
    
  //<article className={'page' + stateClass} style={{'background': 'url('+imageUrl+');'}}>
  return (
    <article className={'page' + stateClass} style={{'backgroundImage': 'url("'+imageUrl+'"', 'justifyContent': JUSTIFICATION[parseInt(justificationIndex)]}}>
      <div className="contentBox">
        {children}
      </div>
    </article>
  );
}

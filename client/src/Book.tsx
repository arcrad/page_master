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

export function Page({number, children}) {
  const bookContext = useContext(BookContext);
  let stateClass = "";
  if(number === bookContext.currentPage) {
    stateClass = " current";
  } else if (number < bookContext.currentPage) {
    stateClass = " past";
  } else if (number > bookContext.currentPage) {
    stateClass = " upcoming";
  }
    
  return (
    <article className={'page' + stateClass}>
      <p>number={number} currentPage={bookContext.currentPage}</p>
      {children}
    </article>
  );
}

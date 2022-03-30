import React, { useState } from 'react';
import './App.css';
import HomePage from './component/HomePage'
import { useSelector } from 'react-redux'
import MainPage from './component/MainPage';

const routes = {
  Home: {
    component: MainPage,
    path: "/"
  },
  Fight: {
    component: MainPage,
    path: "/fight"
  }
}


function App() {
  const [globalRoute, setGlobalRoute] = useState("/")
  const blockchain = useSelector(state => state.blockchain)

  // eslint-disable-next-line
  let displayComponent = Object.keys(routes).map((key) => {
    if (routes[key].path === globalRoute) {
      return routes[key].component({ setGlobalRoute, blockchain })
    }
  })
  return (
    <main className="main_container">
      <img src={window.origin + '/img/background_full.png'} />
      <div className='component'>
        {displayComponent}
      </div>
    </main>
  );
}

export default App;

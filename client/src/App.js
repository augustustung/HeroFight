import React, { useEffect } from 'react';
import './App.css';
import HomePage from './component/HomePage'
import { useSelector } from 'react-redux'
import MainPage from './component/MainPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import RoomPage from './component/RoomPage';
import FindRoom from './component/FindRoom';
import Layout from './component/Layout';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"

const routes = {
  Home: {
    component: HomePage,
    path: "/",
    isAuth: false
  },
  FindRoom: {
    component: FindRoom,
    path: "/",
    isAuth: false
  },
  WaittingRoom: {
    component: RoomPage,
    path: "/waiting-room",
    isAuth: true
  },
  Fight: {
    component: MainPage,
    path: "/fight",
    isAuth: true
  }
}


function App() {
  const user = useSelector(state => state.user)
  const { isLoggedIn } = user

  useEffect(() => {
    if (window.location.pathname !== '/' && (!user || !isLoggedIn)) {
      window.location.href = '/'
    }
  },[])

  return (
    <main className="main_container">
      <Router>
        <Switch>
          {(!user || !isLoggedIn) ? (
            <Route path="/" exact component={(props) => <Layout {...props} Component={HomePage}  />} />
          ) : (
            <Route path='/' exact component={(props) => <Layout {...user}  {...props} Component={FindRoom} />} />
          )}
          {Object.keys(routes).map((key, index)=>{
            if(isLoggedIn && routes[key].isAuth) {
              return (
                <Route 
                  key={index} extract 
                  path={routes[key].path} 
                  component={routes[key].component} 
                />
              )
            } else if (!routes[key].isAuth) {
              return (
                <Route 
                  path={routes[key].path} key={index} exact 
                  component={(props) => <Layout  {...props} Component={routes[key].component} />} />
              )
            }
          })}
        </Switch>
      </Router>
    </main>
  );
}

export default App;

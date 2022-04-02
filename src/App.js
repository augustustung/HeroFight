import React, { useEffect, useState } from 'react';
import './App.css';
import HomePage from './component/HomePage'
import { useSelector } from 'react-redux'
import MainPage from './component/MainPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import io from 'socket.io-client'
import RoomPage from './component/RoomPage';

const routes = {
  Home: {
    component: HomePage,
    path: "/"
  },
  WaittingRoom: {
    component: RoomPage,
    path: "/waiting_room"
  },
  Fight: {
    component: MainPage,
    path: "/fight"
  }
}


function App() {
  const [client, setClient] = useState()
  const [globalRoute, setGlobalRoute] = useState('/')
  const [currentRoom, setCurrentRoom] = useState({})
  // const blockchain = useSelector(state => state.blockchain)
  const user = useSelector(state => state.user)

  // eslint-disable-next-line
  let DisplayComponent = Object.values(routes).find((value) => {
    return value.path === globalRoute
  })

  function ioConnect(url, option) {
    setClient(io(url, option))
  }

  const handleConnect = () => {
    let url = process.env.REACT_APP_API_URL

    //   if (window.location.protocol !== "https:") {
    //      url = process.env.REACT_APP_API_WS_URL
    //  }

    const options = {
      reconnectionDelayMax: 10000,
      auth: {
        token: process.env.REACT_APP_SECRET_TOKEN
      },
    };

    ioConnect(url, options);
  };

  const handleDisconnect = () => {
    if (client) {
      client.off()
      client.disconnect()
    }
  };



  useEffect(() => {
    if (!client) return;

    client.on('connect', () => {
      console.log('connect successfully')
    });
    client.on('error', (err) => {
      console.error('Connection error: ', err);
    });
    client.on('reconnect', () => {
      console.log('Reconnecting')
    });
    client.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        client.connect();
      }
    });
  }, [client]);

  useEffect(() => {
    handleConnect()
    return () => {
      handleDisconnect()
    }
  }, [])

  return (
    <main className="main_container">
      {/* <button hidden id="home" onClick={() => {
        setGlobalRoute("/")
      }} />
      <button id="fight" onClick={() => {
        setGlobalRoute("/fight")
      }}>clickckckck</button>
      <button id='waittingRoom' onClick={() => {
        setGlobalRoute("/waiting_room")
      }}>clickkkkkkkkkkkk</button> */}
      <DisplayComponent.component
        user={user} setGlobalRoute={setGlobalRoute}
        client={client} setCurrentRoom={setCurrentRoom}
        currentRoom={currentRoom}
      />
    </main>
  );
}

export default App;

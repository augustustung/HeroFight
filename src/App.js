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
  const [currentRoom, setCurrentRoom] = useState({
    roomId: "12312",
    roomName: "asdasd",
    deposit: 123123,
    players: [{
      playerId: 'sadasd',
      username: 'tung',
      walletAddress: '0x123123123123',
      balance: 123123123,
      champion: "samuraiMack",
      status: false,
      isHost: true
    }, {
      playerId: 'sadasd',
      username: 'tung',
      walletAddress: '0x123123123123',
      balance: 123123123,
      champion: "wizard",
      status: true,
      isHost: false
    }]
  })
  // const blockchain = useSelector(state => state.blockchain)
  const user = useSelector(state => state.user)
  const [playerDetail, setPlayerDetail] = useState({
    playerId: 'sadasd',
    username: 'tung',
    walletAddress: '0x123123123123',
    balance: 123123123,
    champion: "hero",
    status: false,
    isHost: false
  })

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
      reconnectionDelayMax: 5000,
      auth: {
        token: process.env.REACT_APP_SECRET_TOKEN
      },
      autoConnect: true,
      timeout: 1000
    };

    ioConnect(url, options);
  };

  const handleDisconnect = () => {
    if (client) {
      client.emit('player_leave_room', {
        roomId: 'asdasd',
        isHost: false,
      }, (res) => {
        console.log(res);
        setClient(null)
      })
      client.off()
      setTimeout(() => {
        client.disconnect()
      }, 1000);
    }
  };

  useEffect(() => {
    window.onbeforeunload = function (e) {
      e = e || window.event;
      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = 'Sure?';
      }

      // For Safari
      return 'Sure?';
    };
  }, [])


  useEffect(() => {
    if (!client) return

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
      console.log('reason', reason);
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
      {/* <button id='waittingRoom' onClick={() => {
        handleDisconnect()
      }}>clickkkkkkkkkkkk</button> */}
      <DisplayComponent.component
        user={user} setGlobalRoute={setGlobalRoute}
        client={client} setCurrentRoom={setCurrentRoom}
        currentRoom={currentRoom}
        playerDetail={playerDetail} setPlayerDetail={setPlayerDetail}
      />
    </main>
  );
}

export default App;

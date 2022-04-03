import { Button } from 'react-bootstrap';
import React, { useEffect } from 'react'
import './room.scss'

function RoomPage({ client, currentRoom, setCurrentRoom, playerDetail, setPlayerDetail, setGlobalRoute }) {
  useEffect(() => {
    if (!client) return

    client.on('player_join', (roomData) => {
      setCurrentRoom(roomData);
    })

    client.on('host_leave_room', () => {
      setCurrentRoom(null)
      setPlayerDetail(null)
      setGlobalRoute("/")
      alert("Host left room")
    })

    client.on("room_has_update", (data) => {
      setCurrentRoom(data)
    })

    client.on("room_start", handleRoomStart)

    return () => {
      client.off('player_join');
      client.off('room_start');
      client.off('host_leave_room');
      client.off('room_has_update');
    }
  }, [client])

  function handleRoomStart(roomIndex) {
    setCurrentRoom((prev) => ({ ...prev, roomIndex }))
    setGlobalRoute('/fight')
  }

  function renderText() {
    if (playerDetail && playerDetail.isHost) {
      return 'Start'
    } else {
      if (
        (currentRoom && currentRoom.players && currentRoom.players[1] && currentRoom.players[1].status) ||
        (playerDetail && playerDetail.status)
      ) {
        return "Unready"
      } else {
        return "Ready"
      }
    }
  }

  function handleLeaveRoom() {
    client.emit('player_leave_room', { roomId: currentRoom.roomId }, (res) => {
      if (res) {
        if (res.errCode === 0) {
          setCurrentRoom(null)
          setGlobalRoute("/")
          setPlayerDetail(null)
        } else {
          console.log("error when leave room", res.errMessage)
        }
      } else {
        console.log('Error when leave room', res.errMessage)
      }
    })
  }

  function handleChangeStatus() {
    if (playerDetail.isHost) {
      if (
        currentRoom.players &&
        currentRoom.players.length > 1 &&
        currentRoom.players[1].status
      ) {
        client.emit('host_start_room', { roomId: currentRoom.roomId }, handleRoomStart);
      }
    } else {
      client.emit("player_change_status", {
        roomId: currentRoom.roomId, newStatus: !playerDetail.status
      }, (res) => {
        if (res) {
          if (res.errCode === 0) {
            setPlayerDetail(prev => ({ ...prev, status: !prev.status }))
          } else {
            console.log('Error when change status', res.errMessage)
          }
        } else {
          console.log('Error when change status', res.errMessage)
        }
      })
    }
  }

  return (
    <div>
      <div className="home_body" style={{ backgroundImage: `url('${window.origin}/img/background_home.png')` }}>
        <div className='home_body__list_bg'>
          <div className='home_body__list_bg_list'>
            <div className='room_list_area'>
              <div style={{ height: 10 }} />
              <div className='room_detail'>
                <div>
                  ID:&nbsp;{currentRoom && currentRoom.roomId ? currentRoom.roomId : ""}
                  <br />
                  Name:&nbsp;{currentRoom && currentRoom.roomName ? currentRoom.roomName : ""}
                </div>
                <span className='ml-auto'>
                  Deposit:<br />
                  <img src={window.origin + '/img/coin.png'} width="30" height="30" />
                  {currentRoom && currentRoom.deposit ? currentRoom.deposit : ""}
                </span>
              </div>
              <div className='in_room_body'>
                <div className='content_left' style={{
                  border: currentRoom && currentRoom.players && currentRoom.players[0] && currentRoom.players[0].status ? '5px solid green' : 'none',
                }}>
                  <div className='text-center'>
                    {
                      currentRoom && currentRoom.players &&
                        currentRoom.players[0] && currentRoom.players[0].playerName ?
                        currentRoom.players[0].playerName : ""
                    }
                  </div>
                  {
                    currentRoom && currentRoom.players &&
                      currentRoom.players[0] && currentRoom.players[0].champion ?
                      <div>
                        <img src={window.origin + '/img/' + currentRoom.players[0].champion + '/waiting.gif'} />
                      </div> :
                      <></>
                  }
                </div>
                <div className="vl" />
                <div className='content_right' style={{
                  border: (
                    (
                      currentRoom && currentRoom.players &&
                      currentRoom.players[1] && currentRoom.players[1].status
                    ) || (
                      playerDetail && playerDetail.status
                    )
                  ) ? '5px solid green' : 'none',
                }}>
                  <div className='text-center'>
                    {
                      currentRoom && currentRoom.players &&
                        currentRoom.players[1] && currentRoom.players[1].playerName ?
                        currentRoom.players[1].playerName : ""
                    }
                  </div>
                  {
                    currentRoom && currentRoom.players &&
                      currentRoom.players[1] && currentRoom.players[1].champion ?
                      <div>
                        <img src={window.origin + '/img/' + currentRoom.players[1].champion + '/waiting.gif'} />
                      </div> :
                      <></>
                  }
                </div>
              </div>
              <div className='footer'>
                <Button className='mr-5' variant="danger" onClick={handleLeaveRoom}>Leave room</Button>
                <Button
                  onClick={handleChangeStatus}
                  variant={
                    (
                      (currentRoom && currentRoom.players && currentRoom.players[1] && currentRoom.players[1].status) ||
                      (playerDetail && playerDetail.status)
                    ) ? "warning" : "primary"}
                >{renderText()}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomPage
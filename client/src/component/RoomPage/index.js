import { Button } from 'react-bootstrap';
import React, { useEffect, useState } from 'react'
import './room.scss'
import { useDispatch, useSelector } from 'react-redux';
import { setData, clearDataAction } from '../../redux/app/appActions'
import { useHistory } from 'react-router-dom';
import { socket } from '../../Socket'

function RoomPage() {
  const app = useSelector(state => state.app)
  const { currentRoom, playerDetail } = app
  const dispatch = useDispatch()
  const history = useHistory()
  const [isFirstTime, setIsFirstTime] = useState(true)

  useEffect(() => {
    if (isFirstTime) {
      socket.emit('load_room', { roomId: currentRoom.roomId })
      setIsFirstTime(false)
    }

    socket.on('player_join', (roomData) => {
      dispatch(setData({
        currentRoom: roomData
      }));
    })

    socket.on('host_leave_room', () => {
      if (currentRoom && currentRoom.players && currentRoom.players.length > 1) {
        alert("Host left room")
        clearData()
      }
    })

    socket.on("room_has_update", (data) => {
      dispatch(setData({
        currentRoom: data
      }))
    })

    socket.on("room_start", handleRoomStart)
  }, [isFirstTime, setIsFirstTime])

  function handleRoomStart(newRoomData) {
    if (!newRoomData) return

    let newData = newRoomData
    newData.players[1].status = false
    dispatch(setData({
      currentRoom: {
        ...newData
      },
      playerDetail: {
        ...playerDetail,
        status: false
      }
    }))
    history.push('/fight')
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

  function clearData() {
    setTimeout(() => {
      dispatch(clearDataAction())
      history.replace("/")
    }, 200)
  }

  function handleLeaveRoom() {
    socket.emit('player_leave_room', { roomId: currentRoom.roomId, isHost: playerDetail.isHost })
    clearData()
  }

  function handleChangeStatus(key, value) {
    socket.emit("player_change_status", {
      roomId: currentRoom.roomId, newStatus: { key: key, value: value },
      currentPlayerIndex: playerDetail.isHost ? 0 : 1
    })
  }

  function handleStart() {
    if (
      currentRoom.players &&
      currentRoom.players.length > 1 &&
      currentRoom.players[1].status
    ) {
      socket.emit('host_start_room', { currentRoom }, handleRoomStart);
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
                    playerDetail.isHost && (
                      <div className='my-3'>
                        <select
                          value={(
                            currentRoom && currentRoom.players &&
                            currentRoom.players[0] &&
                            currentRoom.players[0].champion
                          ) || 'hero'
                          }
                          onChange={(e) => {
                            e.preventDefault();
                            let newData = currentRoom
                            newData.players[0].champion = e.target.value
                            dispatch(setData({
                              currentRoom: newData
                            }))
                            handleChangeStatus('champion', e.target.value)
                          }}>
                          <option value={"hero"}>Hero</option>
                          <option value={"samuraiMack"}>Samurai Mack</option>
                          <option value={'warrior'}>Warrior</option>
                          <option value={'wizard'}>Wizard</option>
                        </select>
                      </div>
                    )
                  }
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
                    !playerDetail.isHost && (
                      <div className='my-3'>
                        <select
                          value={(
                            currentRoom && currentRoom.players &&
                            currentRoom.players[1] &&
                            currentRoom.players[1].champion
                          ) || 'hero'
                          }
                          onChange={(e) => {
                            e.preventDefault();
                            let newData = currentRoom
                            newData.players[1].champion = e.target.value
                            dispatch(setData({
                              currentRoom: newData
                            }))
                            handleChangeStatus('champion', e.target.value)
                          }}>
                          <option value={"hero"}>Hero</option>
                          <option value={"samuraiMack"}>Samurai Mack</option>
                          <option value={'warrior'}>Warrior</option>
                          <option value={'wizard'}>Wizard</option>
                        </select>
                      </div>
                    )
                  }
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
                  onClick={() => {
                    if (playerDetail.isHost) {
                      handleStart()
                    } else {
                      dispatch(setData({
                        playerDetail: {
                          ...playerDetail,
                          status: !playerDetail.status
                        }
                      }))
                      handleChangeStatus('status', !playerDetail.status)
                    }
                  }}
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
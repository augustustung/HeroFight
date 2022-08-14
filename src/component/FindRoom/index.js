import React, { useEffect, useState } from 'react'
import { Form, Modal, Button } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import { setData } from '../../redux/app/appActions'

function FindRoom(props) {
  const [show, setShow] = useState(false)
  const [client, setClient] = useState()
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [roomList, setRoomList] = useState([])
  const { data } = props
  const dispatch = useDispatch()

  function ioConnect(url, option) {
    setClient(io(url, option))
  }

  const handleConnect = () => {
    let url = process.env.REACT_APP_API_URL

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
        setClient(null)
      })
      client.emit('disconnect')
      client.close()
      client.disconnect()
    }
  };

  useEffect(() => {
    if (!client) return;

    let isMounted = false;
    if (isMounted) return;


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
    return () => {
      isMounted = false;
    }
  }, [client]);

  useEffect(() => {
    let isMounted = false;
    if (isMounted) return;

    handleConnect()
    return () => {
      handleDisconnect()
      isMounted = true;
    }
  }, [])


  function getListRoom() {
    client.emit('get_list_room', (payload) => {
      if (payload) {
        setRoomList(Object.values(payload))
      } else {
        roomList.length > 0 && setRoomList([])
      }
    })
  }

  useEffect(() => {
    if (!client) return

    if (isFirstTime) {
      getListRoom()
      setIsFirstTime(false)
    }

    client.on('new_room_created', (newRoom) => {
      setRoomList(prev => {
        let newData = [
          newRoom,
          ...prev
        ]
        if (newData.length > 9) {
          newData.pop()
        }

        return newData
      })
    })

    client.on('room_update', (roomData) => {
      setRoomList(prev => {
        let index = prev.findIndex(item => roomData.roomId === item.roomId);
        let newData = prev
        if (index >= 0) {
          newData[index] = roomData
        }
        return newData
      })
    })

    client.on('room_delete', (roomData) => {
      if (roomData) {
        setRoomList(prev => {
          let index = prev.findIndex(item => roomData.roomId === item.roomId);
          let newData = prev
          if (index >= 0) {
            newData.splice(index, 1);
          }
          return newData
        })
      }
    })

    return () => {
      client.off('new_room_created')
      client.off('room_update')
      client.off('room_delete')
    }
  }, [client, isFirstTime, setIsFirstTime])

  function renderRoomId(roomId) {
    if (!roomId) return ''
    let length = roomId.length
    return roomId.slice(0, 4) + '...' + roomId.slice(length - 4, length)
  }

  const onCreateRoom = (e) => {
    e.preventDefault();
    client.emit('create_room', {
      roomName: e.target.roomName.value,
      player: data,
      deposit: parseInt(e.target.deposit.value)
    }, (res) => {
      if (res) {
        props.history.push('/waiting-room')
        dispatch(setData({
          currentRoom: res.data,
          playerDetail: res.data.players[0]
        }))
      } else {
        alert('error when creating room')
        console.log(res.errMessage)
        getListRoom()
      }
    });
  }

  function joinRoom(roomData) {
    client.emit('join_room', { roomId: roomData.roomId, player: data }, (res) => {
      if (res) {
        if (res.errCode === 0) {
          dispatch(setData({
            currentRoom: res.data,
            playerDetail: res.data.players[1]
          }))
          props.history.push('/waiting-room')
        } else {
          alert(res.errMessage)
          getListRoom()
        }
      } else {
        alert("Error when join room")
      }
    });
  }

  return (
    <>
      <div className='room_list_area'>
        <div className='body'>
          <ul>
            {
              roomList && roomList.length > 0 && roomList.map((item, index) => {
                if (!item) return <></>

                return (
                  <li
                    onClick={(e) => {
                      e.preventDefault();
                      if (e.detail === 2) {
                        joinRoom(item)
                      }
                    }}
                    key={index}
                  >
                    <div>ID: {renderRoomId(item.roomId)}</div>
                    <div>{item.roomName || ""}</div>
                    <div>
                      <img src={window.origin + '/img/coin.png'} width="30" height="30" className="d-inline-block align-top" alt="" />
                      <span>{item.deposit || ""}</span>
                    </div>
                    <div>{item.players ? item.players.length : ""}/2&nbsp;</div>
                    <div>{item.isStart ? "Playing" : "Waiting"}</div>
                  </li>
                )
              })
            }
          </ul>
        </div>
        <div className='w-100 text-center m-3 gap'>
          <Button variant="light" className='mr-3'>&#8592;</Button>
          <Button variant="light">&#8594;</Button>
        </div>
        <div className='footer'>
          <Button className='mr-5' variant="light" onClick={() => {
            getListRoom()
          }}>Refresh data</Button>
          <Button onClick={() => {
            setShow(true)
          }}>Create room</Button>
        </div>
      </div>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>CREATE ROOM</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={onCreateRoom}>
              <Form.Group className="mb-3" controlId="roomName">
                <Form.Label>Room's name</Form.Label>
                <Form.Control required type="text" placeholder="Enter name" autoFocus />
              </Form.Group>
              <Form.Group className="mb-3" controlId="deposit">
                <Form.Label>Deposit</Form.Label>
                <Form.Control required type="number" min={10} placeholder="Deposit" />
              </Form.Group>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                <Button variant="primary" type="submit">Create</Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal>
    </>
  )
}

export default FindRoom
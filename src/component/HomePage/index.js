import { Button, Modal, Form } from 'react-bootstrap'
import React, { useEffect, useState } from 'react'
import './home.scss'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/user/userActions'

function HomePage({ user, client, setGlobalRoute, setCurrentRoom, setPlayerDetail }) {
  const dispatch = useDispatch()
  const [show, setShow] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [roomList, setRoomList] = useState([])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  function handleLogin() {
    dispatch(login({
      userId: 1,
      username: 'tung',
      balance: 1000,
      address: '',
      champion: 'hero'
    }))
  }

  function getListRoom() {
    client.emit('get_list_room', (payload) => {
      if (payload.length > 0) {
        setRoomList(payload)
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
      setRoomList(prev => {
        let index = prev.findIndex(item => roomData.roomId === item.roomId);
        let newData = prev
        if (index >= 0) {
          newData.splice(index, 1);
        }
        return newData
      })
    })

    return () => {
      client.off('new_room_created')
      client.off('room_update')
      client.off('room_delete')
    }
  }, [client, isFirstTime, setIsFirstTime])

  const beforeComponent = (
    <div className='container'>
      <div className="row justify-content-center justify-content-lg-around align-items-center mb-5 w-100">
        <div className="col-md-12 col-lg-1 text-center text-md-center">
          <img
            src={window.origin + '/img/hero.png'} alt="layer"
            className="layer h-auto"
          />
        </div>
        <div className="col-lg-3 col-md-12 position-relative py-2 py-lg-0">
          <h4 className="text-white fw-bolder text-center text-uppercase mt-lg-0 mt-md-1 hero_sold">HERO SOLD</h4>
          <div className="text-center">
            <img
              src={window.origin + '/img/short_bar.png'} alt="layer"
              className="w-100 bar img-short"
            />
            <div className="position-absolute text-center quantity">47945000</div>
          </div>
        </div>
        <div className="col-12 col-lg-6 col-md-10 textInput position-relative" style={{ marginBottom: 10, cursor: 'pointer' }}>
          <div className="position-relative">
            <img src={window.origin + '/img/bar.png'} alt="input" className="input_long w-100 h-auto position-absolute" />
          </div>
          <div className="position-absolute text-center hero_address w-100" onClick={() => window.open('https://testnet.bscscan.com/address/' + process.env.REACT_APP_HERO_ADDRESS)}>{process.env.REACT_APP_HERO_ADDRESS}</div>
          <span className="cursor-pointer" onClick={() => copyToClipboard(process.env.REACT_APP_HERO_ADDRESS)}>
            <img src={window.origin + '/img/copy.png'} alt="button" className="position-absolute button_copy" />
          </span>
        </div>
      </div>

      <div className="row justify-content-around mt-5">
        <div className="col-9 col-md-5">
          <div className="detail-hero position-relative mb-3">
            <img src={window.origin + '/img/outstanding.png'} alt="" className="w-100" />
            <h2 className="text-white fw-bolder text-center position-absolute text w-100 bottom-0 h5">MANAGE HEROS</h2>
          </div>
          <div className="text-white fw-550 detail px-0 px-md-4 h6">Users can acquire new heroes via rescue missions. In some maps, there is a rare chance users meet a prison block which locked a bomber hero. After accomplishing the rescue mission, you will receive a damaged hero, which needs to be recovered a while before it can go wild again.</div>
        </div>

        <div className="col-9 col-md-5">
          <div className="detail-hero position-relative mb-3">
            <img src={window.origin + '/img/outstanding.png'} alt="" className="w-100" />
            <h2 className="text-white fw-bolder text-center position-absolute text w-100 bottom-0 h5">ARENA BATTLE</h2>
          </div>
          <div className="text-white fw-550 detail px-0 px-md-4 h6">Players choose a hero to join a bomb battle with many other players. Users have to pay a certain amount of tokens to participate in battle mode, the final winner will receive the entire loser’s token amount. Bomber Hero will also lose a certain amount of energy when participating in battle mode.</div>
        </div>
      </div>
    </div>
  )

  function renderRoomId(roomId) {
    if (!roomId) return ''
    let length = roomId.length
    return roomId.slice(0, 4) + '...' + roomId.slice(length - 4, length)
  }

  const afterComponent = (
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
  )

  const onCreateRoom = (e) => {
    e.preventDefault();
    client.emit('create_room', {
      roomName: e.target.roomName.value,
      player: user.data,
      deposit: parseInt(e.target.deposit.value)
    }, (res) => {
      if (res) {
        if (res.errCode === 0) {
          setGlobalRoute("/waiting_room")
          setCurrentRoom(res.data)
          setPlayerDetail(res.data.players[0])
        } else {
          alert('error when creating room')
          console.log(res.errMessage)
          getListRoom()
        }
      } else {
        alert('error when creating room')
      }
    });
  }

  function joinRoom(data) {
    client.emit('join_room', { roomId: data.roomId, player: user.data }, (res) => {
      if (res) {
        if (res.errCode === 0) {
          setCurrentRoom(res.data)
          setPlayerDetail(res.data.players[1])
          setGlobalRoute("/waiting_room")
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
    <div>
      <nav className="navbar navbar-dark bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://github.com/augustustung"
          target="_blank"
          rel="noopener noreferrer"
        >Mortal War</a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            {
              user && user.isLoggedIn ? (
                <>
                  <img src={window.origin + '/img/coin.png'} width="30" height="30" className="d-inline-block align-top" alt="" />
                  <small className="user_balance">
                    {user && user.data && user.data.balance ? user.data.balance : '0'}
                  </small>
                </>
              ) : (
                <button className='button_collect_wallet' onClick={handleLogin}>
                  <img src={window.origin + '/img/login.webp'} />
                  <span>Login</span>
                </button>
              )
            }
          </li>
        </ul>
      </nav>
      <div className="home_body" style={{ backgroundImage: `url('${window.origin}/img/background_home.png')` }}>
        <div className='home_body__list_bg'>
          <div className='home_body__list_bg_list'>
            {
              user && user.isLoggedIn ? (
                afterComponent
              ) : (
                beforeComponent
              )
            }
          </div>
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
                <Form.Control required type="text" placeholder="Enter name" />
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
    </div>
  )
}

export default HomePage
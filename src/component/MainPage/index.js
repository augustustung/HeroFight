import React, { useEffect, useRef, useState } from 'react'
import "./main_page.scss"
import Sprite from '../../oop/Sprite';
import Fighter from '../../oop/Fighter';
import gsap from 'gsap';

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: window.origin + "/img/background.png"
})


const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: window.origin + "/img/shop.png",
  scale: 2.75,
  framesMax: 6
})

let timerId
let count = 4

let player
let enemy

function MainPage({ client, currentRoom, setGlobalRoute, playerDetail }) {
  const canvasRef = useRef()
  const timerRef = useRef()
  const countDownRef = useRef()
  const [isStart, setIsStart] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(true)

  function handleCountdown() {
    if (countDownRef.current) {
      setTimeout(() => {
        if (count > 0) {
          timerId = setTimeout(handleCountdown, 500)
          count--
          countDownRef.current.innerHTML = count
        }
        if (count === 0) {
          clearTimeout(timerId)
          countDownRef.current.innerHTML = 'FIGHT!'
          setTimeout(() => {
            countDownRef.current.innerHTML = ''
            setIsStart(true)
          }, 500)
        }
      }, 500);
    }
  }

  async function handleStartGame() {
    if (!isStart && !isDone) {
      timerId = setTimeout(handleCountdown, 500)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('keydown', onKeyDown)
      // get detail champ
      client.emit('fight!', {
        roomIndex: currentRoom.roomIndex,
        isHost: playerDetail.isHost,
        champ: new Fighter(require(`../../oop/champ/${playerDetail.isHost ? currentRoom.players[0].champion : currentRoom.players[1].champion}${playerDetail.isHost ? ".json" : "Enemy.json"}`))
      })
    }
  }

  function setStateFighter({ playerData, enemyData }) {
    if (playerData) {
      player = playerData
    }
    if (enemyData) {
      enemy = enemyData
    }
  }

  function handleEmitAction(payload) {
    if (!isDone && isStart) {
      client.emit('player_do_action', {
        roomIndex: currentRoom.roomIndex,
        key: payload
      }, setStateFighter)
    }
  }

  useEffect(() => {
    if (!client) return

    client.on('start_game', handleStartGame)

    if (isFirstTime) {
      client.emit('player_load_completely', {
        roomIndex: currentRoom.roomIndex
      }, (res) => {
        if (res) {
          if (res.errCode === 0) {
            handleStartGame()
          } else {
            console.log(res.errMessage)
          }
        } else {
          console.log('error when play', res.errMessage)
        }
      })
      setIsFirstTime(false)
    }

    client.on('receive_action', setStateFighter)

    client.on('game_over', ({
      result,
      winner
    }) => {
      timerRef.current.innerHTML = 0
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('keydown', onKeyDown)
      document.querySelector('#displayText').style.display = 'flex'
      document.querySelector('#displayText').innerHTML = result
      setIsDone(true)
      // transfer to winner ....
    })

    client.on('battle_update', (res) => {
      timerRef.current.innerHTML = res
    })

    // if (canvasRef && canvasRef.current) {
    //   animate()
    // }
  }, [client, isFirstTime, setIsFirstTime])

  async function animate() {
    const c = await canvasRef.current.getContext('2d')
    c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    const canvas = canvasRef.current
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update(c)
    shop.update(c)
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
  }

  function onKeyUp(event) {
    handleEmitAction({
      roomIndex: currentRoom.roomIndex,
      key: event.key,
      type: "DOWN",
      isHost: playerDetail.isHost
    })
  }

  function onKeyDown(event) {
    handleEmitAction({
      roomIndex: currentRoom.roomIndex,
      key: event.key,
      type: "Down",
      isHost: playerDetail.isHost
    })
  }

  return (
    <>
      <img src={window.origin + '/img/background_full.png'} />
      <div className='main_page_container'>
        <div className='fight_screen' style={{
          backgroundImage: `url(${window.origin + "/img/outline.png"}`
        }}>
          <div className='outline'>
            <div className='health'>
              <div className='lose_health'></div>
              <div id="playerHealth"></div>
            </div>

            <div ref={timerRef} id="timer">10</div>
            <div className='health'>
              <div className='lose_health'></div>
              <div id="enemyHealth"></div>
            </div>
            <div></div>
          </div>
          <div id="displayText">Tie</div>
          <div
            id="startGame"
            onClick={(e) => {
              e.preventDefault()
              if (isDone)
                setGlobalRoute('/waiting_room')
            }}
            style={{
              display: (!isDone && isStart) ? 'none' : 'block',
              marginTop: (!isDone && isStart) ? 'auto' : '30%'
            }}
          >
            <div>
              <img width="270" height="110" src={window.origin + "/img/fight.png"} />
              <p className='h5'>{isDone ? "Back to room" : "Wait for enemy"}</p>
            </div>
          </div>
          <canvas width={1024} height={576} ref={canvasRef}></canvas>
        </div>
      </div>
      <div ref={countDownRef} className="timeStart" />
    </>
  )
}

export default MainPage
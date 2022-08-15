import React from 'react'
import './home.scss'

function HomePage() {
  return (
    <>
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
          <span className="cursor-pointer" onClick={() => navigator.clipboard.writeText(process.env.REACT_APP_HERO_ADDRESS)}>
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
    </>
  )
}

export default HomePage
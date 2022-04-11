import React from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/user/userActions'

function Layout(props) {
  const { isLoggedIn, data } = props
  const dispatch = useDispatch()
  function handleLogin(e) {
    e.preventDefault();
    dispatch(login({
      userId: 1,
      username: 'tung',
      balance: 1000,
      address: '',
      champion: 'hero'
    }))
  }

  return (
    <>
    <nav className="navbar navbar-dark bg-dark flex-md-nowrap p-0 shadow">
      <a
        className="navbar-brand col-sm-3 col-md-2 mr-0"
        href="http://github.com/augustustung"
        target="_blank"
        rel="noopener noreferrer"
      >Hero Fight</a>
      <ul className="navbar-nav px-3">
        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          {
            isLoggedIn ? (
              <>
                <img src={window.origin + '/img/coin.png'} width="30" height="30" className="d-inline-block align-top" alt="" />
                <small className="user_balance">
                  {data && data.balance ? data.balance : '0'}
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
          <props.Component {...props}/>
        </div>
      </div>
    </div>
  </>
  )
}

export default Layout
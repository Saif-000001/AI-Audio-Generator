import React, { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AuthContext } from '../../Providers/AuthProviders'


function Header() {
    const {user, logOut} = useContext(AuthContext)
    const handleSignOut = () =>{
        logOut()
        .then()
        .catch()
      }
    
    const navLink = <>
        <li ><NavLink className=" btn bg-primary mr-6" to = "/" >Home</NavLink></li>
        <li><NavLink className="btn bg-primary mr " to = "/dashboard" >Dashboard</NavLink></li>
    </>
  return (
    <div className="navbar bg-base-100">
        <div className="navbar-start">
            <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
            </div>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content ">
                {
                    navLink
                }
            </ul>
            </div>
            <a className="btn btn-ghost text-xl">AI Audio Generator</a>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal ">
                {
                    navLink
                }
            </ul>
        </div>
        <div className="navbar-end">
        {
          user ? <button onClick={handleSignOut} className="btn">Sign Out</button> 
          : <Link to='/login'><button className="btn">Login</button></Link>
        }
        </div>
    </div>
  )
}

export default Header

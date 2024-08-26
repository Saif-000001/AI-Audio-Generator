import React, { useContext, useRef, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Providers/AuthProviders'
import { FcGoogle } from "react-icons/fc";


function Login() {
    const {signIn, signInWithGoogle} =useContext(AuthContext)
    const [showPassword, setShowPassword] = useState(false);

    const location = useLocation()
    const navigate = useNavigate()
    console.log(('user in the location', location))

    const handleLogin = e =>{
        e.preventDefault()
        console.log(e.currentTarget)

      const form = new FormData(e.currentTarget);
      const email = form.get('email')
      const password = form.get('password')

      console.log(email, password);

      signIn(email, password)
      .then(res =>{
        console.log(res.user)
        navigate(location?.state?location.state:'/')
      })
      .catch(error => console.error(error))
    }

    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then(result => {
                console.log(result.user)
            })
            .catch(error => {
                console.error(error)
            })
    }




  return (
    <div>
        <h1 className="text-3xl text-center my-10">Please Login</h1>
       <form onSubmit={handleLogin} className="lg:w-1/2 md:w-3/4 mx-auto">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input type="email" name='email' placeholder="email" className="input input-bordered" required />
        </div>
        <div className="form-control">
      <label className="label">
        <span className="label-text">Password</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name='password'
          placeholder="password"
          className="input input-bordered w-full pr-10" 
          required
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
        </div>
        <div className="form-control mt-6">
          <button className="btn btn-success text-white text-xl">Login</button>
        </div>
      </form>
      <div className="text-center mt-7">
      <button onClick={handleGoogleSignIn} className="btn btn-primary">
      <FcGoogle className='text-2xl'/>
        Google</button>
      </div>
      <p className='text-center mt-5'>Don't have account <Link to="/register" className='text-secondary font-bold'>Register</Link> </p>
    </div>
  )
}

export default Login

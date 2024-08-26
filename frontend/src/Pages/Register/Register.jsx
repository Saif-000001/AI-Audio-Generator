import React, { useContext, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../Providers/AuthProviders';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const { createUser } = useContext(AuthContext);
  const [registerError, setRegisterError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log(e.currentTarget);

    const form = new FormData(e.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const password = form.get('password');

    setRegisterError('');

    if (password.length < 6) {
      setRegisterError('Password should be at least 6 characters or longer');
      return;
    } else if (!/[A-Z]/.test(password)) {
      setRegisterError('Your password should have at least one upper case character.');
      return;
    }

    console.log(name, email, password);

    try {
      const res = await createUser(email, password);
      console.log(res.user);
      toast.success("Registration Complete!"); 
    } catch (error) {
      console.error(error);
      toast.error("Registration Failed!"); 
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl text-center my-10">Please Register</h1>
      <div>
        <form onSubmit={handleRegister} className="lg:w-1/2 md:w-3/4 mx-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input type="text" name='name' placeholder="Name" className="input input-bordered" required />
          </div>
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
            <button type="submit" className="btn btn-success text-white text-xl">Register</button>
          </div>
        </form>
        <ToastContainer />
        {
          registerError && <p className="text-red-700">{registerError}</p>
        }
        <p className='text-center mt-5'>Already have an account <Link to="/login" className='text-secondary font-bold'>Login</Link></p>
      </div>
    </div>
  );
}

export default Register;

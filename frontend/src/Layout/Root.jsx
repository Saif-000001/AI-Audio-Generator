import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Pages/Header/Header'

function Root() {
  return (
    <div className='max-w-6xl mx-auto font-display space-y-12'>
      <Header />
      <Outlet />

    </div>
  )
}

export default Root

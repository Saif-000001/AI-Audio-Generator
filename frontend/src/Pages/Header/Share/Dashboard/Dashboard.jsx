import React from 'react'
import { useLoaderData } from 'react-router-dom'
import Store from './Store'

function Dashboard() {
  const storeData = useLoaderData()
  console.log(storeData.data)
  return (
    <div className="">
      {
        storeData.data.map(data => <Store key={data.id} data={data}/>)
      }
    </div>

  )
}

export default Dashboard

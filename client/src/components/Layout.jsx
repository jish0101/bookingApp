import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './index'

export default function Layout() {
  return (
    <div className='py-4 px-7 flex flex-col min-h-screen'>
          <Header />
          <Outlet />
    </div>
  )
}

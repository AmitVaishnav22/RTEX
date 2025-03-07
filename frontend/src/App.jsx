import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {Outlet} from 'react-router-dom'
import './App.css'
import LoginButton from './components/login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main className='text-center flex-grow h-full'>
          <Outlet />
        </main>
    </>
  )
}

export default App

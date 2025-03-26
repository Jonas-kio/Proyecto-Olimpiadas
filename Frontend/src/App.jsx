import React from "react";
import { Routes, Route } from "react-router-dom";
//import { useState } from 'react'//default
//import reactLogo from './assets/react.svg'//default
//import viteLogo from '/vite.svg'//default
import './App.css'
import AppRouter from "./routes/AppRouter";//Para las rutas
import Sidebar from "./components/Sidebar";//Esto debe ser modificado
//import Configuracion from "./pages/Configuracion";//Esto igual




const App = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content">
        <AppRouter />
      </div>
    </div>
  );

//Lo de abajo es lo creado por default
 /* const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )*/
}

export default App

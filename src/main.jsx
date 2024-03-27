import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { DisplayList, DisplayMovie} from './App.jsx'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom"
import './index.css'
import ErrorPage from './ErrorPage.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route  path="/"
            element={<App />}
    >
      <Route path="/movies/:movieId"
             element={<DisplayMovie />}
             errorElement={<ErrorPage />}
      />
      <Route path="/"
             element={<DisplayList />}
      />
    </Route>
  )
)


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

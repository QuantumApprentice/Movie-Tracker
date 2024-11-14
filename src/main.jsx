import React from 'react'
import ReactDOM from 'react-dom/client'
import App, {Sidebar, DisplayList, DisplayMoviePage} from './App.jsx'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom"
import ErrorPage from './ErrorPage.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    // <Route  path="/Movie-Tracker/"
    //         element={<App />}
    //         errorElement={<ErrorPage />}
    // >
    <Route  element={<Sidebar />}
            errorElement={<ErrorPage />}>

      <Route errorElement={<ErrorPage />}>
        <Route path="/Movie-Tracker/movies/:movieId"
              element={<DisplayMoviePage />}/>
        <Route path="/Movie-Tracker/"
              element={<DisplayList />}/>
      </Route>

    </Route>
    // </Route>
  )
)


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

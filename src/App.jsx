import { useEffect, useState } from 'react'
import './App.css'
import movieJson from './movieList.json'
import tmdbList from './tmdbList.json'
import { Link, Outlet, useParams } from 'react-router-dom';


export default function App()
{
  let movie_map = new Map();
  for (const m of movieJson) {
    movie_map.set(m.id, m);
  }

  return (
    <Outlet />
  )
}

export function DisplayList()
{
  let movieList = movieJson;
  // console.log(movieList);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th className='title'>Title</th>
            <th>(Release Year)</th>
            <th>[Runtime]</th>
          </tr>
        </thead>
        <tbody>
          {movieList.map((movie, idx)=>(
            <tr key={idx}>
              <td className='title'>
                <Link to={`/movies/${movie.id}`}>
                  {movie.title}</Link>
              </td>
              <td>({movie.year})</td>
              <td>[{movie.runtime}]</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

// // we don't want to remove the # if it's the only item in parts as the entire
// // page will reload if the string we pass to window.location.replace is empty
// if (parts.length > 1) parts = parts.slice(0, -1);
// global_hash = parts.join('');
// if (global_hash == '#' && !window.location.hash) {
//   global_hash = '';
// } else {
//   window.location.replace(global_hash);
// }

export function DisplayMovie()
{
  // const [info, setInfo] = useState(null);

  let {movieId} = useParams();
  let currentMovie = movieJson.find(m=>m.id === movieId)
  let currentDB = tmdbList?.find(m=>(m.id === currentMovie.dbid));
  // console.log(currentDB);

  return (
    <>
      <div className='display-movie'
          style={{"--data-backdrop-url": `url("https://image.tmdb.org/t/p/w1280/${currentDB?.backdrop_path}")`}}>
        <MovieTitle movie={currentMovie} />
        <div className="info">
          {!!currentMovie.links && 
          <Trailer movie={currentMovie}  />}
          <Credits movie={currentMovie} tmdb={currentDB}  />
        </div>
      </div>
    </>
  )
}

function MovieTitle({movie})
{
  const [count, setCount] = useState(0);

  return (
    <>
    <div>
      <h1>{movie.title}</h1>
      <h2>({movie.year})</h2>
      <h2>{movie.runtime}</h2>
    </div>
    <div className="vote">
      <button onClick={() => setCount((count) => count + 1)}>
        Vote for this movie! {count}
      </button>
    </div>
    </>
  )
}

function Trailer({movie})
{
  // console.log("movie: ", movie);

  return (
    <div className="trailer-container">
      {Object.entries(movie.links).map((type_arr)=>{
        let link_type = type_arr[0];
        let link_urls = type_arr[1];
        return (
          <YTlink key={link_type} type={link_type} url={link_urls} />
        )
      })}
    </div>
  )
}

function YTlink({type, url})
{
  return (
    <div>
    <h1>{type}</h1>
    {   !!url &&
        url.map((tra)=>{
          let idx = tra.lastIndexOf('/');
          let name = tra.slice(idx+1);
          return (
            <iframe width="560" height="315"
              key={name}
              src={`http://www.youtube.com/embed/${name}`}
              title="YouTube video player"
              allowFullScreen>
            </iframe>
        )}
      )
    }
  </div>
  )
}


function Credits({movie, tmdb})
{

  return (
    <div className="credits">
      <h1>Last Watched: </h1>
      <h2>{movie.watchdate}</h2>
      <h3>{tmdb?.overview}</h3>
      <img src={`https://image.tmdb.org/t/p/w300/${tmdb?.poster_path}`} />
    </div>
  )
}




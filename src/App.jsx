import { useEffect, useState } from 'react'
import './App.css'
import movieJson from './movieList.json'
import tmdbList from './tmdbList.json'
import { Link, Outlet, useParams } from 'react-router-dom';

const token = import.meta.env.VITE_TMDB_TOKEN;

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

/**displays list of movies to click on */
export function DisplayList()
{
  let movieList = movieJson;
  // console.log(movieList);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th className='movie-title-list'>Title</th>
            <th>(Release Year)</th>
            <th>[Runtime]</th>
          </tr>
        </thead>
        <tbody>
          {movieList.map((movie, idx)=>(
            <tr key={idx}>
              <td className='movie-title-list'>
                <Link to={`/movies/${movie.id}`}>
                  {movie.title}</Link>
              </td>
              <td>({movie.year || tmdbList.find(m=>m.id===movie.dbid).release_date.slice(0,4)})</td>
              <td>[{movie.runtime || tmdbList.find(m=>m.id===movie.dbid).runtime}]</td>
              <td>({movie.watchdate || (movie.watched ? "watched": "")})</td>
              <td>
                {/* {<Trailer movie={movie} css={"movie-trailer-list"} />} */}
              </td>
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
  let currentDB    = tmdbList?.find(m=>m.id === currentMovie.dbid);
  // console.log(currentDB);

  return (
    <>
      <div className='movie-display'
          style={{"--data-backdrop-url": `url("https://image.tmdb.org/t/p/w1280/${currentDB?.backdrop_path}")`}}>
        <MovieTitle movie={currentMovie} tmdb={currentDB} />
        <div className="movie-info">
          {!!currentMovie.links && 
          <Trailer movie={currentMovie} css={"movie-trailer"} />}
          <Credits movie={currentMovie} tmdb={currentDB}  />
        </div>
      </div>
    </>
  )
}

//temporary function to get the details of one item
//used to test tmdb access without doing a complete pull
async function get_details(id)
{
  console.log("dbid: ", id);
  const get_options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
  let url = new URL(`https://api.themoviedb.org/3/movie/${id}`);
  // url.search = new URLSearchParams(searchParams);
  try {
    let movie_details = await fetch(url.toString(), get_options);
    let movie_details_json = await movie_details.json();
    return movie_details_json;

  } catch (error) {
    console.log(error);
  }
}

function MovieTitle({movie, tmdb})
{
  const [count, setCount] = useState(0);

  // get_details(movie.dbid).then(d=>console.log(d));

  return (
    <div className='movie-title-disp'>
      <div className='title'>
        <div>
          <h1>{movie.title}</h1>
          <h2>({movie.year ||
            tmdb.release_date.slice(0,4)}
          )</h2>
          <h2>{movie.runtime || 
            tmdb.runtime
          }</h2>
        </div>
      </div>

      <div className="vote">
        <button onClick={() => setCount((count) => count + 1)}>
          Vote for this movie! {count}
        </button>
        <h3>Last Watched: </h3>
        <h2>{movie.watchdate}</h2>
      </div>
    </div>
  )
}

function Trailer({movie, css})
{
  // console.log("movie: ", movie);

  return (
    <div className={`${css}`}>
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
            <iframe
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
    <div className="movie-credits">
        <h2 className='tagline'>{tmdb?.tagline}</h2>
      <h3>
        <img style={{float:'right'}} src={`https://image.tmdb.org/t/p/w300/${tmdb?.poster_path}`} />
        {tmdb?.overview}
      </h3>
    </div>
  )
}




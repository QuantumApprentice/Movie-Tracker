import { useEffect, useState } from 'react'
import './App.css'
import movieJson from './movieList.json'
import tmdbList from './tmdbList.json'
import { Link, Outlet, useParams } from 'react-router-dom';
import { element } from 'prop-types';

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
  // let movieList = movieJson;
  let movieList = movieJson.sort((a,b)=>{

      if (a.watchdate_arr && b.watchdate_arr) {
        if (a.watchdate_arr[0] < b.watchdate_arr[0]) return -1;
        if (b.watchdate_arr[0] < a.watchdate_arr[0]) return 1;
      }
      else if (a.watchdate_arr) return 1;
      else if (b.watchdate_arr) return -1;
      return 0;

  });
  // console.log(movieList);
  // console.log(movieJson);

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
              <td>({movie.year || tmdbList.find(m=>m.id===movie.dbid)?.release_date?.slice(0,4)})</td>
              <td>[{movie.runtime || tmdbList.find(m=>m.id===movie.dbid).runtime_hm}]</td>
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


export function DisplayMoviePage()
{
  let {movieId} = useParams();

  // let currentMovie = movieJson.find(m=>m.id === movieId);
  // let currentIdx   = movieJson.findIndex(m=>m === currentMovie);
  let currentIdx   = movieJson.findIndex(m=>m.id === movieId);
  let currentMovie = movieJson[currentIdx];
  let currentDB    = tmdbList?.find(m=>m.id === currentMovie.dbid);

  return (
    <>
      <DisplayMovie key={movieId} movie={currentMovie} idx={currentIdx} tmdb={currentDB} />
    </>
  )
}

let failedImages = new Set();

export function DisplayMovie({movie, idx, tmdb})
{
  let [err, setErr] = useState(failedImages.has(tmdb.bg))
  let src = err ? `https://image.tmdb.org/t/p/w1280/${tmdb?.backdrop_path}`
                : `/bg/${tmdb.bg}`;

  if (idx-1 < 0) {
    idx = movieJson.length;
  }
  let moviePrev = movieJson[idx-1];

  if ((idx+1) >= movieJson.length) {
    idx = -1;
  }
  let movieNext = movieJson[idx+1];


  return (
    <>
      <Link to={`/movies/${moviePrev.id}`} className='arrow prev-btn'></Link>
      <div className='movie-display'
          style={{"--data-backdrop-url": `url(${src})`}}
          onError={()=>{
            failedImages.add(tmdb.bg);
            setErr(true);
            }
          }>

        <MovieTitle movie={movie} tmdb={tmdb} />
        <div className="movie-info">
          {!!movie.links && 
          <Trailer movie={movie} idx={idx} css={"movie-trailer"} />}
          <Credits movie={movie} idx={idx} tmdb={tmdb}  />
        </div>
      </div>
      <Link to={`/movies/${movieNext.id}`} className='arrow next-btn'> </Link>
    </>
  )
}

//temporary function to get the details of one item
//used to test tmdb access without doing a complete pull
async function get_details(movie, type)
{
  // console.log("dbid: ", movie.id);
  const get_options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  }


  // //Authenticate
  // let api = await fetch('https://api.themoviedb.org/3/authentication', get_options);
  // let api_json = await api.json();
  // console.log(api_json);

  let searchParams = {};
  searchParams.query = movie.title;
  if (movie.year) {
    searchParams.year = movie.year;
  }

  let url;
  if (type == "ratings") {
    url = new URL(`https://api.themoviedb.org/3/movie/${movie.dbid}/release_dates`);
  } else {
    url = new URL(`https://api.themoviedb.org/3/movie/${movie.dbid}`);
    url.search = new URLSearchParams(searchParams);
  }

  let movie_details_json;
  let movie_details;
  try {
    movie_details = await fetch(url.toString(), get_options);
    movie_details_json = await movie_details.json();
    console.log(movie_details_json);
  } catch (error) {
    console.log(error);
  }

  if (type==="ratings") {
    let rating_by_country = movie_details_json.results.map((r)=>{
      let country = r.iso_3166_1;
      let rating = r.release_dates[0].certification;
      let temp = {"country" : country, "rating" : rating}
      return temp;
    });
    return rating_by_country
  } else {
    return movie_details_json;
  }

}

function MovieTitle({movie, tmdb})
{
  const [count, setCount] = useState(0);

  // get_details(movie.dbid, "details").then(d=>console.log(d));
  // get_details(movie, "ratings").then(d=>console.log(d));
  let USrating = tmdb.ratings?.find(f=>f.country=="US");
  // console.log(USrating);

  // useEffect(()=>{
  //   console.log(
  //     document.getElementsByClassName('.movie-rating')
  //                 .getAttribute('z-index')
  //   );
  // })

  //TODO: delete? this was originally supposed
  //to set size of font based on window width but
  //font-size: ##vw worked better, so maybe delete?
  // console.log(window.innerWidth);
  // let window_width = window.innerWidth;
  // let title_length = movie.title.length;
  // console.log("title length: ", title_length);
  // function fontSize() {
  //   let max_size = "3.2em"
  //   let final_size = 0;
  //   if (window_width > title_length*40) {
  //     final_size = max_size;
  //   } else {
  //     final_size = window_width/(title_length*40).toString() + "em";
  //   }
  //   return final_size;
  // }

  //font size should be ____ when window width > string length
  //if the window width is larger than the string length
  //font size should max out at that point
  //as window width shrinks lower than string length
  //font size should shrink down to a minimum setting

  return (
    <div className='movie-top-bar'>
      <div>
        <Link to={"/"} className='to-list'>
          Back to list
        </Link>
        <div className='movie-rating'>
          {USrating?.rating}
        </div>
      </div>

      <div className='movie-title-block'>
        <div>
          <h1 className='movie-title-only'
              // style={{"--font_size": `${fontSize}px`}}
              >{movie.title}
          </h1>
          <h2>({movie.year ||
                tmdb?.release_date?.slice(0,4)})
          </h2>
          <h2>{movie.runtime || 
                tmdb.runtime_hm
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

function Trailer({movie, idx, css})
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

// let failedImages = new Set();
// before your credits component,
// then change
// let [err, setErr] = useState(false)
// to
// let [err, setErr] = useState(failedImages.has(tmdb.poster))
// and change your onError handler to
// onError={()=>{failedImages.add(tmdb.poster);setErr(true)}}


function Credits({movie, idx, tmdb})
{
  // get_details(movie).then(d=>console.log(d));
  // const [err, setErr] = useState(false);
  let [err, setErr] = useState(failedImages.has(tmdb.poster))

  let src = err ? `https://image.tmdb.org/t/p/w300/${tmdb?.poster_path}`
                : `/pstr/${tmdb.poster}`;

  return (
    <div className="movie-credits">
      <h2 className='tagline'>{tmdb?.tagline}</h2>
      <h3>
        <img className='poster'
              src={src}
              onError={()=>{failedImages.add(tmdb.poster);
                            setErr(true)}}
              // onError={({target})=>{
              //   target.onError=null;
              //   target.src=`https://image.tmdb.org/t/p/w300/${tmdb?.poster_path}`;
              // }}
              />
        {tmdb?.overview}
      </h3>
    </div>
  )
}




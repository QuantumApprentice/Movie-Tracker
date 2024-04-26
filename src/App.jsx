import { useEffect, useState, useMemo } from 'react'
import './App.css'
import movieJson from './movieList.json'
import tmdbList from './tmdbList.json'
import { Link, Outlet, useParams } from 'react-router-dom';
import Chevron from './assets/chevron.svg?react'

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
  let [movieList, setMovieList] = useState(movieJson);
  let [sortDir, setSortDir]     = useState("invisible");
  let [whichSort, setWhichSort] = useState("none");
  let [buffer, setBuffer]       = useState(false);

  let movieList_map = useMemo(
    ()=>movieList.map((movie, idx)=>(
        <tr  className='movie-list' key={idx}
          onMouseOver={(e)=>{
            e.currentTarget.className="movie-list-hover";
            if (e.currentTarget.previousElementSibling) {
              e.currentTarget.previousElementSibling.className="movie-list-next";
            }
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.className="movie-list-next";
            }
          }}
          onMouseOut={(e)=>{
            e.currentTarget.className="movie-list";
            if (e.currentTarget.previousElementSibling) {
              e.currentTarget.previousElementSibling.className="movie-list";
            }
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.className="movie-list";
            }
          }}
        >
          <td className='movie-title-list'>
            <Link to={`/movies/${movie.id}`}>
              {movie.title}</Link>
          </td>
          <td>({movie.year || tmdbList.find(m=>m.id===movie.dbid)?.release_date?.slice(0,4)})</td>
          <td>[{movie.runtime_hm || tmdbList.find(m=>m.id===movie.dbid).runtime_hm}]</td>
          <td>({
          format_date(movie.watchdate_arr?.[0]) || 
          (movie.watched ? "watched": "")
          })</td>
        </tr>
      ))
    , [movieList]
  )









  // movieList = movieJson;

  // console.log(movieList);
  // console.log(movieJson);

  function set_sort(sort_type) {
    setMovieList(()=>{
      return sort_type(sortDir === "sort_dn");
    });
    setSortDir((dir)=>{
      if (dir === "sort_dn") {
        dir = "sort_up";
      } else {
        dir = "sort_dn";
      }
      return dir;
    });
  }

  function format_date(date) {
    let year = date?.slice(0,4);
    let month = date?.slice(4,6);
    // console.log(month);
    return date;
  }

  useEffect(()=>{
    let targetZoomedLineHeight = 36;
    let standardLineHeight = 24;
    let rowHeight = standardLineHeight + 2; //includes 2px cell spacing by default
    //line height is 1.5 so font size = line height/1.5
    let table = document.querySelector('.table-stuff');
    let tbody = table.querySelector('tbody');
    let adjustedRows = [];
    let mouseY;

    function animate() {
      clearStyles();
      let rect = tbody.getBoundingClientRect();
      let deltaY = mouseY - rect.y;
      let rowIndex = Math.floor(deltaY / rowHeight);
      let ratioWithinRow = (deltaY - rowIndex*rowHeight)/rowHeight;
      let ratioWithinRowInv = 1-ratioWithinRow;
      let row = tbody.children[rowIndex];

      let minLineHeight = 14;

      let grow_size   = targetZoomedLineHeight - standardLineHeight;
      let shrink_size = standardLineHeight - minLineHeight;

      // console.log("regular: ", ratioWithinRow);
      // console.log("inverted: ", ratioWithinRowInv);

      if (!row) return;

      // //push the excess rows from the center out
      // //instead of from the top down
      // if (rowIndex >= 2) {
      //   tbody.style.transform = `translateY(-${targetZoomedLineHeight - standardLineHeight}px)`;
      //   // tbody.style.paddingTop = `${targetZoomedLineHeight}px`;
      // } else if (rowIndex === 1) {
      //   tbody.style.transform = `translateY(-${Math.floor((targetZoomedLineHeight - standardLineHeight)*ratioWithinRow)}px)`;
      // }


      // row.style.lineHeight = `${targetZoomedLineHeight}px`;
      row.style.lineHeight = `${standardLineHeight}px`;
      row.style.fontSize   = `${targetZoomedLineHeight/1.5}px`;
      adjustedRows.push(row);


    //this version sets the prevRow first
    //instead of the nextRow first
      let prevRowLineHeight
        = standardLineHeight/2
          + grow_size * ratioWithinRowInv
          + standardLineHeight * ratioWithinRowInv/2
      let prevRow = row.previousElementSibling;
      if (prevRow) {
        // prevRow.style.lineHeight = `${prevRowLineHeight}px`;
        prevRow.style.lineHeight = `${standardLineHeight}px`;
        prevRow.style.fontSize   = `${prevRowLineHeight/1.5}px`;
        adjustedRows.push(prevRow);
      }

console.log(prevRowLineHeight);

      let nextRowLineHeight
        = standardLineHeight/2
          + grow_size * ratioWithinRow
          + standardLineHeight * ratioWithinRow/2
      let nextRow = row.nextElementSibling;
      if (nextRow) {
        // nextRow.style.lineHeight = `${nextRowLineHeight}px`;
        nextRow.style.lineHeight = `${standardLineHeight}px`;
        nextRow.style.fontSize   = `${nextRowLineHeight/1.5}px`;
        adjustedRows.push(nextRow);
      }



      let prevRow2 = prevRow.previousElementSibling;
      let prevRow2LineHeight
        = standardLineHeight
          - grow_size * ratioWithinRowInv;
// console.log(grow_size * ratioWithInRowInv);
      if (prevRow2) {
        // prevRow2.style.lineHeight = `${prevRow2LineHeight}px`;
        prevRow2.style.lineHeight = `${standardLineHeight}px`;
        prevRow2.style.fontSize   = `${prevRow2LineHeight/1.5}px`;
        adjustedRows.push(prevRow2);
      }

// console.log(prevRow2LineHeight);

      let nextRow2LineHeight
        = standardLineHeight
          - grow_size * ratioWithinRow;
// console.log(nextRow2LineHeight);
      let nextRow2 = nextRow.nextElementSibling;
      if (nextRow2) {
        // nextRow2.style.lineHeight = `${nextRow2LineHeight}px`;
        nextRow2.style.lineHeight = `${standardLineHeight}px`;
        nextRow2.style.fontSize   = `${nextRow2LineHeight/1.5}px`;
        adjustedRows.push(nextRow2);
      }


      // let prevRow3LineHeight
      //   = standardLineHeight/4
      //     - grow_size * ratioWithinRowInv/4

      // let prevRow3 = prevRow2.previousElementSibling;
      // if (prevRow3) {
      //   prevRow3.style.lineHeight = `${prevRow3LineHeight}px`;
      //   prevRow3.style.fontSize   = `${prevRow3LineHeight/1.5}px`;
      //   adjustedRows.push(prevRow3);
      // }



      // let prevRow4LineHeight
      //   = standardLineHeight
      //     - grow_size * ratioWithinRowInv/2

      // let prevRow4 = prevRow3.previousElementSibling;
      // if (prevRow4) {
      //   prevRow4.style.lineHeight = `${prevRow4LineHeight}px`;
      //   prevRow4.style.fontSize   = `${prevRow4LineHeight/1.5}px`;
      //   adjustedRows.push(prevRow4);
      // }










      // let nextRowLineHeight
      //   = Math.floor(
      //     standardLineHeight
      //     + (targetZoomedLineHeight - standardLineHeight)*ratioWithinRow
      //     // - (standardLineHeight - minLineHeight)*(ratioWithinRow)
      //   );
      // let nextRow = row.nextElementSibling;
      // if (nextRow) {
      //   nextRow.style.lineHeight = `${nextRowLineHeight}px`;
      //   nextRow.style.fontSize   = `${nextRowLineHeight/1.5}px`;
      //   adjustedRows.push(nextRow);
      // }


      // let prevRowLineHeight
      //   = standardLineHeight
      //     + targetZoomedLineHeight
      //     - nextRowLineHeight;
      //     // - minLineHeight
      // let prevRow = row.previousElementSibling;
      // if (prevRow) {
      //   prevRow.style.lineHeight = `${prevRowLineHeight}px`;
      //   prevRow.style.fontSize   = `${prevRowLineHeight/1.5}px`;
      //   adjustedRows.push(prevRow);
      // }



//       let nextRow2LineHeight
//         = Math.floor(
//           standardLineHeight
//           // - (targetZoomedLineHeight - standardLineHeight)*ratioWithinRow
//           - (standardLineHeight - minLineHeight)*ratioWithinRow
//         );
// console.log(nextRow2LineHeight);
//       if (nextRow2LineHeight < minLineHeight) {
//         nextRow2LineHeight = minLineHeight;
//       }
//       let nextRow2 = nextRow.nextElementSibling;
//       if (nextRow2) {
//         nextRow2.style.lineHeight = `${nextRow2LineHeight}px`;
//         nextRow2.style.fontSize   = `${nextRow2LineHeight/1.5}px`;
//         adjustedRows.push(nextRow2);
//       }


      // let prevRow2 = prevRow.previousElementSibling;
      // let prevRow2LineHeight
      //   = standardLineHeight
      //     // - nextRow2LineHeight
      //     + minLineHeight;

// // console.log(prevRow2LineHeight);
      // if (prevRow2LineHeight < minLineHeight) {
      //   prevRow2LineHeight = minLineHeight;
      // }
      // if (prevRow2) {
      //   prevRow2.style.lineHeight = `${prevRow2LineHeight}px`;
      //   // prevRow2.style.fontSize   = `${prevRow2LineHeight/1.5}px`;
      //   adjustedRows.push(prevRow2);
      // }



      // let nextRow3LineHeight
      //   = Math.floor(
      //     standardLineHeight
      //     // - (targetZoomedLineHeight - standardLineHeight)*ratioWithinRow
      //     - (standardLineHeight - minLineHeight)*ratioWithinRow
      //   );
      // if (nextRow3LineHeight < minLineHeight) {
      //   nextRow3LineHeight = minLineHeight;
      // }
      // let nextRow3 = nextRow2.nextElementSibling;
      // if (nextRow3) {
      //   nextRow3.style.lineHeight = `${nextRow3LineHeight}px`;
      //   // nextRow2.style.fontSize   = `${nextRow2LineHeight/1.5}px`;
      //   adjustedRows.push(nextRow3);
      // }


      // let prevRow3 = prevRow2.previousElementSibling;
      // let prevRow3LineHeight
      //   = standardLineHeight
      //     - nextRow3LineHeight
      //     + minLineHeight;
      // if (prevRow3LineHeight < minLineHeight) {
      //   prevRow3LineHeight = minLineHeight;
      // }
      // if (prevRow3) {
      //   prevRow3.style.lineHeight = `${prevRow3LineHeight}px`;
      //   // prevRow2.style.fontSize   = `${prevRow2LineHeight/1.5}px`;
      //   adjustedRows.push(prevRow3);
      // }



    }
    function clearStyles() {
      for (let row of adjustedRows){
        row.style.removeProperty('font-size');
        row.style.removeProperty('line-height');
      }
      tbody.style.removeProperty('transform');
      adjustedRows = [];
    }

    function handleMouseEvent(e) {
      mouseY = e.clientY;
      requestAnimationFrame(animate);
    }
    function handleEnter(e) {
      setBuffer(true);
      table.addEventListener('mousemove', handleMouseMove);
      handleMouseEvent(e);
    }
    function handleLeave(e) {
      setBuffer(false);
      table.removeEventListener('mousemove', handleMouseMove);
      clearStyles();
    }
    function handleMouseMove(e) {
      handleMouseEvent(e);
    }

    table.addEventListener('mouseenter', handleEnter);
    table.addEventListener('mouseleave', handleLeave)

    return () => {
      table.removeEventListener('mouseenter', handleEnter);
      table.removeEventListener('mouseleave', handleLeave);
      table.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animate);
      clearStyles();
    }
  }, []);

  return (
    <>
      <table className='table-stuff'>
        <thead>
          <tr className='movie-list-sticky'>
            <th><button onClick={()=>{
                set_sort(sort_title);
                setWhichSort("title");
              }}>Title&nbsp;{
                (whichSort === "title") ? <Chevron className={sortDir} /> : null
              }
              </button>
            </th>
            <th><button onClick={()=>{
                set_sort(sort_release);
                setWhichSort("year");
              }}>Release Year&nbsp;{
                (whichSort === "year") ? <Chevron className={sortDir} /> : null
              }
              </button>
            </th>
            <th><button onClick={()=>{
                set_sort(sort_runtime);
                setWhichSort("runtime");
              }}>[Runtime]&nbsp;{
                (whichSort === "runtime") ? <Chevron className={sortDir} /> : null
              }
              </button>
            </th>
            <th><button onClick={()=>{
                set_sort(sort_watchdate);
                setWhichSort("watchdate");
              }}>Watch Date&nbsp;{
                (whichSort === "watchdate") ? <Chevron className={sortDir} /> : null
              }
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* {buffer ? <tr><td colSpan={4}>&nbsp;</td></tr> : null} */}
          {movieList_map}
        </tbody>
      </table>
    </>
  )
}


// export function DisplayList()
// {
//   let [movieList, setMovieList] = useState(movieJson);
//   let [sortDir, setSortDir]     = useState("invisible");
//   let [whichSort, setWhichSort] = useState("none");
//   // movieList = movieJson;

//   // console.log(movieList);
//   // console.log(movieJson);

//   function set_sort(sort_type) {
//     setMovieList(()=>{
//       return sort_type(sortDir === "sort_dn");
//     });
//     setSortDir((dir)=>{
//       if (dir === "sort_dn") {
//         dir = "sort_up";
//       } else {
//         dir = "sort_dn";
//       }
//       return dir;
//     });
//   }

//   function format_date(date) {
//     let year = date?.slice(0,4);
//     let month = date?.slice(4,6);
//     console.log(month);
//     return date;
//   }

//   return (
//     <>
//       <table className='table-stuff'>
//         <thead>
//           <tr className='movie-list-sticky'>
//             <th><button onClick={()=>{
//                 set_sort(sort_title);
//                 setWhichSort("title");
//               }}>Title&nbsp;{
//                 (whichSort === "title") ? <Chevron className={sortDir} /> : null
//               }
//               </button>
//             </th>
//             <th><button onClick={()=>{
//                 set_sort(sort_release);
//                 setWhichSort("year");
//               }}>Release Year&nbsp;{
//                 (whichSort === "year") ? <Chevron className={sortDir} /> : null
//               }
//               </button>
//             </th>
//             <th><button onClick={()=>{
//                 set_sort(sort_runtime);
//                 setWhichSort("runtime");
//               }}>[Runtime]&nbsp;{
//                 (whichSort === "runtime") ? <Chevron className={sortDir} /> : null
//               }
//               </button>
//             </th>
//             <th><button onClick={()=>{
//                 set_sort(sort_watchdate);
//                 setWhichSort("watchdate");
//               }}>Watch Date&nbsp;{
//                 (whichSort === "watchdate") ? <Chevron className={sortDir} /> : null
//               }
//               </button>
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {movieList.map((movie, idx)=>(
//             <tr  className='movie-list' key={idx}
//               onMouseOver={(e)=>{
//                 e.currentTarget.className="movie-list-hover";
//                 e.currentTarget.previousElementSibling.className="movie-list-next";
//                 e.currentTarget.nextElementSibling.className="movie-list-next";
//               }}
//               onMouseOut={(e)=>{
//                 e.currentTarget.className="movie-list";
//                 e.currentTarget.previousElementSibling.className="movie-list";
//                 e.currentTarget.nextElementSibling.className="movie-list";
//               }}
//             >
//               <td className='movie-title-list'>
//                 <Link to={`/movies/${movie.id}`}>
//                   {movie.title}</Link>
//               </td>
//               <td>({movie.year || tmdbList.find(m=>m.id===movie.dbid)?.release_date?.slice(0,4)})</td>
//               <td>[{movie.runtime_hm || tmdbList.find(m=>m.id===movie.dbid).runtime_hm}]</td>
//               <td>({
//               format_date(movie.watchdate_arr?.[0]) || 
//               (movie.watched ? "watched": "")
//               })</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </>
//   )
// }

function compare_strings(a, b) {
  let compare;
  if (a && b) {
    if (a < b) {
      compare = -1;
    }
    if (a > b) {
      compare = 1;
    }
    return compare;
  }
  else if (a) return  1;
  else if (b) return -1;
  return 0;
}

function sort_title(reverse)
{
  let movieList = [...movieJson];

  function drop_The(title) {
    if (title.slice(0,4) == 'The ') {
      // console.log(title.slice(4,));
      return title.slice(4,);
    }
    return title;
  }

  movieList.sort((a,b)=>{
    let title_a = drop_The(a.title);
    let title_b = drop_The(b.title);

    let compare = compare_strings(title_a, title_b);
    return compare;

  });

  if (reverse) {
    movieList.reverse();
  }

  return movieList;
}

function sort_watchdate(reverse)
{
  let movieList = [...movieJson];

  movieList.sort((a,b)=>{
    if (a.watchdate_arr && b.watchdate_arr) {
      if (a.watchdate_arr[0] < b.watchdate_arr[0]) return -1;
      if (b.watchdate_arr[0] < a.watchdate_arr[0]) return 1;
    }
    else if (a.watchdate_arr) return 1;
    else if (b.watchdate_arr) return -1;
    return 0;
  });

  if (reverse) {
    movieList.reverse();
  }

  return movieList;
}

function sort_release(reverse)
{
  let movieList = [...movieJson];

  movieList.sort((a,b)=>{
    let compare = compare_strings(a.year,b.year);
    return compare;
  });

  if (reverse) {
    movieList.reverse();
  }

  return movieList;
}

function sort_runtime(reverse)
{
  // let dbList = [...tmdbList];
  let movieList = [...movieJson];

  movieList.sort((a,b)=>{
    let compare = compare_strings(a.runtime_m,b.runtime_m);
    // console.log(a.title, a.runtime_m);
    return compare;
  });

  if (reverse) {
    movieList.reverse();
  }

  return movieList;
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
      <DisplayMovie key={movieId} movie={currentMovie} idx={currentIdx} tmdb={currentDB} />
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
            failedImages.add(tmdb.bg);setErr(true);
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
          <h2>{movie.runtime_hm || 
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




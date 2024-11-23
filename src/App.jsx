import { useInView } from "react-intersection-observer";
import { useEffect, useState, useMemo, useRef } from 'react'
import './App.css'
import movieJson from './movieList.json'
import tmdbList from './tmdbList.json'
import { Link, Outlet, useParams, Route,
         useNavigate,
         useSearchParams,
         Routes,
         HashRouter,
         createHashRouter,
         createBrowserRouter,
         createRoutesFromElements,
         RouterProvider } from 'react-router-dom';
import Chevron from './assets/chevron.svg?react'

const token = import.meta.env.VITE_TMDB_TOKEN;
let failedImages = new Set();

import ErrorPage from './ErrorPage.jsx'

function filterMovies(query) {
  if (query == null) {
    const sp = new URLSearchParams(window.location.search);
    query = sp.get('q');
  }

  if (query) {
    const search_lc = query.toLowerCase();
    return movieJson.filter((e)=>{
      const title_lc = e.title.toLowerCase();

      return title_lc.includes(search_lc);
    });
  } else {
    return movieJson;
  }
}


export default function App()
{
  let [movieList, setMovieList] = useState(filterMovies);

  // window.addEventListener(
  //   "load",
  //   (e)=>{
  //     createObserver();
  //   }
  // )


  // const router = (
  //   <HashRouter basename='/'>
  //     <Routes>
  //       <Route  element={<Sidebar movieList={movieList} setMovieList={setMovieList} />}
  //               errorElement={<ErrorPage />}>
  //         <Route errorElement={<ErrorPage />}>
  //           <Route path="/movies/:movieId"
  //                 element={<DisplayMoviePage />}/>
  //           <Route path="/"
  //                 element={<DisplayList movieList={movieList} setMovieList={setMovieList} />}/>
  //         </Route>
  //       </Route>
  //     </Routes>
  //   </HashRouter>
  // )
  // return (
  //   router
  // )

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route  element={<Sidebar movieList={movieList} setMovieList={setMovieList} />}
              errorElement={<ErrorPage />}>
        <Route errorElement={<ErrorPage />}>
          <Route path="/Movie-Tracker/movies/:movieId"
                element={<DisplayMoviePage />}/>
          <Route path="/Movie-Tracker/"
                element={<DisplayList movieList={movieList} setMovieList={setMovieList} />}/>
        </Route>
      </Route>
    )
  )

  return (
    <RouterProvider router={router} />
  )
}

function Sidebar({movieList, setMovieList})
{
  let [whichSort, setWhichSort] = useState("none");
  let [sortDir, setSortDir]     = useState("invisible");
  let [searchParams, setSearchParams] = useSearchParams();


  let [showBar, setShowBar]     = useState(false);
  let tbl_clss = 'sidebar-horizontal';
  tbl_clss = 'sidebar-vertical';


  return (
    <>
      <div className={tbl_clss}>
        {hamburger_icon(showBar, setShowBar)}
        {showBar ? sidebar_buttons(
                      whichSort, setWhichSort,
                      sortDir, setSortDir,
                      searchParams, setSearchParams,
                      movieList, setMovieList) : null}
      </div>
      <Outlet />
    </>
  )
}

function sidebar_buttons(whichSort, setWhichSort, sortDir, setSortDir, searchParams, setSearchParams, movieList, setMovieList)
{
  function set_sort(sort_type) {
    setMovieList(()=>{
      return sort_type(sortDir === "sort_dn", movieList);
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

  function set_filter(newSearch) {
    setSearchParams({q:newSearch}, {replace: false});
    setMovieList(filterMovies(newSearch));
  }

  const random_movie = [
    "Star Wars", "Ninja Turtles", "Fight Club",
    "Matrix", "Lord of the Rings",
    "Indiana Jones", "Ghostbusters",
    "Friday the 13th", "Nightmare on Elm Street",
  ];
  const random_placeholder = random_movie[Math.floor(Math.random()*random_movie.length)]

  return (
    <>
    {/*Frankl81: Object.assign(document.createElement('button'), { onclick(){}}) */}
      <button onClick={()=>{
        set_sort(sort_title, movieList);
        setWhichSort("title");
      }}>Title&nbsp;{
        (whichSort === "title") ? <Chevron className={sortDir} /> : null
      }
      </button>
      <button onClick={()=>{
        set_sort(sort_release, movieList);
        setWhichSort("year");
      }}>Release Year&nbsp;{
        (whichSort === "year") ? <Chevron className={sortDir} /> : null
      }
      </button>
      <button onClick={()=>{
        set_sort(sort_runtime, movieList);
        setWhichSort("runtime");
      }}>[Runtime]&nbsp;{
        (whichSort === "runtime") ? <Chevron className={sortDir} /> : null
      }
      </button>
      <button onClick={()=>{
        set_sort(sort_watchdate, movieList);
        setWhichSort("watchdate");
      }}>Watch Date&nbsp;{
        (whichSort === "watchdate") ? <Chevron className={sortDir} /> : null
      }
      </button>
      <input name="q"
        placeholder={"Search " + random_placeholder}
        defaultValue={searchParams.get('q')}
        onChange={(e)=>{
          set_filter(e.target.value);
        }} />
    </>
  )
}

function hamburger_icon(showBar, setShowBar)
{
  return (
    <>
      <button className="hamburger-icon"
          onClick={(e)=>{
            e.currentTarget.classList.toggle("change");
            setShowBar(!showBar);
          }}
          >
        <div></div>
        <div></div>
        <div></div>
      </button>
    </>
  )
}

function ListMovies({movie, idx})
{
  const navigate = useNavigate();
  let imgRef     = useRef();
  let src = `/Movie-Tracker/pstr/${tmdbList?.find(m=>m.id === movie.dbid).poster}`;

  function format_date(date) {
    let year = date?.slice(0,4);
    let month = date?.slice(4,6);
    return date;
  }

  useEffect(()=>{
    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    }
    let observer = new IntersectionObserver(([e], o)=>{
      if (e.isIntersecting) {
        imgRef.current.style.setProperty("--poster-url", `url(${src})`);
        // e.forEach(element => {
        //   console.log('element: ', element);
        // });
        o.unobserve(e.target);
      }
    }, options);

    observer.observe(imgRef.current);

    return(()=>{
      // console.log("imgRef: ", imgRef);
      // observer.unobserve(imgRef.current);
      observer.disconnect();
    })
  }, []);

  return (
    <div src={src} className='poster-array-movie' key={idx}
      // style={{"--poster-url": `url(${src})`}}
      ref={imgRef}
      //default line coloring when images don't load
      onMouseOver={(e)=>{
        e.currentTarget.className="poster-array-hover";
        // console.log('mouse overing');
        // e.currentTarget.style.setProperty("--poster-url", `url(${src})`);
        // if (e.currentTarget.previousElementSibling) {
        //   e.currentTarget.previousElementSibling.className="movie-list-next";
        // }
        // if (e.currentTarget.nextElementSibling) {
        //   e.currentTarget.nextElementSibling.className="movie-list-next";
        // }
        // createObserver(imgRef.current);
      }}
      onMouseOut={(e)=>{
        e.currentTarget.className="poster-array-movie";
        // e.currentTarget.style.setProperty("--poster-url", `url(${src})`);
        // if (e.currentTarget.previousElementSibling) {
        //   e.currentTarget.previousElementSibling.className="movie-list";
        // }
        // if (e.currentTarget.nextElementSibling) {
        //   e.currentTarget.nextElementSibling.className="movie-list";
        // }
      }}
      onMouseDown={(e)=>{
        if (!e.button == 0) { //if not left-click
          return;
        }
        navigate(`/Movie-Tracker/movies/${movie.id}`);
        // navigate(`/movies/${movie.id}`);
        // let src = `/Movie-Tracker/bg/${tmdbList?.find(m=>m.id === movie.dbid).bg}`;
        // e.currentTarget.className="movie-list-click";
        // e.currentTarget.style.setProperty("--data-backdrop-url", `url(${src})`);
      }}
    >
    <div className='movie-title-list'>
        <Link to={`/Movie-Tracker/movies/${movie.id}`}
        >{movie.title}</Link>
      </div>
      <div>({movie.year || tmdbList.find(m=>m.id===movie.dbid)?.release_date?.slice(0,4)})</div>
      <div>[{movie.runtime_hm || tmdbList.find(m=>m.id===movie.dbid).runtime_hm}]</div>
      <div>({
        format_date(movie.watchdate_arr?.[0]) || 
        (movie.watched ? "watched": "")})
      </div>
    </div>
  )

}

function Dummy({img})
{
  const {ref, inView, entry} = useInView({threshold: 1.0, delay: 4});

  return (
    <div ref={ref} className='poster-array-movie'>
      <img src={inView ? img : null} />
      {/* {inView ? <img src={img}/> : <img />} */}
      <h2>Stuff: `${inView}</h2>
    </div>
  )

}


/*displays list of movies to click on */
export function DisplayList({movieList, setMovieList})
{
  // createObserver(imgRef.current);
  let movieList_map = useMemo(
    ()=>movieList.map((movie, idx)=>{
      return (
        <ListMovies movie={movie} idx={idx} key={idx} />
      )}), [movieList]
  );

  useEffect(()=>{
    // movie_listing_hover_effect(setBuffer);
  }, []);

  return (
    <>
      <Dummy img={"http://localhost:5173/Movie-Tracker/pstr/the-mummys-hand-1940.jpg"} />
      <Dummy img={"http://localhost:5173/Movie-Tracker/pstr/the-invisible-woman-1940.jpg"}/>
      <div className='poster-array'>
        {/* {buffer ? <tr><td colSpan={4}>&nbsp;</td></tr> : null} */}
        {movieList_map}
      </div>
    </>
  )
}

function movie_listing_hover_effect(setBuffer) {
  let targetZoomedLineHeight = 36;
  let standardLineHeight = 24;
  let rowHeight = standardLineHeight + 2; //includes 2px cell spacing by default
  //line height is 1.5 so font size = line height/1.5
  let table = document.querySelector('.table-stuff');
  let tbody = table.querySelector('tbody');
  let adjustedRows = [];
  let mouseY;

  //callback handler for requestAnimationFrame()
  //                 and cancelAnimationFrame()
  function animate() {
    animate_grow_on_mouse_hover(
      mouseY, tbody, rowHeight,
      targetZoomedLineHeight,
      standardLineHeight,
      adjustedRows,
    );
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
    clearStyles(adjustedRows, tbody);
  }
  function handleMouseMove(e) {
    handleMouseEvent(e);
  }

  table.addEventListener('mouseenter', handleEnter);
  table.addEventListener('mouseleave', handleLeave);

  return () => {
    table.removeEventListener('mouseenter', handleEnter);
    table.removeEventListener('mouseleave', handleLeave);
    table.removeEventListener('mousemove', handleMouseMove);
    cancelAnimationFrame(animate);
    clearStyles(adjustedRows, tbody);
  }
}



function clearStyles(adjustedRows, tbody) {
  for (let row of adjustedRows){
    row.style.removeProperty('font-size');
    row.style.removeProperty('line-height');
  }
  tbody.style.removeProperty('transform');
  adjustedRows = [];
}

//TODO: migrate away from this code
//      kept here for archive purposes for now
function animate_grow_on_mouse_hover(mouseY, tbody, rowHeight, targetZoomedLineHeight, standardLineHeight, adjustedRows) {
  clearStyles(adjustedRows, tbody);
  let rect     = tbody.getBoundingClientRect();
  let deltaY   = mouseY - rect.y;
  let rowIndex = Math.floor(deltaY / rowHeight);

  let row = tbody.children[rowIndex];
  if (!row) return;

  let ratioWithinRow    = (deltaY - rowIndex*rowHeight)/rowHeight;
  let ratioWithinRowInv = 1-ratioWithinRow;
  let grow_size = targetZoomedLineHeight - standardLineHeight;

  row.style.lineHeight = `${standardLineHeight}px`;
  row.style.fontSize   = `${targetZoomedLineHeight/1.5}px`;
  row.style.filter     = `grayscale(0)`;
  adjustedRows.push(row);

  //this version sets the prevRow first
  //instead of the nextRow first
  let prevRowLineHeight = standardLineHeight/2
      + grow_size * ratioWithinRowInv
      + standardLineHeight * ratioWithinRowInv/2;
  let prevRow = row.previousElementSibling;
  if (prevRow) {
    prevRow.style.lineHeight = `${standardLineHeight}px`;
    prevRow.style.fontSize   = `${prevRowLineHeight/1.5}px`;
    prevRow.style.filter     = `grayscale(${1-(prevRowLineHeight-12)/standardLineHeight})`;
    adjustedRows.push(prevRow);
  } else {
    return;
  }

  let nextRowLineHeight = standardLineHeight/2
      + grow_size * ratioWithinRow
      + standardLineHeight * ratioWithinRow/2;
  let nextRow = row.nextElementSibling;
  if (nextRow) {
    nextRow.style.lineHeight = `${standardLineHeight}px`;
    nextRow.style.fontSize   = `${nextRowLineHeight/1.5}px`;
    nextRow.style.filter     = `grayscale(${1-(nextRowLineHeight-12)/standardLineHeight})`;
    adjustedRows.push(nextRow);
  } else {
    return;
  }

  let prevRow2 = prevRow.previousElementSibling;
  let prevRow2LineHeight = standardLineHeight - grow_size;
  if (prevRow2) {
    prevRow2.style.lineHeight = `${standardLineHeight}px`;
    prevRow2.style.fontSize   = `${prevRow2LineHeight/1.5}px`;
    adjustedRows.push(prevRow2);
  } else {
    return;
  }

  let nextRow2LineHeight = standardLineHeight - grow_size;
  let nextRow2 = nextRow.nextElementSibling;
  if (nextRow2) {
    nextRow2.style.lineHeight = `${standardLineHeight}px`;
    nextRow2.style.fontSize   = `${nextRow2LineHeight/1.5}px`;
    adjustedRows.push(nextRow2);
  } else {
    return;
  }

  let prevRowMid = prevRow2.previousElementSibling;
  let nextRowMid = nextRow2.nextElementSibling;
  for (let i = 0; i < 5; i++) {
    if (prevRowMid) {
      prevRowMid.style.lineHeight = `${standardLineHeight}px`;
      prevRowMid.style.fontSize   = `${prevRow2LineHeight/1.5}px`;
      adjustedRows.push(prevRowMid);
      prevRowMid = prevRowMid.previousElementSibling;
    }

    if (nextRowMid) {
      nextRowMid.style.lineHeight = `${standardLineHeight}px`;
      nextRowMid.style.fontSize   = `${nextRow2LineHeight/1.5}px`;
      adjustedRows.push(nextRowMid);
      nextRowMid = nextRowMid.nextElementSibling;
    }
  }

  let prevRow3LineHeight = standardLineHeight
      - grow_size * ratioWithinRowInv;
  let prevRow3 = prevRowMid;
  if (prevRow3) {
    prevRow3.style.lineHeight = `${standardLineHeight}px`;
    prevRow3.style.fontSize   = `${prevRow3LineHeight/1.5}px`;
    prevRow3.style.filter     = `grayscale(${1-(prevRow3LineHeight-12*ratioWithinRowInv)/standardLineHeight})`;
    adjustedRows.push(prevRow3);
  }

  let nextRow3LineHeight = standardLineHeight
      - grow_size * ratioWithinRow;
  let nextRow3 = nextRowMid;
  if (nextRow3) {
    nextRow3.style.lineHeight = `${standardLineHeight}px`;
    nextRow3.style.fontSize   = `${nextRow3LineHeight/1.5}px`;
    nextRow3.style.filter     = `grayscale(${1-(nextRow3LineHeight-12*ratioWithinRow)/standardLineHeight})`;
    adjustedRows.push(nextRow3);
  }


  //this old code was used to change the font _&_ the line size
  //at the same time, which caused wacky dom movement,
  //and I couldn't figure out how to adjust the movement
  //to prevent the dom links from moving around
  //(turns out I was making the main hovered link larger than
  // shrinking any single other link could make-up the excess
  // movement)
  //So I removed the code that changed the line size
  //and just changed the font size to grow/shrink
  // //push the excess rows from the center out
  // //instead of from the top down
  // if (rowIndex >= 2) {
  //   tbody.style.transform = `translateY(-${targetZoomedLineHeight - standardLineHeight}px)`;
  //   // tbody.style.paddingTop = `${targetZoomedLineHeight}px`;
  // } else if (rowIndex === 1) {
  //   tbody.style.transform = `translateY(-${Math.floor((targetZoomedLineHeight - standardLineHeight)*ratioWithinRow)}px)`;
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
}

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

function sort_title(reverse, movieList)
{
  let templist = [...movieList];

  function drop_The(title) {
    if (title.slice(0,4) == 'The ') {
      return title.slice(4,);
    }
    return title;
  }

  templist.sort((a,b)=>{
    let title_a = drop_The(a.title);
    let title_b = drop_The(b.title);

    let compare = compare_strings(title_a, title_b);
    return compare;

  });

  if (reverse) {
    templist.reverse();
  }

  return templist;
}

function sort_watchdate(reverse, movieList)
{
  let templist = [...movieList];

  templist.sort((a,b)=>{
    if (a.watchdate_arr && b.watchdate_arr) {
      if (a.watchdate_arr[0] < b.watchdate_arr[0]) return -1;
      if (b.watchdate_arr[0] < a.watchdate_arr[0]) return 1;
    }
    else if (a.watchdate_arr) return 1;
    else if (b.watchdate_arr) return -1;
    return 0;
  });

  if (reverse) {
    templist.reverse();
  }

  return templist;
}

function sort_release(reverse, movieList)
{
  let templist = [...movieList];

  templist.sort((a,b)=>{
    let compare = compare_strings(a.year,b.year);
    return compare;
  });

  if (reverse) {
    templist.reverse();
  }

  return templist;
}

function sort_runtime(reverse, movieList)
{
  let templist = [...movieList];

  templist.sort((a,b)=>{
    let compare = compare_strings(a.runtime_m,b.runtime_m);
    // console.log(a.title, a.runtime_m);
    return compare;
  });

  if (reverse) {
    templist.reverse();
  }

  return templist;
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

  let currentIdx   = movieJson.findIndex(m=>m.id === movieId);
  let currentMovie = movieJson[currentIdx];
  let currentDB    = tmdbList?.find(m=>m.id === currentMovie.dbid);

  return (
      <DisplayMovie key={movieId} movie={currentMovie} idx={currentIdx} tmdb={currentDB} />
  )
}


export function DisplayMovie({movie, idx, tmdb})
{
  let [err, setErr] = useState(failedImages.has(tmdb.bg));
  let src = err ? `https://image.tmdb.org/t/p/w1280/${tmdb?.backdrop_path}`
                : `/Movie-Tracker/bg/${tmdb.bg}`;

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
      <Link to={`/Movie-Tracker/movies/${moviePrev.id}`} className='arrow prev-btn'></Link>
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
      <Link to={`/Movie-Tracker/movies/${movieNext.id}`} className='arrow next-btn'> </Link>
    </>
  )
}

//TODO: DELETE
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
    // console.log(movie_details_json);
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

  //font size should be ____ when window width > string length
  //if the window width is larger than the string length
  //font size should max out at that point
  //as window width shrinks lower than string length
  //font size should shrink down to a minimum setting

  return (
    <div className='movie-top-bar'>
      <div>
        <Link to={"/Movie-Tracker/"} className='back-to-list'>
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
        <h4>/vote {movie.dbid}</h4>
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
  // console.log("url: ", url);
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
              src={`https://www.youtube.com/embed/${name}`}
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
// onError={()=>{
//    failedImages.add(tmdb.poster);
//    setErr(true);
// }}


function Credits({movie, idx, tmdb})
{
  // get_details(movie).then(d=>console.log(d));
  // const [err, setErr] = useState(false);
  let [err, setErr] = useState(failedImages.has(tmdb.poster))

  let src = err ? `https://image.tmdb.org/t/p/w300/${tmdb?.poster_path}`
                : `/Movie-Tracker/pstr/${tmdb.poster}`;

  if (err) {
    console.log("`/pstr/${tmdb.poster}`: ", `/pstr/${tmdb.poster}`);
  }

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




import { useEffect, useState } from 'react'
import './App.css'
// import text from './Movie Night.txt?raw'
import movieJson from './movieList.json'

export default App

// let movieList = [];
async function parseList3()
{
  // let regex = /^-?(?<date>[\d.]+\.)?(?<title>[-'&:(). \w]+)\((?<year>\d{4})\) \[(?<runtime>\dh\d{0,2}m)] (?<links>.+$)/gm;
  // let regex = /(?:[\d]{1,2}\.+){1,2}[\d]{2,4}/gm //step (date only)
  // let regex = /^(?<comment>\([\w ]+\))?-?(?<watchdate>\d{1,2}.(\d{1,2}(\/\d{2})?)?.\d{2,4}.)?(?<title>[\w,' :&!./-]+[\w,':&!.]( \((?!\d{2,4})[\w ]+\))?) (?<year>\(\d{4}\))? *(?<runtime>\[(\d+h\d+m)?\] *)?(?<allurls>(?:([a-zA-Z?]+: )?http.+)*)/gm; //tvjosh
  // let regex = /^.+?\((\d{4})?\).*/gm  //bakerstaunch
  // let regex = /^(?!\n)(?!\r)[^#].*/gm;
  let regex = /^(?<watched>-)?(?<watchdate>(?:[\d\/]*\.){3})?(?<title>[^#\s].*?) *\((?<year>\d{4})?\) *(?:\[(?<runtime>\d+h\d+m)\])?(.*)/gm;
  let linkRegex = /(?:(?<type>\w+): )?(?<url>[\w+\S]+)+/gm

  let arr;
  while (arr = regex.exec(text)) {
    // console.log(arr);
    let tempMovie = {...arr.groups};

    let links;
    while (links = linkRegex.exec(arr[6])) {
      let type = links.groups.type || 'trailer';
      if (!tempMovie[type]) {
        tempMovie[type] = [];
      }
      tempMovie[type].push(links.groups.url)
      // console.log(tempMovie);
    }
    if (tempMovie.watchdate) {
      tempMovie.watchdate = tempMovie.watchdate.slice(0,-1);
    }

    tempMovie.watched = !!tempMovie.watched;
    movieList.push(tempMovie);
  }
  let movie_json = JSON.stringify(movieList,null,' ');
  // console.log(movie_json);
  console.log(movieList);
  let file = new Blob([movie_json]);
  let a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = 'movieList.json';
  a.click();
}
// parseList3();

async function parseList2()
{
  // let regex1 = RegExp(
  //   "-?(?<watchdate>\\d{0,2}\\.\\d{0,2}\\.\\d{0,4})?\\.*" +
  //   "(?<title>[A-Za-z\\d\\-&\\.' ]+)"                     +
  //   "(?<release>\\(\\d+\\)) "                             +
  //   "(?<runtime>\\[\\d+h\\d+m] )?"                        +
  //   "(?<trailers>(trailer: |teaser: |movie: |modern: )?http[^$]+)?"
  //   , "gm");

  let movieLines = text.split("\n");
  let regex1 = /-?(?<watchdate>\d{0,2}\.\d{0,2}\.\d{0,4})?\.*(?<title>[A-Za-z\d\-&\.' ]+)(?<release>\(\d+\)) (?<runtime>\[\d+h\d+m\] )?(?<trailers>(trailer: |teaser: |movie: |modern: )?http[^$]+)?/m;
  // let regex2 = /http[^ $]+/g
  let reg_teaser  = /(?<=teaser: )(?<teaser>http\S+)/g
  let reg_trailer = /(?<!teaser: )(?<!modern: )(?<!movie: )(?<trailer>http\S+)/g
  let reg_modern  = /(?:modern: )(?<modern>http\S+)/g
  let reg_movie   = /(?:movie: )(?<movie>http\S+)/g
  for (const movie of movieLines) {
    // let arr = movie.match(regex1);
    let arr = regex1.exec(movie);
    console.log(arr);
    if (arr !== null) {
      let tempMovie = {};

      tempMovie.title     = arr.groups.title;
      tempMovie.year      = arr.groups.release;
      tempMovie.runtime   = arr.groups.runtime;
      tempMovie.watchdate = arr.groups.watchdate;
      // tempMovie.trailers  = arr.groups.trailers;

      // let tr = arr.groups.trailers.trim().split(regex2);
      // let tr = regex2.exec(arr.groups.trailers.trim());
      let teaser;
      let trailer;
      let modern;
      let movie;
      // console.log(arr.groups.trailers);
      if (arr.groups.trailers) {
        teaser  = arr.groups.trailers.trim().match(reg_teaser);
        //TODO: change trailer to .exec() to get the named capture groups
        //TODO: also try using matchAll()
        trailer = arr.groups.trailers.trim().match(reg_trailer);
        modern  = arr.groups.trailers.trim().match(reg_modern);
        movie   = arr.groups.trailers.trim().match(reg_movie);
      }
      // console.log("teaser", tempMovie.title, teaser, arr.groups.trailers);
      // console.log("trailer", tempMovie.title, trailer, arr.groups.trailers);
      // console.log("modern", tempMovie.title, modern, arr.groups.trailers);
      // console.log("movie", tempMovie.title, movie, arr.groups.trailers);
      if (teaser) {
        tempMovie.teaser = teaser[0];
      }
      if (trailer) {
        for (const tr of trailer) {
          
        }
        tempMovie.trailer = trailer[0];

        // console.log(trailer);
      }
      if (modern) {
        tempMovie.modern = modern[0];
      }
      if (movie) {
        tempMovie.movie = movie[0];
      }

      movieList.push(tempMovie);
    }


  }
  // let arr = text.match(regex1);
  // console.log(arr);
  console.log(movieList);
  //(?<teaser>(?:teaser:) http[^\r\n ])?(?<trailer1>(?:trailer: )?http[^\r\n ]+)?(?<trailer2>(?:trailer: )?http[^ \r\n]+ )?(?<modern>(?:modern: )?http[^ \r\n]+)?

  // for (const lines of movieLines) {
  //   let arr = regex.exec(lines);
  //   console.log(arr);
  // }
}
// parseList2();

// let movieList1 = [];
async function parseList()
{
  // debugger
  let movieLines = text.split("\n");
  for (let line of movieLines) {
    line = line.trim();
    if (line[0] == "#" || line.length == 0) {
      continue;
    }

    let tempMovie = {};
    tempMovie.watched = false;
    let strtIdx = 0;
    let endIdx  = 0;
    let i = 0;

    //watched date
    if (line[0] == "-") {
      let watchIndex = 0;
      if (line[1] >= "0" && line[1] <= "9") {
        for (; i < line.length; i++) {
          if (line[i] == ".") {
            watchIndex++;
            if (watchIndex == 3) {
              tempMovie.watchdate = line.slice(1, i++);
              break;
            }
          }
        }
      }
      if (watchIndex < 3) {
        i = 1;
        // tempMovie.watchdate = "watched before I started tracking this stuff";
      }
      tempMovie.watched = true;
    }

    //movie title
    strtIdx = line.indexOf("(");
    tempMovie.title = line.slice(i, strtIdx).trim();

    //release year
    endIdx = line.indexOf(")");
    tempMovie.year = line.slice(strtIdx+1, endIdx);

    //run time
    if (line[endIdx+2] == "[") {
      strtIdx = endIdx+2;
      endIdx = line.indexOf("]", strtIdx);
      tempMovie.runtime = line.slice(strtIdx+1,endIdx);
    }

    if (endIdx > 0) {
      //trailer link
      if (line[endIdx+2] == "h" || line[endIdx+2] == "t") {
        strtIdx = line.indexOf("h", endIdx+2);
        endIdx = line.indexOf(" ", strtIdx);
        tempMovie.trailer = line.slice(strtIdx, endIdx);  //seems to work even if endIdx == -1;
      }
      //movie/modern link (if there is one)
      if (line[endIdx+1] == "m") {
        let ptr = endIdx+1;
        strtIdx = line.indexOf("h", endIdx+1);
        endIdx = line.indexOf(" ", strtIdx);
        if (endIdx > 0) {
          if (line[ptr+2] == "v") {
            tempMovie.movie = line.slice(strtIdx, endIdx);
          } else {
            tempMovie.modern = line.slice(strtIdx, endIdx);
          }
        } else {
          if (line[ptr+2] == "v") {
            tempMovie.movie = line.slice(strtIdx);
          } else {
            tempMovie.modern = line.slice(strtIdx);
          }
        }
      }
      //extra trailer link (if there is one)
      if (line[endIdx+1] == "h" || line[endIdx+1] == "t") {
        strtIdx = line.indexOf("h", endIdx+1);
        endIdx = line.indexOf(" ", strtIdx);
        if (endIdx > 0) {
          tempMovie.trailer2 = line.slice(strtIdx, endIdx);
        } else {
          tempMovie.trailer2 = line.slice(strtIdx);
        }
      }
    }

    movieList1.push(tempMovie);
  }
  let movie_json = JSON.stringify(movieList1,null,' ');
  let file = new Blob([movie_json]);
  // console.log(movie_json);
  console.log(movieList1);
  saveAs(file, 'test.json');

}
// parseList();

function App() {
  let [movie, setMovie] = useState(null);

  function trackHistory(obj) {
    setMovie(obj);
    let regRep = /[^a-z0-9]+/gi;
    let regDel = /[\?\:']+/g;
    let tempURL = `${obj.title} ${obj.year}`;
    let finalURL = tempURL.replace(regDel, "").replace(regRep, "-").toLowerCase();
    // console.log("url: ", finalURL);
    // console.log("obj.title: ", obj.title);
    history.pushState(obj, "", finalURL);
  }

  useEffect(()=>{
    function pop(e) {
      setMovie(e.state);
    }
    window.addEventListener("popstate", pop);
    return ()=>{
      window.removeEventListener("popstate",pop);
    }
  },[]);

  if (movie == null) {
    return (
      <DisplayList movieList={movieJson} showMovie={trackHistory}/>
    )
  } else {
    return (
      <DisplayMovie currentMovie={movie} setMovie={setMovie}/>
    )
  }
}

function DisplayList({movieList, showMovie})
{

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
              <td className='title'
                onClick={()=>{
                  showMovie(movie);
                }}>{movie.title}</td>
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

function DisplayMovie({currentMovie, setMovie})
{

  return (
    <>
      <button onClick={()=>(
        setMovie(null)
      )}>Return</button>
      <MovieTitle movie={currentMovie} />
      <div className="info">
        <Trailer movie={currentMovie}  />
        <Credits movie={currentMovie}  />
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
  let idx = movie.trailer[0].lastIndexOf('/');
  let name = movie.trailer[0].slice(idx+1);

  return (
    <div className="trailer">
      <h1>Trailer:</h1>
      <iframe width="560" height="315"
        src={`http://www.youtube.com/embed/${name}`}
        title="YouTube video player"

          allowFullScreen>
      </iframe>
    </div>
  )
}

function Credits({movie})
{
  return (
    <div className="credits">
      <h1>Last Watched: </h1>
      <h2>{movie.watched}</h2>
      <h2>{movie.imdbPlaceholder}</h2>
    </div>
  )
}




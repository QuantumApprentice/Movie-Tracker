// import text from './Movie Night.txt?raw'
// import {movieJson} from './movieList.json'
// const token = import.meta.env.VITE_TMDB_TOKEN;
// const acct_id  = import.meta.env.VITE_TMDB_ACCTID;
// const {token: VITE_TMDB_TOKEN} = import.meta.env
const fs = require('node:fs');
const text = fs.readFileSync('./src/Movie Night.txt', 'utf8');

require('dotenv').config({path: ['.env.local']});
const token = process.env.VITE_TMDB_TOKEN;
// const acct_id = process.env.VITE_TMDB_ACCTID;

let movieJson;
async function parseList3()
{
  let movieList = [];
  // let regex = /^-?(?<date>[\d.]+\.)?(?<title>[-'&:(). \w]+)\((?<year>\d{4})\) \[(?<runtime>\dh\d{0,2}m)] (?<links>.+$)/gm;
  // let regex = /(?:[\d]{1,2}\.+){1,2}[\d]{2,4}/gm //step (date only)
  // let regex = /^(?<comment>\([\w ]+\))?-?(?<watchdate>\d{1,2}.(\d{1,2}(\/\d{2})?)?.\d{2,4}.)?(?<title>[\w,' :&!./-]+[\w,':&!.]( \((?!\d{2,4})[\w ]+\))?) (?<year>\(\d{4}\))? *(?<runtime>\[(\d+h\d+m)?\] *)?(?<allurls>(?:([a-zA-Z?]+: )?http.+)*)/gm; //tvjosh
  // let regex = /^.+?\((\d{4})?\).*/gm  //bakerstaunch
  // let regex = /^(?!\n)(?!\r)[^#].*/gm;
  let regex = /^(?<watched>-)?(?<watchdate>(?:[\d\/]*\.){3})?(?<title>[^#\s].*?) *\((?<year>\d{4})?\) *(?:\[(?<runtime>\d+h\d+m)\])?(.*)/gm;
  let linkRegex = /(?:(?<type>[\w\() ]+): )?(?<url>http[\w+\S]+)+/gm

  //store trailer links if there are any
  let arr;
  while (arr = regex.exec(text)) {
    let tempMovie = {...arr.groups};

    tempMovie.links = {};
    let links;
    while (links = linkRegex.exec(arr[6])) {
      let type = links.groups.type || 'trailer';
      if (!tempMovie.links[type]) {
        tempMovie.links[type] = [];
      }
      tempMovie.links[type].push(links.groups.url);
      // console.log(tempMovie);
    }

    // store the last watch date for this movie
    if (tempMovie.watchdate) {
      tempMovie.watchdate = tempMovie.watchdate.slice(0,-1);
    }

    //create and store unique id for every movie in the list
    let regRep = /[^a-z0-9]+/gi;
    let regDel = /[\?\:']+/g;
    let tempURL = `${tempMovie.title} ${tempMovie.year}`;
    let finalURL = tempURL.replace(regDel, "").replace(regRep, "-").toLowerCase();
    tempMovie.id = finalURL;

    tempMovie.watched = !!tempMovie.watched;
    movieList.push(tempMovie);
  }
  let movie_json;
  movie_json = JSON.stringify(movieList,null,' ');
  // fs.writeFileSync('src/movieList.json', movie_json);


  movieJson = JSON.parse(movie_json);


  // let file = new Blob([movie_json]);
  // let a = document.createElement("a");
  // a.href = URL.createObjectURL(file);
  // a.download = 'movieList.json';
  // a.click();
}
parseList3();

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




async function get_movie_info(title, year)
{
  const get_options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  }
  const post_options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    // body: JSON.stringify({media_type: 'movie', media_id: 550, favorite: true}),
  }

  let searchParams = {};
  searchParams.query = title;
  if (year) {
    searchParams.year = year;
  }

  let url = new URL("https://api.themoviedb.org/3/search/movie");
  url.search = new URLSearchParams(searchParams);

  //Search Movie
  try {
    let search_movie = await fetch(url.toString(), get_options);
    let movie_info_json = await search_movie.json();
    return movie_info_json;
  } catch (error) {
    console.log(error);
  }
  // console.log(movie_info_json);

  // //Authenticate
  // fetch('https://api.themoviedb.org/3/authentication', options)
  //   .then(r=>r.json())
  //   .then(re=>console.log(re))
  //   .catch(err=>console.error(err));

  // //Authenticate
  // let api = await fetch('https://api.themoviedb.org/3/authentication', get_options);
  // let api_json = await api.json();
  // console.log(api_json);

  // //Details
  // let acct = await fetch(`https://api.themoviedb.org/3/account/${acct_id}`, get_options);
  // let api_acct = await acct.json();
  // console.log(api_acct);

  // //Add Favorite
  // let add_fav = await fetch(`https://api.themoviedb.org/3/account/${acct_id}/favorite`, post_options);
  // let api_add_fav = await add_fav.json();
  // console.log(api_add_fav);

  // //Get Favorite Movies
  // let get_fav = await fetch(`https://api.themoviedb.org/3/account/${acct_id}/favorite/movies?language=fr`, get_options);
  // let api_get_fav = await get_fav.json();
  // console.log(api_get_fav);

}

async function tmdb_json()
{
  let db_json = [];
  // let entry = [];
  for (const movie of movieJson) {
    // entry.push(get_movie_info(movie.title, movie.year));
    let entry = await get_movie_info(movie.title,movie.year);
    if (entry.results[0]) {
      db_json.push({...entry.results[0], found: true});
    } else {
      db_json.push({title: movie.title, found: false});
    }

    // console.log(entry.results[0]);
  }

  let db_write = JSON.stringify(db_json,null,' ');

  // db_json = await Promise.all(entry);
  try {
    fs.writeFileSync('src/tmdbList.json', db_write);
  } catch (err) {
    console.error(err);
  }


  // let out = JSON.stringify(db_json,null,' ');
  // let file = new Blob([out]);
  // let a = document.createElement("a");
  // a.href = URL.createObjectURL(file);
  // a.download = 'tmdbList.json';
  // a.click();
}
tmdb_json();
// import text from './Movie Night.txt?raw'
// import {finalJson} from './movieList.json'
// const token = import.meta.env.VITE_TMDB_TOKEN;
// const acct_id  = import.meta.env.VITE_TMDB_ACCTID;
// const {token: VITE_TMDB_TOKEN} = import.meta.env
const fs = require('node:fs');
const stream = require('node:stream');
const text = fs.readFileSync('./src/Movie Night.txt', 'utf8');
const temp = fs.readFileSync('./src/tmdbList.json', 'utf8');
const finalJson = JSON.parse(temp);

// const blurhash = require('blurhash');
// console.log('blurhash?: ', blurhash);
const jsfeat = require('jsfeat');
const jpeg_js = require('jpeg-js');

require('dotenv').config({path: ['.env.local']});
const token = process.env.VITE_TMDB_TOKEN;
// const acct_id = process.env.VITE_TMDB_ACCTID;


function get_watch_date(date)
{
  if (!date) {
    return;
  }

  let idx1 = date.indexOf('.');
  let idx2 = date.indexOf('.', idx1+1);

  let month = date.slice(0,idx1);
  let day   = date.slice(idx1+1, idx2);
  let year  = date.slice(idx2+1);
  // console.log(month, "mm", day, "dd", year, "yy");


  if (year.length < 4) {
    year = 20 + year;
  }
  if (!day) {
    day = '00';
  }

  if (day.length < 2) {
    day = '0' + day;
  }
  if (month.length < 2) {
    month = '0' + month;
  }

  let iso3339_date = year + month + day;
  // console.log(iso3339_date);
  return (iso3339_date);
}

let movieJson;
async function parseList3()
{
  let movieList = [];
  // let regex = /^-?(?<date>[\d.]+\.)?(?<title>[-'&:(). \w]+)\((?<year>\d{4})\) \[(?<runtime>\dh\d{0,2}m)] (?<links>.+$)/gm;
  // let regex = /(?:[\d]{1,2}\.+){1,2}[\d]{2,4}/gm //step (date only)
  // let regex = /^(?<comment>\([\w ]+\))?-?(?<watchdate>\d{1,2}.(\d{1,2}(\/\d{2})?)?.\d{2,4}.)?(?<title>[\w,' :&!./-]+[\w,':&!.]( \((?!\d{2,4})[\w ]+\))?) (?<year>\(\d{4}\))? *(?<runtime>\[(\d+h\d+m)?\] *)?(?<allurls>(?:([a-zA-Z?]+: )?http.+)*)/gm; //tvjosh
  // let regex = /^.+?\((\d{4})?\).*/gm  //bakerstaunch
  // let regex = /^(?!\n)(?!\r)[^#].*/gm;

  //  (\d{1,2}\.){2}(\d{2,4}) ?
  //  (<first_date>[0-9.]+)(<secound_date>/[0-9.])?
  // let regex = /^(?<watched>-)?(?<watchdate>(?:[\d\/]*\.){3})?(?<title>[^#\s].*?) *\((?<year>\d{4})?\) *(?:\[(?<runtime>\d+h\d+m)\])?(.*)/gm;
  // let watchdate_reg = /^(?<watched>-)?(?<watchdate>(?:[\d\/]*\.){3})?/;

  let watchdate_reg = /^(?<watched>-?)(?:(?<watchdate>(?:[.\d/]+))?\|)?/;
  //             <-- title          --> <-- year         --><--     runtime               -->
  let the_rest = /(?<title>[^#\s].*?) *\((?<year>\d{4})?\) *(?:\[(?<runtime_hm>\d+h\d+m)\])?(.*)/;

  let regex = new RegExp(watchdate_reg.source + the_rest.source, 'gm');
  let linkRegex = /(?:(?<type>[\w\() ]+): )?(?<url>http[\w+\S]+)+/gm

  //store trailer links if there are any
  let arr;
  while (arr = regex.exec(text)) {
    // console.log(arr + "\n");
    let tempMovie = {...arr.groups};
    // console.log(tempMovie);

    tempMovie.links = {};
    let links;
    while (links = linkRegex.exec(arr[6])) {
      let type = links.groups.type?.trimStart() || 'trailer';
      if (!tempMovie.links[type]) {
        tempMovie.links[type] = [];
      }
      tempMovie.links[type].push(links.groups.url);
    }

    // store the last watch date for this movie
    if (tempMovie.watchdate) {

      tempMovie.watchdate_arr = [];

      let date_arr = tempMovie.watchdate.split('/');
      // console.log("arr: ", date_arr);
      for (const date of date_arr) {
        let current = get_watch_date(date.slice(0,-1));
        tempMovie.watchdate_arr.push(current);
      }
      tempMovie.watchdate_arr.reverse();
      // console.log(tempMovie.watchdate_arr, tempMovie.title);

      tempMovie.watchdate = tempMovie.watchdate.slice(0,-1);
    }



    tempMovie.id = get_movie_id(tempMovie);
    tempMovie.watched = !!tempMovie.watched;
    movieList.push(tempMovie);
  }
  let movie_json;
  movie_json = JSON.stringify(movieList,null,' ');
  fs.writeFileSync('src/movieList.json', movie_json);

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

function get_movie_id(movie)
{
  //create and store unique id for every movie in the list
  let regRep = /[^a-z0-9]+/gi;
  let regDel = /[\?\:']+/g;
  let tempURL = `${movie.title} ${movie.year}`;
  let finalURL = tempURL.replace(regDel, "").replace(regRep, "-").toLowerCase();
  return finalURL;
}

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

async function fetch_wError(url, options)
{
  let attempts = 0;
  let response;
  while (attempts < 3) {
    response = await fetch(url, options);
    if (response.ok) return response;

    attempts += 1;
    console.log("Error: ", response.status, "retrying...");
    await new Promise(r=>setTimeout(r, attempts*1000));
  }
  console.log(`Error: unable to fetch ${url} after ${attempts} tries.`)
  return response;
}

async function get_movie_info(movie)
{
  let searchParams = {};
  searchParams.query = movie.title;
  if (movie?.year) {
    searchParams.year = movie.year;
  }

  let url = new URL("https://api.themoviedb.org/3/search/movie");
  url.search = new URLSearchParams(searchParams);

  //Search Movie
  try {
    let search_movie = await fetch_wError(url.toString(), get_options);
    let movie_info_json = await search_movie.json();
    // console.log("movie_info_json: ", movie_info_json);
    if (movie.year) {
      return movie_info_json;
    } else {
      movie.year = movie_info_json.results[0].release_date.slice(0,4);
      movie.id = get_movie_id(movie);
      console.log("Release year missing for ", movie.id);
      return movie_info_json;
    }
  } catch (error) {
    console.log(error);
  }
  // console.log(movie_info_json);

  // //Authenticate
  // fetch_wError('https://api.themoviedb.org/3/authentication', options)
  //   .then(r=>r.json())
  //   .then(re=>console.log(re))
  //   .catch(err=>console.error(err));

  // //Authenticate
  // let api = await fetch_wError('https://api.themoviedb.org/3/authentication', get_options);
  // let api_json = await api.json();
  // console.log(api_json);

  // //Details
  // let acct = await fetch_wError(`https://api.themoviedb.org/3/account/${acct_id}`, get_options);
  // let api_acct = await acct.json();
  // console.log(api_acct);

  // //Add Favorite
  // let add_fav = await fetch_wError(`https://api.themoviedb.org/3/account/${acct_id}/favorite`, post_options);
  // let api_add_fav = await add_fav.json();
  // console.log(api_add_fav);

  // //Get Favorite Movies
  // let get_fav = await fetch_wError(`https://api.themoviedb.org/3/account/${acct_id}/favorite/movies?language=fr`, get_options);
  // let api_get_fav = await get_fav.json();
  // console.log(api_get_fav);
}

async function get_movie_details(id)
{

  let url = new URL(`https://api.themoviedb.org/3/movie/${id}`);
  // url.search = new URLSearchParams(searchParams);
  let movie_details_json;
  try {
    let movie_details = await fetch_wError(url.toString(), get_options);
    movie_details_json = await movie_details.json();
    // console.log("movie_details: ", movie_details_json);
    // console.log(movie_details_json.title, ":::", movie_details_json.belongs_to_collection?.name);
    return movie_details_json;

  } catch (error) {
    console.log(error);
  }
}

async function get_movie_ratings(id)
{
  let url = new URL(`https://api.themoviedb.org/3/movie/${id}/release_dates`)
  try {
    let release_dates = await fetch_wError(url.toString(), get_options);
    // console.log("release_dates: ", release_dates);

    let ratings_json = await release_dates.json();
    let rating_by_country = ratings_json.results.map((r)=>{
      let country = r.iso_3166_1;

      let rating;
      for (const release of r.release_dates) {
        if (release.certification) {
          rating = release.certification;
          // console.log("release.cert: ", release.certification);
          // console.log("rating: ", rating);
          break;
        }
      }

      // let rating = r.release_dates[0].certification;
      let country_rating = {"country" : country, "rating" : rating}
      return country_rating;
    });

    return rating_by_country;

  } catch (error) {
    console.log(error);
  }
}

async function get_background(id, backdrop_path)
{
  if (!backdrop_path) {
    return null;
  }
  try {
    let idx = backdrop_path.lastIndexOf('.');
    let ext = backdrop_path.slice(idx+1);

    //check if image file exists locally
    if (fs.existsSync(`public/bg/${id}.${ext}`)) {
      // console.log(`${id} bg already exists...`);
      return `${id}.${ext}`;
    }

    console.log(`\n\n${id} bg doesn't exist...fetching...`);
    let url = new URL(`https://image.tmdb.org/t/p/w1280/${backdrop_path}`);
    let bg_raw = await fetch_wError(url.toString(), get_options);

    //using node.js 'node:stream' stream.Writable.toWeb()
    //to convert Write Stream to Writable stream,
    //then use ReadableStream.pipeTo() to write files out
    let bg_stream = fs.createWriteStream(`public/bg/${id}.${ext}`);
    let wb_stream = stream.Writable.toWeb(bg_stream);
    await bg_raw.body.pipeTo(wb_stream);

    // //using node.js WritableStream() to
    // //create new WritableStream from ReadableStream
    // //then use ReadableStream.pipeTo() to write files out
    // let bg_stream = fs.createWriteStream(`public/bg/${id}.${ext}`);
    // let wr_stream = new WritableStream({...bg_stream});
    // await bg_raw.body.pipeTo(bg_stream);

    // //use buffer method to create saveable image buffer for fs.writefile etc
    // let bg_arr_buff = await bg_raw.arrayBuffer();
    // let bg_buff = Buffer.from(bg_arr_buff);
    // fs.writeFileSync(`public/bg/${id}.${ext}`, bg_buff);

    return `${id}.${ext}`;
  } catch (error) {
    console.log("background: ", error, "\n\n");
  }
}

async function get_poster(id, poster_path)
{
  if (!poster_path) {
    return null;
  }
  try {

    let idx = poster_path.lastIndexOf('.');
    let ext = poster_path.slice(idx+1);

    //check if image file exists locally
    if (fs.existsSync(`public/pstr/${id}.${ext}`)) {
      // console.log(`${id} pstr already exists...`);
      return `${id}.${ext}`;
    }

    console.log(`${id} pstr doesn't exist...fetching...\n`);
    let url = new URL(`https://image.tmdb.org/t/p/w300/${poster_path}`);
    let pstr_raw = await fetch_wError(url.toString(), get_options);
    //use buffer method to create saveable image buffer for fs.writefile etc
    let pstr_arr_buff = await pstr_raw.arrayBuffer();
    let pstr_buff = Buffer.from(pstr_arr_buff);

    fs.writeFileSync(`public/pstr/${id}.${ext}`, pstr_buff);




    return `${id}.${ext}`;

  } catch (error) {
    console.log("poster: ", error);
  }
}

function get_runtime(movie_details_json)
{
  let hours = Math.floor(movie_details_json.runtime/60);
  let minutes = (movie_details_json.runtime % 60);
  if (hours > 0) {
    movie_details_json.runtime_hm = hours.toString() + "h"
                                + minutes.toString() + "m";
  } else {
    movie_details_json.runtime_hm = minutes.toString() + "m";
  }
}

function why_is_this_so_dumb(pixels, movie_bg_filename)
{
  //convert image to grayscale
  //then convert to matrix_t data_t type "src"
  //create output matrix_t "canny"
  let grayscale = convert_to_grayscale(pixels.data);
  let my_data = new jsfeat.data_t(grayscale.length, grayscale);
  let src     = new jsfeat.matrix_t(pixels.width, pixels.height, jsfeat.U8_t|jsfeat.C1_t, my_data);
  let canny   = new jsfeat.matrix_t(pixels.width, pixels.height, jsfeat.U8_t|jsfeat.C1_t);
  //"canny" edge detect the image (1 per pixel)
  jsfeat.imgproc.canny(src, canny, 0, 128);

  // //save black & white image
  // let rgba_buff = Buffer.alloc(grayscale.length*4);
  // for (let i = 0; i < grayscale.length; i++) {
  //   rgba_buff[i*4+0] = grayscale[i];
  //   rgba_buff[i*4+1] = grayscale[i];
  //   rgba_buff[i*4+2] = grayscale[i];
  //   rgba_buff[i*4+3] = 255;
  // }
  // let rawImageData = {
  //   data: rgba_buff,
  //   width: pixels.width,
  //   height: pixels.height,
  // };
  // let output_image = jpeg_js.encode(rawImageData, 100);
  // fs.writeFileSync(`public/test/${movie_bg_filename}`, output_image.data);

  // //save canny data as image
  // let canny_buff = Buffer.alloc(canny.data.length*4);
  // for (let i = 0; i < canny.data.length; i++) {
  //   canny_buff[i*4+0] = canny.data[i];
  //   canny_buff[i*4+1] = canny.data[i];
  //   canny_buff[i*4+2] = canny.data[i];
  //   canny_buff[i*4+3] = 255;
  // }
  // let cannyImageData = {
  //   data: canny_buff,
  //   width: pixels.width,
  //   height: pixels.height,
  // }
  // let output_canny = jpeg_js.encode(cannyImageData, 100);
  // fs.writeFileSync(`public/test/canny_${movie_bg_filename}`, output_canny.data);

  //add up the scores for each row
  //and store in row_scores[],
  //one row per array entry
  let stride     = pixels.width;
  let row_scores = [];
  for (let j = 0; j < pixels.height; j++) {
    let score = 0;
    for (let k = 0; k < stride; k++) {
      if (canny.data[j*stride+k] > 0) {
        score++;
      }
    }
    row_scores.push(score);
  }
  // console.log("canny_data: ", canny);
  // console.log("row_scores: ", row_scores);
  /**********************************************************/
  //add up the row scores for a range of 64 rows
  //traveling down the image one pixel row at a time
  let start_row = 0;
  let accumulator = 0;
  let accumulator_high = 0;
  for (let row = 0; row < row_scores.length; row += 1) {
    accumulator += row_scores[row];
    if (row >= 63) {
      if (accumulator > accumulator_high) {
        accumulator_high = accumulator;
        start_row = row - 63;
      }
      accumulator -= row_scores[row - 63];
    }
  }

  return start_row;
}


//takes rgba image and converts to
//grayscale 1-byte per pixel
function convert_to_grayscale(image)
{
  function luminosity_srgb(r,g,b) {
    return (0.2126*r + 0.7152*g + 0.0722*b);
  }
  function luminosity_yuv(r,g,b) {
    return (0.299*r + 0.587*g + 0.114*b);
  }
  function luminosity_sqrt(r,g,b) {
    return Math.sqrt(0.2126*r*r + 0.7152*g*g + 0.722*b*b);
  }

  let size   = image.length;
  let output = Buffer.alloc(size/4, 0);
  let out_indx = 0;
  for (let i = 0; i < size; i+=4) {
    let r = image[i+0];
    let g = image[i+1];
    let b = image[i+2];
    let a = image[i+3];
    let luminosity = Math.round(luminosity_srgb(r,g,b));
    // let luminosity = luminosity_yuv(r,g,b);
    // let luminosity = luminosity_sqrt(r,g,b);
    output[out_indx++] = luminosity;
    // image[i+0] = luminosity;
    // image[i+1] = luminosity;
    // image[i+2] = luminosity;
  }
  return output;
}

async function build_tmdb_json2()
{
  // console.log(movieJson);
  fs.mkdirSync("public/bg/",   { recursive: true });
  fs.mkdirSync("public/pstr/", { recursive: true });
  fs.mkdirSync("public/strip/", { recursive: true });

  let db_json = [];

  async function load_movie(idx) {
    let movie = movieJson[idx];
    let entry = await get_movie_info(movie);

    if (entry?.results[0]) {
      //attach tmdb movie id to local movieList.json
      movie.dbid = entry.results[0].id;

      let movie_details_json  = await get_movie_details(movie.dbid);
      let movie_ratings       = await get_movie_ratings(movie.dbid);
      let movie_bg_filename   = await get_background(movie.id, entry.results[0].backdrop_path);
      let movie_pstr_filename = await get_poster(movie.id, entry.results[0].poster_path);

      // let movie_bg_blurhash;
      if (fs.existsSync(`public/bg/${movie_bg_filename}`)) {
        try {
          // console.log("cropping ", movie_bg_filename);
            let jpeg_body = fs.readFileSync(`public/bg/${movie_bg_filename}`);
            let pixels = jpeg_js.decode(jpeg_body);

            //grayscale stuff and use "canny" edge detection
            //to pick the "most interesting" section of the background image
            let start_pos = why_is_this_so_dumb(pixels, movie_bg_filename);

            // console.log("pixels.length: ", pixels.data.length);
            // console.log("start_pos: ", start_pos);
            // console.log("pixels.data: ", pixels.data);

            //full color crop of bg art
            //based on starting position from edge detection
            let lines=[];
            let stride = pixels.width*4;
            let crop_buffer = pixels.data.subarray(start_pos*stride, start_pos*stride + stride*64);
            for (let line = 0; line < 64; line+=2) {
              let line_data = crop_buffer.subarray(
                                line*stride,
                                line*stride + stride
                              );
              lines.push(line_data);
            }

            // console.log("lines: ", lines);


            let rawImageData = {
              data: Buffer.concat(lines),
              width: pixels.width,
              height: 32,
            };

            let output_image = jpeg_js.encode(rawImageData, 50);
            fs.writeFileSync(`public/strip/${movie_bg_filename}`, output_image.data);

          } catch (error) {
          console.log(`${movie_bg_filename} : `, error);
        }
      }



      get_runtime(movie_details_json);
      get_watch_date(movie.watchdate);

      movie.runtime_m = movie_details_json.runtime;

      return {  //object with all the info I want in it
        ...entry.results[0],
        tagline:    movie_details_json.tagline,
        runtime:    movie_details_json.runtime,
        runtime_hm: movie_details_json.runtime_hm,
        collection: movie_details_json.belongs_to_collection?.name,
        ratings:    movie_ratings,
        poster:     movie_pstr_filename,
        bg:         movie_bg_filename,
        found: true
      };
    } else {
      //search does not find a movie, so just return what we know
      return {title: movie.title, year: movie.year, found: false};
    }
  }

  let number_to_load_in_parallel = 20;
  let next_idx_to_load = number_to_load_in_parallel;

  function start_loading_movie(idx) {
    let movie = movieJson[idx];
    if (!movie) return;
    movie.promise = load_movie(idx).then(r=>{
      start_loading_movie(next_idx_to_load);
      next_idx_to_load+=1;
      return r;
    });
  }
  for (let i = 0; i < number_to_load_in_parallel; i++) {
    start_loading_movie(i);
  }

  for (const movie of movieJson) {
    // console.log("promising future? ", movie.promise);
    let db_json_item = await movie.promise;
    db_json.push(db_json_item);
    delete movie.promise;
  }

  try {
    fs.writeFileSync('src/tmdbList.json', JSON.stringify(db_json,null,' '));
    fs.writeFileSync('src/movieList.json', JSON.stringify(movieJson,null,' '));
  } catch (err) {
    console.error(err);
  }
}
build_tmdb_json2();

async function build_tmdb_json()
{
  // console.log(movieJson);
  fs.mkdirSync("public/bg/",   { recursive: true });
  fs.mkdirSync("public/pstr/", { recursive: true });

  let db_json = [];
  // movieJson[0].infoPromise = get_movie_info(movieJson[0]);

  function loadInfo(idx) {
    movieJson[idx].infoPromise = get_movie_info(movieJson[idx])
          .then(r=>{
            if (idx+1 < movieJson.length) {
              loadInfo(idx+1);
            }
            return r;
          });
  }
  loadInfo(0);

  for (let index = 0; index < movieJson.length; index++) {
    // if (index+1 < movieJson.length) {
    //   movieJson[index+1].infoPromise = get_movie_info(movieJson[index+1]);
    // }
    const movie = movieJson[index];
  // for (const movie of movieJson) {
    // let entry = await get_movie_info(movie);
    console.log("promise? or not? ", movie.infoPromise);
    let entry = await movie.infoPromise;
    if (entry?.results[0]) {
      //attach tmdb movie id to local movieList.json
      movie.dbid = entry.results[0].id;

      // let movie_details_json  = await get_movie_details(movie.dbid);
      // let movie_ratings       = await get_movie_ratings(movie.dbid);
      // let movie_bg_filename   = await get_background(movie.id, entry.results[0].backdrop_path);
      // let movie_pstr_filename = await get_poster(movie.id, entry.results[0].poster_path);

      // console.log(movie_bg_filename);

      let [
        movie_details_json,
        movie_ratings,
        movie_bg_filename,
        movie_pstr_filename
      ] = await Promise.all([
          get_movie_details(movie.dbid),
          get_movie_ratings(movie.dbid),
          get_background(movie.id, entry.results[0].backdrop_path),
          get_poster(movie.id, entry.results[0].poster_path)
          ]);

      let hours = Math.floor(movie_details_json.runtime/60);
      let minutes = (movie_details_json.runtime % 60);
      if (hours > 0) {
        movie_details_json.runtime = hours.toString() + "h"
                                  + minutes.toString() + "m";
      } else {
        movie_details_json.runtime = minutes.toString() + "m";
      }

      db_json.push({...entry.results[0],
                    tagline: movie_details_json.tagline,
                    runtime: movie_details_json.runtime,
                    ratings: movie_ratings,
                    poster:  movie_pstr_filename,
                    bg:      movie_bg_filename,
                    // bg:      `${movie.id}.jpg`,
                    found: true});

      // console.log(db_json);

      //TODO: check if this works to link tmdbJson to movieJson
      // movie.tmdb_indx = db_json.length-1;
    } else {
      db_json.push({title: movie.title, year: movie.year, found: false});
      //TODO: check if this works to link tmdbJson to movieJson
      // movie.tmdb_indx = db_json.length-1;
    }
  }

  try {
    fs.writeFileSync('src/tmdbList.json', JSON.stringify(db_json,null,' '));
    fs.writeFileSync('src/movieList.json', JSON.stringify(movieJson,null,' '));
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
// build_tmdb_json();
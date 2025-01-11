"use strict";
// import {parseTriviaChat} from './twitch_chat.js'
// const parseTriviaChat = require('./twitch_chat')
// import text from './assets/movie_bgs.json'
// const fs = require('node:fs');

//got this from stackoverflow
//https://stackoverflow.com/questions/32509885/scan-folder-content-in-javascript
//doesn't work, but not sure why
function load_stuff()
{
  var dir = "/assets";
  var ext = ".gif";
  $.ajax({
    url: dir,
    success: (data)=>{
      $(data).find("a:contains("+ ext + ")")
      .each(()=>{
          let filename = this.href.replace(window.location.host, "")
          .replace("http:///", "");
          $("body").append($("<img src=" + dir + filename + "></img>"));
         });
    }
  });
}

async function play_movie_trivia()
{

  let triviaQuestions = [
    "die-hard-for-sure-sure.gif",
    "jurassic-park-samuel-l-jackson.gif",
    "kung-pow-thats-a-lot-of-nuts.gif",
    "junior-arnold-schwarzenegger.gif",
    "its-a-wonderful-life-how-do-you-do-james-stewart.gif",
    "jingle-all-the-way.gif",
    "planes-trains-and-automobiles-john-candy-devil.gif",
    "rudolph-the-red-nosed-reindeer-hermie-dentist.gif",
    "scrooged-toaster.gif",
    "spaceballs-alien-kane.gif",
    "trading-places-dan-aykroyd.gif",
  ];
  const countdownTime = 30;
  const answerTime = 15;

  const trivia = document.getElementById("trivia");
  const out = document.createElement("img");
  trivia.appendChild(out);

  let triviaTimer;
  let triviaTimeout;
  function createAnswer(index) {
    // console.log("index", index+1);
    index = Number(index);
    let answer = document.getElementById("timer");
    answer.innerText = triviaQuestions[index];

    const button = document.getElementById("answer");
    // if (button.innerText == "Answer") {
    //   button.innerText = "Next";
    // } else {
    //   button.innerText = "Answer";
    // }



    return setTimeout(()=>{


      if (button.innerText == "Next") {
        button.innerText = "Answer";
      }
      answer.innerText = countdownTime;
      createTrivia(index+1);



    }, 1000*answerTime);
  }



  function startTimer(countdown) {

    clearInterval(triviaTimer);
    let nextCountdown = new Date().getTime() + 1000 * countdown
    let timer = document.getElementById("timer");
    timer.innerText = countdown;

    const trivia = document.getElementById("trivia");




    return setInterval(()=>{
      let now = new Date().getTime();

      const answerButton = document.getElementById("answer");

      if (answerButton.innerText == "Next") {
        const index = trivia.dataset.idx;
        trivia.innerText = triviaQuestions[index]
      }




      timer.innerText = Math.floor((nextCountdown - now)%(1000*60)/1000);

      if (timer.innerText <= 0) {
        const index = document.getElementById("trivia").dataset.idx;
        clearInterval(triviaTimer);
        triviaTimeout = createAnswer(index);
      }



    }, 1000);
  }

  function createTrivia(index) {
    // console.log("index", index);
    index = Number(index);
    if (index >= triviaQuestions.length) {
      index = 0;
      //TODO: need to make "end" slide w/score
    }
    // console.log("index", index);
    out.src = `assets/${triviaQuestions[index]}`;
    trivia.dataset.idx = index;
    triviaTimer = startTimer(countdownTime);
  }

  createTrivia(0);




  let pause = document.getElementById("pause");
  pause.onclick = (e)=>{
    if (e.target.innerText == "Pause") {
      clearInterval(triviaTimer);
      e.target.innerText = "Play";
    } else {
      e.target.innerText = "Pause";
      let time = document.getElementById("timer").innerText;
      triviaTimer = startTimer(time);
    }
  }






  let answer  = document.getElementById("answer");
  answer.onclick = (e)=>{
    // let object = {a:1};
    // console.dir("dir", object);
    // console.log("log", object);

    // object.a = 2;
    // console.dir("dir", object);
    // console.log("log", object);
    // console.table("table", object);
    // console.count("count", object);

    // var people = [ 
    //   { first: 'René', last: 'Magritte', },
    //   { first: 'Chaim', last: 'Soutine', birthday: '18930113', }, 
    //   { first: 'Henri', last: 'Matisse', } 
    // ];
    // console.table({people});
    // console.log({people});


    if (triviaTimer) {
      clearInterval(triviaTimer);
    }
    // const answer = document.getElementById("answer");
    if (e.target.innerText == "Answer") {
      e.target.innerText = "Next";
      const index = document.getElementById("trivia").dataset.idx;
      triviaTimeout = createAnswer(index);
    } else {
      e.target.innerText = "Answer";
      const index = Number(document.getElementById("trivia").dataset.idx);
      clearTimeout(triviaTimeout);
      createTrivia(index+1);
    }
  }

  const prev = document.getElementById("prev");
  prev.onclick = ()=>{
    clearInterval(triviaTimer);
    let index = Number(document.getElementById("trivia").dataset.idx);
    // console.log("index", index);
    if (index-1 < 0) {
      index = triviaQuestions.length;
    }
    createTrivia(index-1);
  }

  const next = document.getElementById("next");
  next.onclick = ()=>{
    clearInterval(triviaTimer);
    let index = Number(document.getElementById("trivia").dataset.idx);
    if (index >= triviaQuestions.length) {
      index = 0;
    } else {
      index = index + 1;
    }
    createTrivia(index);
  }




}

let lastTime;
function fpsCounter() {
  let currentTime = new Date().getTime();
  let counter = document.getElementById("fps");
  counter.innerText = 1000/(currentTime-lastTime);
  lastTime = currentTime;
  requestAnimationFrame(animationCallback);
}

// play_movie_trivia();


//FrankL81: 
// you do a 
// customElements.define("trivia-game", class extends HTMLElement { 
// connectedCallback(){ //..... } ))

//BakerStaunch: 
// Yeah but I mean just have a setInterval 
// once at the start and inside the 
// interval callback check if it's
// paused or not rather than trying to 
// manage the interval itself
//BakerStaunch: 
// You can treat it like a "main loop" 
// by having a single interval 
// (or requestAnimationFrame)
//BakerStaunch: 
// btw, I'd suggest using performance.now() 
// for the time instead of Date.now() - system 
// clocks can change, performance.now() 
// is meant to be number of milliseconds 
// since the page loaded

let triviaQuestions = [
  {answer:"Die Hard",
    question:"die-hard-for-sure-sure.gif"},
  {answer:"Jurassic Park",
    question:"jurassic-park-samuel-l-jackson.gif"},
  {answer:"Kung Pow",
    question:"kung-pow-thats-a-lot-of-nuts.gif"},
  {answer:"Junior",
    question:"junior-arnold-schwarzenegger.gif"},
  {answer:"It's a Wonderful Life",
    question:"its-a-wonderful-life-how-do-you-do-james-stewart.gif"},
  {answer:"Jingle All the Way",
    question:"jingle-all-the-way.gif"},
  {answer:"Planes, Trains and Automobiles",
    question:"planes-trains-and-automobiles-john-candy-devil.gif"},
  {answer:"Rudolph the Red Nosed Reindeer", 
    question:"rudolph-the-red-nosed-reindeer-hermie-dentist.gif"},
  {answer:"Scrooged",
    question:"scrooged-toaster.gif"},
  {answer:"Spaceballs",
    question:"spaceballs-alien-kane.gif"},
  {answer:"Trading Places",
    question:"trading-places-dan-aykroyd.gif"},
];
let triviaIndex = 0;
let score = {};
let endTime;
let correctAnsIdx;
let timerState = "running";
function play_trivia()
{

  const countdownTime = 30;
  const answerTime = 15;
  let prevState;

  const trivia = document.getElementById("trivia");
  const out = document.createElement("img");
  out.src = `assets/${triviaQuestions[0].question}`;
  out.id = "question";
  trivia.appendChild(out);
  const timer   = document.getElementById("timer");
  timer.innerText = countdownTime;

  // function updateButtons() {
  //   const playBtn   = document.getElementById("pause");
  //   if (timerState === "paused") {
  //     playBtn.innerText = "Play";
  //   }
  //   if (timerState === "running") {
  //     playBtn.innerText = "Pause";
  //   }
  // }

  function updateTimer() {
    const pauseBtn = document.getElementById("pause");
    pauseBtn.innerText = "Pause";
    const answerBtn = document.getElementById("answer");
    if (answerBtn.innerText !== "Next") {
      const now = performance.now();
      timer.innerText = Math.floor((endTime - now)%(1000*60)/1000);
    }

    if (timer.innerText <= 0) {
      answerBtn.innerText = "Next";
      timer.innerText = triviaQuestions[triviaIndex].answer;
    }
    if (performance.now() > endTime + answerTime*1000) {
      //reset timer and load next trivia
      answerBtn.innerText = "Answer";
      nextTrivia();
    }
  }

  function nextTrivia() {
    //increment the trivia index
    triviaIndex += 1;
    if (triviaIndex >= triviaQuestions.length) {
      timerState = "paused";
      // clearRound();
      document.getElementById("choiceDiv").innerHTML = "";
      showScore();
      return;
    }
    //change the trivia out.src to match new index
    out.src = `assets/${triviaQuestions[triviaIndex].question}`;
    //reset for next round
    resetTimer();
    multipleChoice();
    // clearRound();
  }

  function restartTimer() {
    const countdown = document.getElementById("timer").innerText;
    if (Number(countdown)) {
      endTime = performance.now() + 1000*countdown;
    }
    timerState = "running";
  }
  function resetTimer() {
    timer.innerText = countdownTime;
    endTime = performance.now() + countdownTime*1000;
    timerState = "running";
  }

  function stateMachine() {

    if (timerState !== prevState) {
      prevState = timerState;
      // updateButtons();
    }
    if (timerState !== "paused") {
      updateTimer();
    }

    requestAnimationFrame(stateMachine);
  }

  const answerBtn = document.getElementById("answer");
  answerBtn.onclick = (e)=>{
    if (e.target.innerText === "Answer") {
      //change button text to Next
      //and show the answer in the timer label
      e.target.innerText = "Next";
      timer.innerText = triviaQuestions[triviaIndex].answer;
    } else {
    //change the button text to Answer
      e.target.innerText = "Answer";
      nextTrivia();
    }
  }
  const playBtn   = document.getElementById("pause");
  playBtn.onclick = (e)=>{
    if (timerState === "paused") {
      e.target.innerText = "Pause";
      timerState = "running";
      restartTimer();
    } else {
      e.target.innerText = "Play";
      timerState = "paused";
    }
  }
  const prevBtn   = document.getElementById("prev");
  prevBtn.onclick = ()=>{
    triviaIndex -= 1;
    if (triviaIndex < 0) {
      triviaIndex = triviaQuestions.length-1;
    }
    out.src = `assets/${triviaQuestions[triviaIndex].question}`;
    resetTimer();
    multipleChoice();
    // clearRound();
    answerBtn.innerText = "Answer";
  }
  const nextBtn   = document.getElementById("next");
  nextBtn.onclick = ()=>{
    nextTrivia();
    answerBtn.innerText = "Answer";
  }

  endTime = performance.now() + 1000*countdownTime;
  multipleChoice();
  stateMachine();
}

function createAnswers() {

  /////////////////////////////////////////////
  //QuantumApprentice
  let answers = new Set();
  let ansArr = [triviaQuestions[triviaIndex].answer];
  answers.add(triviaQuestions[triviaIndex].answer);
  while (answers.size < 4) {
    let randAnswer = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)].answer;
    if (!answers.has(randAnswer)) {
      answers.add(randAnswer);
      ansArr.push(randAnswer);
    }
  }
  let swap = Math.floor(Math.random()*4);
  let temp = ansArr[swap];
  ansArr[0] = temp;
  ansArr[swap] = triviaQuestions[triviaIndex].answer;
  correctAnsIdx = swap+1;
  // console.log(ansArr);


  /////////////////////////////////////////////
  //BakerStaunch
  let questionIndex = Math.floor(Math.random() * triviaQuestions.length);

  // let [question] = triviaQuestions.splice(questionIndex, 1); //modifies array
  let question = triviaQuestions[questionIndex]; //does not modify original array

  let answersB = Array(4);
  let answerIndex = Math.floor(Math.random()*4);
  answersB[answerIndex] = question.answer;

  for (let i = 1; i <= 3; i += 1) {
    let wrongAnswer;
    while (answersB.includes(wrongAnswer)) {
      //get another random answer and 
      //set it at index (answerIndex + i) % 4
      let rng = Math.floor(Math.random() * triviaQuestions.length);
      wrongAnswer = triviaQuestions[rng].answer;
    }
    answersB[(answerIndex + i) %4] = wrongAnswer;

  }

  // console.log(answersB)

  //Eskiminha (chatGPT)
  /////////////////////////////////////////////
  // const questions = triviaQuestions;
  // const { q, a } = { 
  // q: questions[Math.floor(Math.random() * questions.length)],
  // a: ((q, a = Array(4).fill(null),
  //       u = new Set(a[(i = Math.floor(Math.random() * 4))] = q.answer)
  //     ) => (Array(4).fill(0).forEach(
  //       (_, j) => j - i || (
  //       () => {
  //         let x;
  //         do x = questions[Math.floor(Math.random() * questions.length)].answer;
  //         while (
  //           u.has(x)
  //         );
  //         a[j] = x;
  //         u.add(x);
  //       })()),
  //     a))
  //     (questions[Math.floor(
  //       Math.random() * questions.length
  //     )])
  //   };
  //   console.log("Question:", q, "Answers:", a);
  // const ignore = null;

  //tvjosh
  /////////////////////////////////////////////
  // const ls = Array(10).fill().map((_, i) => i);
  const ls = triviaQuestions;
  const numToShuffle = 4;

  const copyLs = ls.slice().map((x, i, thisLs) => {
    if (i < numToShuffle) {
      // const k = Math.floor(Math.random() * (ls.length/numToShuffle) + i*(ls.length/numToShuffle));
      const k = Math.floor(Math.random() * (ls.length - i)) + i;
      const t = thisLs[i];
      thisLs[i] = thisLs[k];
      thisLs[k] = t;
      return thisLs[i];
    }
    return x
  }).slice(0, numToShuffle);

  // console.log(copyLs);


  /////////////////////////////////////////////
  //FrankL81
  // const Questions = triviaQuestions;
  // console.log(Questions);

  // const schuffle = (array) => array.sort(() => Math.random() < 0.5 ? 1 : -1);
  // const currentQuestion = schuffle(Questions).slice(0,4).map((e)=>e.answer);
  // // const [imgSrc,answer] = currentQuestion[0];

  // ansArr = currentQuestion;
  // console.log("ansArr", ansArr);

  //   document.getElementById("canvas").innerHTML = 
  // `<img alt="${imgSrc}" height="40px" src="${imgSrc}" /><br/> ${schuffle(currentQuestion.map(([,answer],idx) => `<button>${idx+1} ${answer}</button>`)).join("<br />")}
  // <br /><br />
  // currentAnswer is: ${answer}`;


  /////////////////////////////////////////////
  return ansArr;
}

function multipleChoice() {
  const choiceDiv = document.getElementById("choiceDiv");
  choiceDiv.innerHTML = "";

  const timeStart = performance.now();
  const ansArr = createAnswers();
  console.log("total time: ", performance.now() - timeStart);

  //create array of answer buttons - choiceBtnArr[]
  //and fill with ansArr[] answers
  let choiceBtnArr = [];
  for (let i = 0; i < 4; i++) {
    const choiceBtnDiv = document.createElement("div");
    // choiceBtnDiv.innerHTML = `<div class="choiceBtn" id=${i}></div>`
    // choiceDiv.innerHtml = `<div class="choice choice1">...</div><div class="choice choice2">...</div>`;
    choiceBtnDiv.className = "choiceBtn";
    choiceBtnDiv.id = `${i+1}`;

    const choiceAns = document.createElement("div");
    choiceAns.className = "choice";
    choiceAns.innerText = `${ansArr[i]}`;

    const choiceNum = document.createElement("div");
    choiceNum.innerText = `${i+1}`;
    choiceNum.className = "choiceNum";

    choiceBtnDiv.append(choiceNum);
    choiceBtnDiv.append(choiceAns);
    choiceBtnDiv.onclick = handleClick;

    choiceBtnArr.push(choiceBtnDiv);
  }

  //onClick for the right answer only
  //(maybe add wrong answer stuff?)
  function handleClick(e) {
    //if button has the correct answer...
    if (e.target.firstChild.data === triviaQuestions[triviaIndex].answer) {

      //change "answer" button text to match next element
      //display correct answer in timer
      const answerBtn = document.getElementById("answer");
      if (answerBtn.innerText !== "Next") {
        answerBtn.innerText = "Next";
        endTime = performance.now();
        timer.innerText = triviaQuestions[triviaIndex].answer;
        score["Me"] = score["Me"] ? (score["Me"]+=1) : 1;
      }
      // console.log("found");
    }
  }

  choiceBtnArr.map((e, i)=>{
    // e.style = `background-color: ${bgColors[i]}`;
    choiceDiv.append(e);
  });

}

function clearRound()
{
  const name = document.getElementById("twitchName");
  const chat = document.getElementById("chatMsg");
  name.innerText = "";
  chat.innerText = "";
}

play_trivia();



function showScore()
{
  const timer = document.getElementById("timer");
  timer.innerText = "";
  const title = document.getElementById("title");
  title.innerText = "Score";
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const pausBtn = document.getElementById("pause");
  const answBtn = document.getElementById("answer");
  nextBtn.disabled = true;
  prevBtn.disabled = true;
  pausBtn.disabled = true;
  // answBtn.disabled = true;
  setTimeout(()=>{
    answBtn.innerText = "Restart?";
  }, 10);
  console.log("answer:", answBtn.innerText);
  answBtn.onclick = ()=>{
    location.reload();
  }

  const trivia = document.getElementById("trivia");
  trivia.removeChild(document.getElementById("question"));
  const scoreCard = document.createElement("table");
  trivia.appendChild(scoreCard);
  scoreCard.className = "scoreCard";

  const scoreArr = Object.entries(score);
  scoreArr.sort((a, b)=>{
    return b[1]-a[1];
  });
  // console.log("score", scoreArr);
  scoreArr.forEach((e)=>{
    const row = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    td1.innerText = e[0];
    td1.className = "scoreName";

    const r = Math.floor(Math.random()*255);
    const g = Math.floor(Math.random()*255);
    const b = Math.floor(Math.random()*255);

    td1.style = `color : rgb(${r}, ${g}, ${b});`;



    td2.innerText = e[1];
    td2.className = "scoreAmount";

    row.appendChild(td1);
    row.appendChild(td2);
    scoreCard.appendChild(row);


    // const li = document.createElement("li");
    // li.innerText = e;
    // scoreCard.appendChild(li);
  });

  // console.log(Object.entries(score));
  // const li = document.createElement("li");
  // li.innerText = Object.entries(score);
  // scoreCard.appendChild(li);
  
  
}




//connect to twitch chat
const channelName        = 'quantumapprentice';
const TwitchWebSocketUrl = 'wss://irc-ws.chat.twitch.tv:443';
const maxMsgCount        = 5;
const chatBody = (document.querySelector("#ChatMessages"));
const wsTwitch = new WebSocket(TwitchWebSocketUrl);
wsTwitch.onopen = ()=>{
    console.log("chat opened");
  wsTwitch.send(`CAP REQ :twitch.tv/commands twitch.tv/tags`);
  wsTwitch.send(`NICK justinfan6969`);
  wsTwitch.send(`JOIN #${channelName}`);
  console.log('WebSocket connection opened');    //debug
}

wsTwitch.onmessage = (fullmsg) => {
  // console.log("fullmsg: ", fullmsg);
  let txt = fullmsg.data;
  // console.log("txt: ", txt);
  let name = '';
  let outmsg = '';
  let indx = 0;
  // let just_tags = '';
  // let tags_obj = {};
  // const emote_list = [];

  if (txt[0] == '@') {
    indx = txt.indexOf(' ');
    // just_tags = txt.slice(0, indx);
    indx++;
    // tags_obj = parse_tags(just_tags);
    // get_emote_list(tags_obj['emotes'], emote_list);
  }

  if (txt[indx] == ':') {
    // get the important data positions
    let pos1 = txt.indexOf('@', indx) + 1;
    let pos2 = txt.indexOf(".", pos1);
    let pos3 = txt.indexOf(`#${channelName}`)+2;
    pos3 += channelName.length + 1;

    // create strings based on those positions
    name = txt.substring(pos1, pos2).trim();

    if ((name == ":tmi")
      || (name == "justinfan6969")
      || (name.includes("@emote-only=0;"))
      || (name == ":justinfan6969"))
      { return; }

    outmsg = txt.substring(pos3).trim();
  }
  else {
    // handle pings
    // other twitch specific things should
    // be handled here too
    let pos2 = txt.indexOf(":");
    name = txt.slice(0, pos2).trim();
    outmsg = txt.slice(pos2).trim();

    if (name == 'PING') {
      // console.log('PONG ' + outmsg);
      wsTwitch.send('PONG ' + outmsg);
    }
    return;
  }

  //not running bot commands here
  if (outmsg[0] == '!') {
    return;
  }

  display_msg(name, outmsg);
  // console.log("name", name);
  // console.log("outmsg", outmsg);

}

let answered = [];
function parseTriviaChat(name, outmsg)
{
  if (triviaIndex >= triviaQuestions.length) {
    return false;
  }
  if (answered.includes(name)) {
    return false;
  }
  // console.log("outmsg: ", outmsg);
  // console.log("answer: ", correctAnsIdx);
  if (Number(outmsg) === correctAnsIdx) {
    // timerState = "paused";
    endTime = performance.now();
    score[name] = score[name] ? (score[name]+=1) : 1;
    return true;
  }
  if (outmsg.toLowerCase().indexOf(triviaQuestions[triviaIndex].answer) != -1) {

    score[name] = score[name] ? (score[name]+=1) : 1;
    // score[name] = score[name] && ++score[name] || 1;
    // console.log("score", score);
    return true;
  }
  if (!isNaN(outmsg)) {
    answered.push(name);
    return false;
  }
  return false;
}


// global msg_time to set timeouts on messages
let msg_time = 0;
// display chat message on stream
function display_msg(name, outmsg, tags_obj, emote_list)
{
  let emote;
  let chatMSG = document.createElement("div");
  // let chatMSG = document.getElementById("chatMsg");

  if (outmsg.startsWith('\x01ACTION')) {
    outmsg = outmsg.substring(7, outmsg.length - 1).trim();
    // msg_is_emote = true;

    chatMSG.classList.add('msg_is_emote');
  }

  let auth = document.createElement("div");
  // auth.classList.add("Name");
  auth.classList.add("name");

  if (tags_obj?.color) {
    // auth.style.color = tags_obj['color'];
    chatMSG.style.setProperty('--name-color', tags_obj['color']);
  }

  auth.textContent = (tags_obj?.display_name || name) + ' ';

  if (tags_obj?.emotes) {
      let parts = [];
      let end_indx = outmsg.length;

    for (let i = emote_list.length; --i >= 0; ) {
      emote = document.createElement("img");
      emote.setAttribute('src', emote_list[i].url);
      if (i!==0) {
        emote.style = 'margin-left: -14px';
      }

      let last_half = esc_html(outmsg.slice(emote_list[i].end + 1, end_indx));
      parts.unshift(last_half);
      parts.unshift(emote.outerHTML);
      end_indx = emote_list[i].start;
    }
    parts.unshift(esc_html(outmsg.slice(0, end_indx)));
    outmsg = parts.join('');
  }
  const winner = parseTriviaChat(name, outmsg);

  //option to hide chat except for
  //those who guess correctly
  const chatBody = document.getElementById("twitchChat");
  let hideChat = false;
  if (hideChat) {
    if (winner) {
      let msg = document.createElement("div");
      // msg.classList.add("Message");
      msg.classList.add("msg");
      msg.innerHTML = outmsg;

      // msg.style="background-color: white";
      msg.classList.add("winner");
      auth.classList.add("winner");

      chatMSG.append(auth, msg);
      // chat message has to be prepended to appear on bottom
      chatBody.prepend(chatMSG);
    }
  } else {
    let msg = document.createElement("div");
    // msg.classList.add("Message");
    msg.classList.add("msg");
    msg.innerHTML = outmsg;

    if (winner) {
      // msg.style="background-color: white";
      msg.classList.add("winner");
      auth.classList.add("winner");
    }

    chatMSG.append(auth, msg);
    // chat message has to be prepended to appear on bottom
    const chatBody = document.getElementById("twitchChat");
    chatBody.prepend(chatMSG);
  }

  chatMSG.classList.add("message_box");
  if (chatBody.children.length > maxMsgCount) {
    // if more than maxMsgCount, delete first message
    chatBody.lastElementChild.remove();
  }

}
interface Song{
  trackName:string;
  artistName:string;
  artworkUrl100:string;
  previewUrl:string;
}

let songs:Song[] = [];
let currentIndex = 0;

const audio = new Audio();

const API = "https://achilymusic.onrender.com";

const token = localStorage.getItem("token");

const authContainer = document.getElementById("authContainer") as HTMLDivElement;
const app = document.getElementById("app") as HTMLDivElement;

const songsContainer = document.getElementById("songsContainer") as HTMLDivElement;

const playerImg = document.getElementById("playerImg") as HTMLImageElement;
const playerTitle = document.getElementById("playerTitle") as HTMLHeadingElement;
const playerArtist = document.getElementById("playerArtist") as HTMLParagraphElement;

const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
const progress = document.getElementById("progress") as HTMLInputElement;
const volume = document.getElementById("volume") as HTMLInputElement;


function checkAuth(){

  if(token){

    authContainer.style.display = "none";
    app.style.display = "block";

    loadDefaultSongs();
  }
}

checkAuth();


async function registerUser(){

  const name = (document.getElementById("name") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  const res = await fetch(`${API}/api/auth/register`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      name,
      email,
      password
    })
  });

  const data = await res.json();

  alert(data.message);
}


async function loginUser(){

  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  const res = await fetch(`${API}/api/auth/login`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      email,
      password
    })
  });

  const data = await res.json();

  if(data.token){

    localStorage.setItem("token",data.token);
    localStorage.setItem("user",JSON.stringify(data.user));

    location.reload();

  }else{

    alert(data.message);
  }
}


function logoutUser(){

  localStorage.clear();

  location.reload();
}


async function loadDefaultSongs(){

  const res = await fetch(
    `https://itunes.apple.com/search?term=drake&entity=song&limit=20`
  );

  const data = await res.json();

  songs =
    data.results.filter((song:any)=>song.previewUrl);

  renderSongs();
}


async function searchSongsFunc(){

  const query =
    (document.getElementById("searchInput") as HTMLInputElement).value;

  const res = await fetch(
    `https://itunes.apple.com/search?term=${query}&entity=song&limit=20`
  );

  const data = await res.json();

  songs =
    data.results.filter((song:any)=>song.previewUrl);

  if(songs.length === 0){

    songsContainer.innerHTML = `
      <h2 class="empty-message">
        ❌ Song "${query}" not found
      </h2>
    `;

    return;
  }

  renderSongs();
}


function renderSongs(){

  songsContainer.innerHTML = "";

  songs.forEach((song,index)=>{

    songsContainer.innerHTML += `
      <div class="song-card fade-in
      ${index===currentIndex?"active":""}"

      onclick="playSong(${index})">

        <img src="${song.artworkUrl100}" />

        <h3>${song.trackName}</h3>

        <p>${song.artistName}</p>

        <button
        onclick="event.stopPropagation();
        addFavorite(${index})">

          ❤️ Favorite

        </button>

      </div>
    `;
  });
}


async function playSongFunc(index:number){

  currentIndex = index;

  const song = songs[index];

  audio.src = song.previewUrl;

  audio.play();

  playerImg.src = song.artworkUrl100;
  playerTitle.innerText = song.trackName;
  playerArtist.innerText = song.artistName;

  playBtn.innerText = "⏸";

  renderSongs();

  await fetch(`${API}/api/auth/recent`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":localStorage.getItem("token") || ""
    },
    body:JSON.stringify({
      song
    })
  });
}


function togglePlay(){

  if(audio.paused){

    audio.play();
    playBtn.innerText = "⏸";

  }else{

    audio.pause();
    playBtn.innerText = "▶";
  }
}

function nextSong(){

  currentIndex++;

  if(currentIndex >= songs.length){
    currentIndex = 0;
  }

  playSongFunc(currentIndex);
}

function prevSong(){

  currentIndex--;

  if(currentIndex < 0){
    currentIndex = songs.length - 1;
  }

  playSongFunc(currentIndex);
}


audio.addEventListener("ended",()=>{

  nextSong();
});


audio.addEventListener("timeupdate",()=>{

  progress.value = String(
    (audio.currentTime / audio.duration) * 100
  );
});

progress.addEventListener("input",()=>{

  audio.currentTime =
    (Number(progress.value)/100)*audio.duration;
});


volume.addEventListener("input",()=>{

  audio.volume = Number(volume.value);
});


async function addFavorite(index:number){

  const res = await fetch(`${API}/api/auth/favorite`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":localStorage.getItem("token") || ""
    },
    body:JSON.stringify({
      song:songs[index]
    })
  });

  const data = await res.json();

  alert(data.message);
}


async function removeFavorite(previewUrl:string){

  const res = await fetch(`${API}/favorite`,{
    method:"DELETE",
    headers:{
      "Content-Type":"application/json",
      "Authorization":localStorage.getItem("token") || ""
    },
    body:JSON.stringify({
      previewUrl
    })
  });

  const data = await res.json();

  alert(data.message);

  showFavorites();
}


async function showFavorites(){

  const res = await fetch(`${API}/api/auth/favorites`,{
    headers:{
      "Authorization":localStorage.getItem("token") || ""
    }
  });

  const data = await res.json();

  songs = data.favorites;

  if(songs.length === 0){

    songsContainer.innerHTML = `
      <h2 class="empty-message">
        ❤️ No favorites yet
      </h2>
    `;

    return;
  }

  songsContainer.innerHTML = "";

  songs.forEach((song,index)=>{

    songsContainer.innerHTML += `
      <div class="song-card fade-in">

        <img src="${song.artworkUrl100}" />

        <h3>${song.trackName}</h3>

        <p>${song.artistName}</p>

        <button onclick="playSong(${index})">
          ▶ Play
        </button>

        <button onclick="
        removeFavorite('${song.previewUrl}')">

          💔 Remove

        </button>

      </div>
    `;
  });
}


async function showRecent(){

  const res = await fetch(`${API}/recent`,{
    headers:{
      "Authorization":localStorage.getItem("token") || ""
    }
  });

  const data = await res.json();

  songs = data.recent;

  renderSongs();
}


(window as any).register = registerUser;
(window as any).login = loginUser;
(window as any).logout = logoutUser;

(window as any).searchSongs = searchSongsFunc;

(window as any).playSong = playSongFunc;

(window as any).togglePlay = togglePlay;
(window as any).nextSong = nextSong;
(window as any).prevSong = prevSong;

(window as any).addFavorite = addFavorite;
(window as any).showFavorites = showFavorites;
(window as any).removeFavorite = removeFavorite;

(window as any).showRecent = showRecent;
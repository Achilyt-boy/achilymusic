"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let songs = [];
let currentIndex = 0;
const audio = new Audio();
const API = "http://localhost:3000/api/auth";
const token = localStorage.getItem("token");
const authContainer = document.getElementById("authContainer");
const app = document.getElementById("app");
const songsContainer = document.getElementById("songsContainer");
const playerImg = document.getElementById("playerImg");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
function checkAuth() {
    if (token) {
        authContainer.style.display = "none";
        app.style.display = "block";
        loadDefaultSongs();
    }
}
checkAuth();
function registerUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const res = yield fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });
        const data = yield res.json();
        alert(data.message);
    });
}
function loginUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const res = yield fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = yield res.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            location.reload();
        }
        else {
            alert(data.message);
        }
    });
}
function logoutUser() {
    localStorage.clear();
    location.reload();
}
function loadDefaultSongs() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`https://itunes.apple.com/search?term=drake&entity=song&limit=20`);
        const data = yield res.json();
        songs =
            data.results.filter((song) => song.previewUrl);
        renderSongs();
    });
}
function searchSongsFunc() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = document.getElementById("searchInput").value;
        const res = yield fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=20`);
        const data = yield res.json();
        songs =
            data.results.filter((song) => song.previewUrl);
        if (songs.length === 0) {
            songsContainer.innerHTML = `
      <h2 class="empty-message">
        ❌ Song "${query}" not found
      </h2>
    `;
            return;
        }
        renderSongs();
    });
}
function renderSongs() {
    songsContainer.innerHTML = "";
    songs.forEach((song, index) => {
        songsContainer.innerHTML += `
      <div class="song-card fade-in
      ${index === currentIndex ? "active" : ""}"

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
function playSongFunc(index) {
    return __awaiter(this, void 0, void 0, function* () {
        currentIndex = index;
        const song = songs[index];
        audio.src = song.previewUrl;
        audio.play();
        playerImg.src = song.artworkUrl100;
        playerTitle.innerText = song.trackName;
        playerArtist.innerText = song.artistName;
        playBtn.innerText = "⏸";
        renderSongs();
        yield fetch(`${API}/recent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token") || ""
            },
            body: JSON.stringify({
                song
            })
        });
    });
}
function togglePlay() {
    if (audio.paused) {
        audio.play();
        playBtn.innerText = "⏸";
    }
    else {
        audio.pause();
        playBtn.innerText = "▶";
    }
}
function nextSong() {
    currentIndex++;
    if (currentIndex >= songs.length) {
        currentIndex = 0;
    }
    playSongFunc(currentIndex);
}
function prevSong() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = songs.length - 1;
    }
    playSongFunc(currentIndex);
}
audio.addEventListener("ended", () => {
    nextSong();
});
audio.addEventListener("timeupdate", () => {
    progress.value = String((audio.currentTime / audio.duration) * 100);
});
progress.addEventListener("input", () => {
    audio.currentTime =
        (Number(progress.value) / 100) * audio.duration;
});
volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});
function addFavorite(index) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/favorite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token") || ""
            },
            body: JSON.stringify({
                song: songs[index]
            })
        });
        const data = yield res.json();
        alert(data.message);
    });
}
function removeFavorite(previewUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/favorite`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token") || ""
            },
            body: JSON.stringify({
                previewUrl
            })
        });
        const data = yield res.json();
        alert(data.message);
        showFavorites();
    });
}
function showFavorites() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/favorites`, {
            headers: {
                "Authorization": localStorage.getItem("token") || ""
            }
        });
        const data = yield res.json();
        songs = data.favorites;
        if (songs.length === 0) {
            songsContainer.innerHTML = `
      <h2 class="empty-message">
        ❤️ No favorites yet
      </h2>
    `;
            return;
        }
        songsContainer.innerHTML = "";
        songs.forEach((song, index) => {
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
    });
}
function showRecent() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${API}/recent`, {
            headers: {
                "Authorization": localStorage.getItem("token") || ""
            }
        });
        const data = yield res.json();
        songs = data.recent;
        renderSongs();
    });
}
window.register = registerUser;
window.login = loginUser;
window.logout = logoutUser;
window.searchSongs = searchSongsFunc;
window.playSong = playSongFunc;
window.togglePlay = togglePlay;
window.nextSong = nextSong;
window.prevSong = prevSong;
window.addFavorite = addFavorite;
window.showFavorites = showFavorites;
window.removeFavorite = removeFavorite;
window.showRecent = showRecent;
//# sourceMappingURL=script.js.map
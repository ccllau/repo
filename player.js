const user = "berosee";
const repo = "repo";

let songs = [];
let names = [];
let index = 0;
const audio = new Audio();

// 카테고리 로드 함수
async function loadCategory(folder) {
    setActiveButton(folder);

    const api = `https://api.github.com/repos/${user}/${repo}/contents/${folder}`;
    try {
        const res = await fetch(api);
        const data = await res.json();

        songs = [];
        names = [];
        let html = "";

        if (Array.isArray(data)) {
            data.forEach((file) => {
                if (file.name.endsWith(".mp3") || file.name.endsWith(".flac")) {
                    const url = `https://cdn.jsdelivr.net/gh/${user}/${repo}@main/${folder}/${file.name}`;
                    songs.push(url);
                    names.push(file.name);
                    
                    // 테이블 행(tr) 형태로 리스트 생성
                    const idx = songs.length - 1;
                    html += `<tr id="song-${idx}" onclick="playSong(${idx})"><td>${file.name}</td></tr>`;
                }
            });
            document.getElementById("listTable").innerHTML = html;
        }
    } catch (e) {
        console.error("데이터 로드 실패:", e);
    }
}

function setActiveButton(folderId) {
    const buttons = document.querySelectorAll('.menu button');
    buttons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(folderId);
    if (activeBtn) activeBtn.classList.add('active');
}

// 노래 재생 함수
function playSong(i) {
    index = i;
    audio.src = songs[index];
    audio.play();
    document.getElementById("labelTitle").textContent = names[index];
    updateUI();
}

function updateUI() {
    const rows = document.querySelectorAll("#listTable tr");
    rows.forEach((row, k) => {
        row.classList.toggle("playing", k === index);
    });
}

// 재생/일시정지 토글
document.getElementById("btnPlayWrap").onclick = function() {
    if (!audio.src && songs.length > 0) {
        playSong(0);
    } else {
        audio.paused ? audio.play() : audio.pause();
    }
};

// 프로그레스 바 및 시간 업데이트
audio.ontimeupdate = function() {
    if (audio.duration) {
        const cur = audio.currentTime;
        const dur = audio.duration;
        document.getElementById("curTime").textContent = formatTime(cur);
        document.getElementById("durTime").textContent = formatTime(dur);
        document.getElementById("progFill").style.width = (cur / dur * 100) + "%";
    }
};

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m.toString().padStart(2, '0') + ":" + s.toString().padStart(2, '0');
}

audio.onplay = () => { document.getElementById("btnIcon").textContent = "Ⅱ"; };
audio.onpause = () => { document.getElementById("btnIcon").textContent = "▶"; };
audio.onended = () => nextSong();

function nextSong() { index = (index + 1) % songs.length; playSong(index); }
function prevSong() { index = (index - 1 + songs.length) % songs.length; playSong(index); }
function randomSong() { index = Math.floor(Math.random() * songs.length); playSong(index); }

// 이전/다음 버튼 연결
document.getElementById("btnPrev").onclick = prevSong;
document.getElementById("btnNext").onclick = nextSong;

// 프로그레스 바 클릭 시 이동
document.getElementById("progArea").onclick = function(e) {
    if (audio.duration) {
        audio.currentTime = (e.offsetX / this.clientWidth) * audio.duration;
    }
};
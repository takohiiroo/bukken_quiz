let correctAnswer = 0;
let round = 1;
let totalRounds = 5;
let playerCount = 2;
let playerNames = {};
let scores = {};
let currentUrl = '';
let bukkenName = '';
let gameMode = 'multi';

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const logo = document.getElementById("logo");
    if (logo) {
      logo.style.animation = "fuwafuwa 3s ease-in-out infinite";
    }
  }, 2000);
});

const bglight = document.getElementById('start-button');
bglight.addEventListener("mouseover", () => {
    document.getElementById('enter-screen').style.backgroundColor = 'transparent';
});
bglight.addEventListener("mouseleave", () => {
    document.getElementById('enter-screen').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
});

function enterGame() {
    const fade = document.getElementById('fade');
    document.getElementById('enter-screen').style.display = 'none';

    fade.classList.add('fade-in');
    setTimeout(() => {
        const logo = document.getElementById("logo");
        logo.style.height = "5rem";
        logo.style.top = "0";
        logo.style.left = "50%";
        logo.style.transform = "translate(-50%, 0)";
        logo.style.animation = "none";
        document.getElementById('select-screen').style.display = 'block';
    
        fade.classList.remove('fade-in');
        fade.classList.add('fade-out');
        setTimeout(() => {
            fade.classList.remove('fade-out');
        }, 600);
    }, 800);
}


const selectScreen = document.getElementById('haikei');

let targetX = 0.5;
let targetY = 0.5;
let currentX = 0.5;
let currentY = 0.5;

document.addEventListener('mousemove', (e) => {
  targetX = e.clientX / window.innerWidth;
  targetY = e.clientY / window.innerHeight;
});

function animateBackground() {
  // 慣性だけ残す（中央に戻す処理は削除！）
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  const moveX = (currentX - 0.5) * 10;
  const moveY = (currentY - 0.5) * 10;

  selectScreen.style.backgroundPosition = `calc(50% + ${moveX}%) calc(50% + ${moveY}%)`;

  requestAnimationFrame(animateBackground);
}

animateBackground();

function updatePlayerCount(count) {
    playerCount = count;
    const offlineButtons = document.getElementById('offline-buttons');
    const roundButtons = document.getElementById('round-buttons');

    offlineButtons.style.transform = 'translateX(-50%)';
    offlineButtons.style.opacity = 0;
    roundButtons.style.display = 'block';

    setTimeout(() => {
        offlineButtons.style.display = 'none';
        roundButtons.style.transform = 'translateX(0)';
        roundButtons.style.opacity = 1;
    }, 300);
}

function updateRoundCount(count) {
    totalRounds = count;
    const roundContainer = document.getElementById('round-hyouji');
    roundContainer.innerHTML = `${totalRounds}ラウンド`;
    const playerContainer = document.getElementById('player-inputs');
    playerContainer.innerHTML = '';

    const roundButtons = document.getElementById('round-buttons');
    const selectButtons = document.getElementById('select-buttons');

    for (let i = 0; i < playerCount; i++) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="text" id="player-${i}-name" placeholder="プレイヤー${i + 1}" oninput="updateNameLabel(${i})">`;
        playerContainer.appendChild(label);
        playerContainer.appendChild(document.createElement('br'));
    }

    roundButtons.style.opacity = 0;

    setTimeout(() => {
        roundButtons.style.display = 'none';
        setTimeout(() => {
            roundButtons.style.transform = 'translateX(-50%)';
            selectButtons.style.display = 'block';
            selectButtons.style.transform = 'translateX(0)';
            setTimeout(() => {
                selectButtons.style.opacity = 1;
            }, 10);
        }, 10);
    }, 500);
}

function modeSelect() {
    const selectButtons = document.getElementById('select-buttons');
    const modeButtons = document.getElementById('mode-buttons');

    selectButtons.style.transform = 'translateX(-50%)';
    selectButtons.style.opacity = 0;
    modeButtons.style.display = 'block';
    
    setTimeout(() => {
        selectButtons.style.display = 'none';
        modeButtons.style.transform = 'translateX(0)';
        modeButtons.style.opacity = 1;
    }, 300);
}

function offlinePlayers() {
    const modeButtons = document.getElementById('mode-buttons');
    const offlineButtons = document.getElementById('offline-buttons');

    modeButtons.style.transform = 'translateX(-50%)';
    modeButtons.style.opacity = 0;
    offlineButtons.style.display = 'block';

    setTimeout(() => {
        modeButtons.style.display = 'none';
        offlineButtons.style.transform = 'translateX(0)';
        offlineButtons.style.opacity = 1;
    }, 300);
}

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function startGame() {
    const names = {};
    for (let i = 0; i < playerCount; i++) {
        const name = document.getElementById(`player-${i}-name`).value.trim();
        names[`P${i}`] = name || `P${i + 1}`;
    }
    playerNames = names;

    gameMode = (playerCount === 1) ? 'single' : 'multi';

    scores = {};
    for (let key in playerNames) {
        scores[key] = 0;
    }

    round = 1;
    document.getElementById('select-screen').style.display = 'none';
    document.getElementById('final-result').style.display = 'none';
    document.getElementById('logo').style.display = 'none';

    startRound();
}

function startRound() {
    showLoading();
    document.getElementById('result').innerText = '';
    document.getElementById('next-round-btn').style.display = 'none';
    document.getElementById('kettei_btn').style.display = 'block';

    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('round-info').innerText = `第 ${round} ラウンド`;

    const answerContainer = document.getElementById('player-answers');
    answerContainer.innerHTML = '';

    for (let i = 0; i < playerCount; i++) {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${playerNames[`P${i}`]}の予想</h3>
            <input type="number" id="answer-${i}" placeholder="賃料 + 管理費（円）">
        `;
        answerContainer.appendChild(div);
    }

    fetch('/quiz/api/get_bukken/')
        .then(response => response.json())
        .then(data => {
            hideLoading();
            correctAnswer = data.answer;
            currentUrl = data.data_room.url;
            bukkenName = data.data_home.name;

            const imgUrls = data.data_room.img_urls.split(',');
            const carouselContainer = document.getElementById('image-carousel');
            carouselContainer.innerHTML = '';

            let currentImageIndex = 0;
            const images = [];

            imgUrls.forEach((url, index) => {
                const img = document.createElement('img');
                img.src = url.trim();
                img.alt = `物件画像${index + 1}`;
                img.classList.add('carousel-image');
                if (index === 0) img.style.display = 'block';
                else img.style.display = 'none';
                images.push(img);
                carouselContainer.appendChild(img);
            });

            document.getElementById('carousel-prev').onclick = () => {
                images[currentImageIndex].style.display = 'none';
                currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                images[currentImageIndex].style.display = 'block';
            };

            document.getElementById('carousel-next').onclick = () => {
                images[currentImageIndex].style.display = 'none';
                currentImageIndex = (currentImageIndex + 1) % images.length;
                images[currentImageIndex].style.display = 'block';
            };

            const info = `
                <p id="bukken_mei">${bukkenName}</p><br>
                住所: ${data.data_home.address}<br>
                最寄り駅: ${data.data_home.station}<br>
                築年数: ${data.data_home.age}<br>
                階数: ${data.data_room.room_floor}<br>
                間取り: ${data.data_room.layout}<br>
                面積: ${data.data_room.size}<br>
                <iframe
                    loading="lazy"
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=${data.data_home.address}&output=embed">
                </iframe>
            `;
            document.getElementById('bukken-info').innerHTML = info;
        })
        .catch(err => {
            hideLoading();
            alert("エラーが発生しました。")
        });
}

function submitBothAnswers() {
    const answers = {};
    const diffs = {};
    let allAnswered = true;

    // ▼ プレイヤーごとの予想値と誤差を取得
    for (let i = 0; i < playerCount; i++) {
        const input = document.getElementById(`answer-${i}`);
        const value = parseInt(input.value);
        if (isNaN(value)) {
            allAnswered = false;
        }
        answers[`P${i}`] = value;
        diffs[`P${i}`] = Math.abs(value - correctAnswer);
    }

    if (!allAnswered) {
        alert("すべてのプレイヤーが金額を入力してください！");
        return;
    }

    document.getElementById('kettei_btn').style.display = 'none';

    // ▼ 最小差を持つ勝者を判定
    const sorted = Object.entries(diffs).sort((a, b) => a[1] - b[1]);
    const winnerKey = sorted[0][0];
    const minDiff = sorted[0][1];

    // ▼ 各プレイヤーの結果を構築
    let extraHTML = '';
    for (let i = 0; i < playerCount; i++) {
        const key = `P${i}`;
        const name = playerNames[key];
        const diff = diffs[key];
        let resultText = `${name}の差: <span class="diff_price">${diff.toLocaleString()}</span> 円`;

        // ▼ コメントタグの追加
        if (diff === 0) {
            resultText = `<span class="perfect"></span>` + resultText;
            scores[key] = Math.max(0, scores[key] - 30000); // 回復
        } else if (diff <= 5000) {
            resultText = `<span class="great"></span>` + resultText;
            scores[key] = Math.max(0, scores[key] - 10000); // 小回復
        }

        if (key !== winnerKey) {
            const damage = (diff - minDiff) * round;
            scores[key] += damage;
            resultText += ` → <span class="seikai">${damage.toLocaleString()} ダメージ！</span>`;
        } else {
            resultText += ` → <span class="seikai">勝利！</span>`;
        }

        resultText += `<br><span class="so-damage">${name}の総ダメージ: ${scores[key].toLocaleString()}</span><br><br>`;
        extraHTML += resultText;
    }

    // ▼ 正解表示（1文字ずつアニメーション）
    const formattedAnswer = correctAnswer.toLocaleString();
    const digits = formattedAnswer.split('').map((char, i) =>
        `<span class="digit" id="digit-${i}" style="visibility:hidden">${char}</span>`
    ).join('');

    document.getElementById('result').innerHTML =
        `<span class="seikaiha">正解は</span>
        <span class="seikai">${digits}</span>
        <span class="seikaiha">円！</span><br>
        <div id="after-reveal" style="opacity: 0; transition: opacity 2s;"></div>`;

    formattedAnswer.split('').reverse().forEach((_, i) => {
        setTimeout(() => {
            const originalIndex = formattedAnswer.length - 1 - i;
            const el = document.getElementById(`digit-${originalIndex}`);
            if (el) el.style.visibility = 'visible';
        }, i * 900);
    });

    // ▼ 結果表示（正解後）
    setTimeout(() => {
        const afterReveal = document.getElementById('after-reveal');
        afterReveal.innerHTML = extraHTML +
            `<br><span class="diff_price">物件はこちら</span><br><a href="${currentUrl}" target="_blank">${bukkenName}</a>`;
        afterReveal.style.opacity = 1;
        document.getElementById('next-round-btn').style.display = 'inline-block';
    }, formattedAnswer.length * 900 + 1000);
}

function proceedToNextRound() {
    round++;
    if (round > totalRounds) {
        endGame();
    } else {
        startRound();
    }
}


function endGame() {
    document.getElementById('quiz-area').style.display = 'none';
    const resultDiv = document.getElementById('final-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<h2>ゲーム終了！</h2>`;

    let minScore = Infinity;
    let winners = [];

    for (let i = 0; i < playerCount; i++) {
        const key = `P${i}`;
        const name = playerNames[key];
        const score = scores[key];
        resultDiv.innerHTML += `<p>${name}の総ダメージ: <strong>${score.toLocaleString()}</strong></p>`;

        if (score < minScore) {
            minScore = score;
            winners = [name];
        } else if (score === minScore) {
            winners.push(name);
        }
    }

    // ▼ 勝者表示
    let winnerText = '';
    if (winners.length === 1) {
        winnerText = `🎉 <strong>${winners[0]}</strong> の勝ち！`;
    } else {
        winnerText = `🤝 引き分け！<br>勝者: ${winners.join('、')}`;
    }

    resultDiv.innerHTML += `<h3 id="winner">${winnerText}</h3>`;
    resultDiv.innerHTML += `<button onclick="retryGame()">もう一度プレイする</button>`;
}

function retryGame() {
    document.getElementById('select-screen').style.display = 'block';
    document.getElementById('final-result').style.display = 'none';
}


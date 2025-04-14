let correctAnswer = 0;
let round = 1;
let totalRounds = 5;
let playerCount = 2;
let playerNames = {};
let scores = {};
let currentUrl = '';
let bukkenName = '';
let gameMode = 'multi';

function updatePlayerCount() {
    const count = parseInt(document.getElementById('player-count').value);
    playerCount = count;
    const container = document.getElementById('player-inputs');
    container.innerHTML = '';

    for (let i = 0; i < playerCount; i++) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="text" id="player-${i}-name" placeholder="P${i + 1}" oninput="updateNameLabel(${i})">`;
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
    }
}

function updateNameLabel(index) {
    const value = document.getElementById(`player-${index}-name`).value.trim();
    document.getElementById(`p${index}-placeholder`).innerText = value || `P${index + 1}`;
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
    totalRounds = parseInt(document.getElementById('round-count').value);

    scores = {};
    for (let key in playerNames) {
        scores[key] = 0;
    }

    round = 1;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('final-result').style.display = 'none';

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
        }, i * 200);
    });

    // ▼ 結果表示（正解後）
    setTimeout(() => {
        const afterReveal = document.getElementById('after-reveal');
        afterReveal.innerHTML = extraHTML +
            `<br><span class="diff_price">物件はこちら</span><br><a href="${currentUrl}" target="_blank">${bukkenName}</a>`;
        afterReveal.style.opacity = 1;
        document.getElementById('next-round-btn').style.display = 'inline-block';
    }, formattedAnswer.length * 200 + 1000);
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
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('final-result').style.display = 'none';
}


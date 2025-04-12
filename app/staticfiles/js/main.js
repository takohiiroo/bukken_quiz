let correctAnswer = 0;
let round = 1;
let totalRounds = 5;
let scores = { A: 0, B: 0 };
let playerNames = { A: 'Aさん', B: 'Bさん' };
let currentUrl = '';
let bukkenName = '';

function updateNameLabel(player) {
    const value = document.getElementById(`player-${player.toLowerCase()}-name`).value.trim();
    document.getElementById(`${player.toLowerCase()}-placeholder`).innerText = value || `${player}さん`;
}

function startGame() {
    const nameA = document.getElementById('player-a-name').value.trim();
    const nameB = document.getElementById('player-b-name').value.trim();
    playerNames.A = nameA || 'Aさん';
    playerNames.B = nameB || 'Bさん';

    totalRounds = parseInt(document.getElementById('round-count').value);

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('final-result').style.display = 'none';
    round = 1;
    scores = { A: 0, B: 0 };
    startRound();
}

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}


function startRound() {
    showLoading();
    document.getElementById('result').innerText = '';
    document.getElementById('next-round-btn').style.display = 'none';
    document.getElementById('answer-a').value = '';
    document.getElementById('answer-b').value = '';

    document.getElementById('kettei_btn').style.display = 'block';
    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('round-info').innerText = `第 ${round} ラウンド`;

    document.getElementById('player-a-label').innerText = `${playerNames.A}の予想`;
    document.getElementById('player-b-label').innerText = `${playerNames.B}の予想`;

    // 読み込みインジケーター表示
    document.getElementById('bukken-info').innerHTML = '';

    fetch('/quiz/api/get_bukken/')
        .then(response => response.json())
        .then(data => {
            hideLoading();
            correctAnswer = data.answer;
            currentUrl = data.data_room.url;
            bukkenName = data.data_home.name;

            const imgUrls = data.data_room.img_urls.split(',');
            
            const carouselContainer = document.getElementById('image-carousel');
            carouselContainer.innerHTML = '';  // 前回の画像をクリア
            
            imgUrls.forEach((url, index) => {
                const img = document.createElement('img');
                img.src = url.trim();
                img.alt = `物件画像${index + 1}`;
                img.classList.add('carousel-image');
                if (index !== 0) img.style.display = 'none'; // 最初以外は非表示
                carouselContainer.appendChild(img);
            });
            
            let currentImageIndex = 0;
            
            carouselContainer.innerHTML = '';
            
            const images = [];
            
            imgUrls.forEach((url, index) => {
                const img = document.createElement('img');
                img.src = url.trim();
                img.alt = `物件画像${index + 1}`;
                img.classList.add('carousel-image');
                if (index === 0) img.style.display = 'block';
                images.push(img);
                carouselContainer.appendChild(img);
            });
            
            // 前後ボタンの処理
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
    const inputA = parseInt(document.getElementById('answer-a').value);
    const inputB = parseInt(document.getElementById('answer-b').value);

    if (isNaN(inputA) || isNaN(inputB)) {
        alert("両方のプレイヤーが金額を入力してください！");
        return;
    }

    document.getElementById('kettei_btn').style.display = 'none';

    const diffA = Math.abs(inputA - correctAnswer);
    const diffB = Math.abs(inputB - correctAnswer);

    let kachimake = '';
    let round_bonus = '';
    let point = '';

    const pointsA = round * diffA;
    const pointsB = round * diffB;

    if (diffA - diffB > 0) {
        point = `${diffA} - ${diffB}で<span class="diff_price">${diffA - diffB}ポイント</span><br>`;
        round_bonus = `ラウンドボーナス<span class="diff_price">${round}倍</span>で<br>`;
        kachimake = `<span class="seikai">${playerNames.A}</span><span class="diff_price">に</span><span class="seikai">${pointsA - pointsB}ダメージ！</span><br>`;
        if (scores.B >= (pointsA - pointsB)){
            scores.B -= (pointsA - pointsB);
        } else if (scores.B === 0) {
            scores.A += (pointsA - pointsB);
        } else {
            scores.B = 0;
            scores.A += (pointsA - pointsB) - scores.B;
        };
    } else if (diffA - diffB < 0){
        point = `${diffB} - ${diffA}で<span class="diff_price">${diffB - diffA}ポイント</span><br>`;
        round_bonus = `ラウンドボーナス<span class="diff_price">${round}倍</span>で<br>`;
        kachimake = `<span class="seikai">${playerNames.B}</span><span class="diff_price">に</span><span class="seikai">${pointsB - pointsA}ダメージ！</span><br>`;
        if (scores.A >= (pointsB - pointsA)){
            scores.A -= (pointsB - pointsA);
        } else if (scores.A === 0) {
            scores.B += (pointsB - pointsA);
        } else {
            scores.A = 0;
            scores.B += (pointsB - pointsA) - scores.A;
        };
    } else {
        point = `${diffB} - ${diffA}で<span class="diff_price">${diffB - diffA}ポイント</span><br>`;
        kachimake = `<span class="seikai">引き分け！</span><br>`;
    };

    // 数字部分を桁ごとに分割
    const formattedAnswer = correctAnswer.toLocaleString();
    const digits = formattedAnswer.split('').map((char, i) =>
        `<span class="digit" id="digit-${i}" style="visibility:hidden">${char}</span>`
    ).join('');

    // 先に表示するHTML
    document.getElementById('result').innerHTML = `
        <span class="seikaiha">正解は</span>
        <span class="seikai">${digits}</span>
        <span class="seikaiha">円！</span><br>
        <div id="after-reveal" style="opacity: 0; transition: opacity 2s; margin-top: 0;"></div>
    `;

    // 数字を1文字ずつ表示
// 配列を反転させてから処理
    formattedAnswer.split('').reverse().forEach((_, i) => {
        setTimeout(() => {
            const originalIndex = formattedAnswer.length - 1 - i; // 元のインデックス計算
            const el = document.getElementById(`digit-${originalIndex}`);
            if (el) el.style.visibility = 'visible';
        }, i * 1000);
    });

    // 最後の数字表示完了後にその他の表示
    setTimeout(() => {
        const afterReveal = document.getElementById('after-reveal');
        let extraHTML = `
            ${playerNames.A}の差: <span class="diff_price">${diffA.toLocaleString()}</span> 円<br>
            ${playerNames.B}の差: <span class="diff_price">${diffB.toLocaleString()}</span> 円<br>
            ${point}
            ${round_bonus}
            ${kachimake}
            <br><span class="diff_price">物件はこちら</span><br>
            <a href="${currentUrl}" target="_blank">${bukkenName}</a><br>
            <br><span class="so-damage">${playerNames.A}の総ダメージ: ${scores.A}</span><br>
            <span class="so-damage">${playerNames.B}の総ダメージ: ${scores.B}</span>
        `;

        // コメント表示追加
        const commentTag = (diff) => {
            if (diff === 0) return `<span class="perfect"></span>`;
            if (diff < 5000) return `<span class="great"></span>`;
            if (diff < 10000) return `<span class="good"></span>`;
            if (diff < 50000) return `<span class="soso"></span>`;
            return `<span class="bad"></span>`;
        };

        extraHTML = extraHTML.replace(
            `${playerNames.A}の差:`,
            `${commentTag(diffA)}${playerNames.A}の差:`
        );
        extraHTML = extraHTML.replace(
            `${playerNames.B}の差:`,
            `${commentTag(diffB)}${playerNames.B}の差:`
        );

        afterReveal.innerHTML = extraHTML;
        afterReveal.style.opacity = 1;
        document.getElementById('next-round-btn').style.display = 'inline-block';
    }, formattedAnswer.length * 1000 + 500); // 表示終わりから0.5秒後

    document.getElementById('next-round-btn').style.display = 'inline-block';
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
    document.getElementById('final-result').style.display = 'block';

    document.getElementById('score-a').innerText = `${playerNames.A}の合計ポイント: ${scores.A}`;
    document.getElementById('score-b').innerText = `${playerNames.B}の合計ポイント: ${scores.B}`;

    let winnerText;
    if (scores.A < scores.B) {
        winnerText = `🎉 ${playerNames.A} の勝ち！`;
    } else if (scores.B < scores.A) {
        winnerText = `🎉 ${playerNames.B} の勝ち！`;
    } else {
        winnerText = "🤝 引き分け！";
    }

    document.getElementById('winner').innerText = winnerText;
}

function retryGame() {
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('final-result').style.display = 'none';
}



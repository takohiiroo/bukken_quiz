let correctAnswer = 0;
let round = 1;
let totalRounds = 5;
let scores = { A: 0, B: 0 };
let playerNames = { A: 'Aさん', B: 'Bさん' };

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

            const info = `
                物件名: ${data.data_home.name}<br>
                住所: ${data.data_home.address}<br>
                最寄り駅: ${data.data_home.station}<br>
                築年数: ${data.data_home.age}<br>
                階数: ${data.data_room.room_floor}<br>
                間取り: ${data.data_room.layout}<br>
                面積: ${data.data_room.size}
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

    const diffA = Math.abs(inputA - correctAnswer);
    const diffB = Math.abs(inputB - correctAnswer);

    const pointsA = round * diffA;
    const pointsB = round * diffB;

    scores.A += pointsA;
    scores.B += pointsB;

    document.getElementById('result').innerHTML = `
        正解は ${correctAnswer} 円！<br>
        ${playerNames.A} の差: ${diffA} 円 → ${pointsA} ダメージ<br>
        ${playerNames.B} の差: ${diffB} 円 → ${pointsB} ダメージ
    `;

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



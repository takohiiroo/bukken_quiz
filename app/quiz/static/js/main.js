let correctAnswer = 0;
let round = 1;
let turn = 0; // 0 = A, 1 = B
let totalTurns = 0;
let scores = { A: 0, B: 0 };

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    startTurn();
}

function startTurn() {
    document.getElementById('result').innerText = '';
    document.getElementById('answer-input').value = '';

    const player = turn === 0 ? 'A' : 'B';
    document.getElementById('player-turn').innerText = `${player}さんのターン（ラウンド ${round}）`;

    fetch('/quiz/api/get_bukken/')
        .then(response => response.json())
        .then(data => {
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
            document.getElementById('quiz-area').style.display = 'block';
        });
}

function submitAnswer() {
    const input = document.getElementById('answer-input').value;
    const userAnswer = parseInt(input);
    if (isNaN(userAnswer)) {
        alert("数字を入力してください！");
        return;
    }

    const diff = Math.abs(userAnswer - correctAnswer);
    const player = turn === 0 ? 'A' : 'B';
    const points = round * diff;

    scores[player] += points;
    document.getElementById('result').innerText =
        `正解は ${correctAnswer} 円！${player}さんの差は ${diff} 円 → ${points}ポイント加算！`;

    totalTurns += 1;

    if (turn === 1) {
        round += 1;
    }

    if (totalTurns >= 10) {
        endGame();
    } else {
        turn = (turn + 1) % 2;
        setTimeout(startTurn, 2500); // 次のターンへ（ちょっと待ってから切り替え）
    }
}

function endGame() {
    document.getElementById('quiz-area').style.display = 'none';
    document.getElementById('final-result').style.display = 'block';

    document.getElementById('score-a').innerText = `Aさんの合計ポイント: ${scores.A}`;
    document.getElementById('score-b').innerText = `Bさんの合計ポイント: ${scores.B}`;

    let winnerText;
    if (scores.A < scores.B) {
        winnerText = "🎉 Aさんの勝ち！";
    } else if (scores.B < scores.A) {
        winnerText = "🎉 Bさんの勝ち！";
    } else {
        winnerText = "🤝 引き分け！";
    }

    document.getElementById('winner').innerText = winnerText;
}


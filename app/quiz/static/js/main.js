let correctAnswer = 0;

function startQuiz() {
    fetch('/quiz/api/get_bukken/')
        .then(response => response.json())
        .then(data => {
            correctAnswer = data.answer;

            const info = `
                物件名: ${data.data_home.name}<br>
                住所: ${data.data_home.address}<br>
                最寄り駅: ${data.data_home.station}<br>
                築年数: ${data.data_home.age}<br>
                階数: ${data.data_room.floor}<br>
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
    const diff = Math.abs(userAnswer - correctAnswer);
    document.getElementById('result').innerText =
        `正解は ${correctAnswer} 円！ あなたの差は ${diff} 円でした。`;
}


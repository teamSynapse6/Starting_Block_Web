const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

async function loadQuestionSet() {
  try {
    const filePath = path.join(__dirname, '../questionset.json');
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('질문 세트를 불러오는 중 오류가 발생했습니다:', error);
    return {};
  }
}

app.get('/questions/:setId', async (req, res) => {
  const questionSets = await loadQuestionSet();
  const setId = req.params.setId;
  const questions = questionSets[setId];

  if (questions) {
    res.json(questions);
  } else {
    res.status(404).send('질문 세트를 찾을 수 없습니다.');
  }
});

function saveAnswers(setId, answers) {
  const filename = `answers_${setId}.json`;
  const filePath = path.join(__dirname, '../answers', filename);

  fs.writeFile(filePath, JSON.stringify(answers, null, 2), (err) => {
    if (err) {
      console.error('답변을 저장하는데 오류가 발생했습니다:', err);
    } else {
      console.log(`답변이 저장되었습니다: ${filename}`);
    }
  });
}


app.post('/submit/:setId', (req, res) => {
  const setId = req.params.setId;
  const answers = req.body;
  saveAnswers(setId, answers);
  res.send('답변이 저장되었습니다.');
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행중입니다.`);
});

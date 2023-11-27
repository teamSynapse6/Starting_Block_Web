import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function QuestionPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const params = useParams();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/questions/${params.setId}`);
        setQuestions(response.data);
      } catch (error) {
        console.error('질문을 불러오는데 실패했습니다.', error);
      }
    };

    loadQuestions();
  }, [params.setId]);

  const handleAnswerChange = (questionKey, value) => {
    setAnswers({ ...answers, [questionKey]: value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`http://localhost:3001/submit/${params.setId}`, answers);
      alert('답변이 제출되었습니다.');
    } catch (error) {
      console.error('답변 제출에 실패했습니다.', error);
    }
  };

  return (
    <div>
      <h1>질문 페이지</h1>
      {questions.map((question, index) => {
        const questionKey = Object.keys(question)[0];
        return (
          <div key={index}>
            <h3>{question[questionKey]}</h3>
            <textarea
              onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
            ></textarea>
          </div>
        );
      })}
      <button onClick={handleSubmit}>제출</button>
    </div>
  );
}

export default QuestionPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './QuestionPageStyles.css';

function QuestionPage() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const params = useParams();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/questions/${params.setId}`);
        const data = response.data;
        setTitle(data.title);
        setQuestions(data.questions);
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
    <div className="question-page-container">
      <h1>질문 페이지</h1>
      <h2>{title}</h2>
      {questions.map((question, index) => {
        const questionKey = Object.keys(question)[0];
        return (
          <div key={index} className="question-item">
            <h3>{question[questionKey]}</h3>
            <textarea
              onChange={(e) => handleAnswerChange(questionKey, e.target.value)}
              className="question-textarea"
            ></textarea>
          </div>
        );
      })}
      <button onClick={handleSubmit} className="submit-button">제출</button>
    </div>
  );
}

export default QuestionPage;
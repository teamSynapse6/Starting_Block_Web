import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './QuestionPageStyles.css';
import './Constants/Font_style.css';

function QuestionPage() {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [requestions, setRequestions] = useState([]);
  const [newquestions, setNewQuestions] = useState([]);
  const [answers, setAnswers] = useState({ requestionAnswers: {}, newquestionAnswers: {} });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const params = useParams();
  const [expandedRequestion, setExpandedRequestion] = useState(null);
  const [expandedNewQuestion, setExpandedNewQuestion] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [clickedReQuestions, setClickedReQuestions] = useState({});
  const [clickedNewQuestions, setClickedNewQuestions] = useState({});


  // 재발송 질문 클릭 처리 함수
  const handleReQuestionClick = (questionKey) => {
    setClickedReQuestions({
      ...clickedReQuestions,
      [questionKey]: true // 질문이 클릭되면 항상 true로 설정
    });
  };

  // 신규 질문 클릭 처리 함수
  const handleNewQuestionClick = (questionKey) => {
    setClickedNewQuestions({
      ...clickedNewQuestions,
      [questionKey]: true // 신규 질문이 클릭되면 항상 true로 설정
    });
  };

  // '재발송 질문' 토글 함수
  const toggleRequestion = (questionKey) => {
    if (expandedRequestion === questionKey) {
      setExpandedRequestion(null);
    } else {
      setExpandedRequestion(questionKey);
    }
  };

  // '신규 질문' 토글 함수
  const toggleNewQuestion = (questionKey) => {
    if (expandedNewQuestion === questionKey) {
      setExpandedNewQuestion(null);
    } else {
      setExpandedNewQuestion(questionKey);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const loadQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/questions/${params.setId}`);
        const data = response.data;
        setTitle(data.title);
        setAddress(data.address); // 추가된 주소 상태
        setNewQuestions(data.newquestions);
        setRequestions(data.requestions); // 추가된 재발송 질문 상태
      } catch (error) {
        console.error('질문을 불러오는데 실패했습니다.', error);
      }
    };

    loadQuestions();

    return () => window.removeEventListener('resize', handleResize);
  }, [params.setId]);

  const handleAnswerChange = (questionType, questionKey, value) => {
    // 기존 답변 상태 업데이트
    const newAnswers = {
      ...answers,
      [questionType]: { ...answers[questionType], [questionKey]: value }
    };

    // 답변 상태 업데이트
    setAnswers(newAnswers);

    // 입력된 텍스트가 있을 경우, 'answered' 상태를 true로 설정
    if (value.trim() !== '') {
      if (questionType === 'requestionAnswers') {
        setClickedReQuestions({ ...clickedReQuestions, [questionKey]: true });
      } else if (questionType === 'newquestionAnswers') {
        setClickedNewQuestions({ ...clickedNewQuestions, [questionKey]: true });
      }
    }
  };


  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000); // 토스트 메시지는 3초 후에 사라집니다.
  };


  const saveAnswer = (questionKey) => {
    // questionKey를 기반으로 질문 유형을 결정합니다.
    const questionType = questionKey in answers.requestionAnswers ? 'requestionAnswers' : 'newquestionAnswers';
    const answer = answers[questionType][questionKey]?.trim();

    if (!answer) {
      showToast('답변을 입력해주세요.'); // 답변이 비어 있을 경우 메시지를 표시합니다.
    } else {
      // 답변을 게시합니다.
      axios.post(`http://localhost:3001/submit/${params.setId}`, {
        requestionAnswers: answers.requestionAnswers,
        newquestionAnswers: answers.newquestionAnswers
      })
        .then(() => {
          showToast('답변이 저장되었습니다.'); // 성공 메시지를 표시합니다.
        })
        .catch((error) => {
          console.error('답변 저장에 실패했습니다', error);
          showToast('답변 저장에 실패했습니다.'); // 에러 메시지를 표시합니다.
        });
    }
  };

  const submitResendRequest = async (questionKey, questionType) => {
    try {
      // 질문 유형에 따라 적절한 답변 상태를 업데이트
      const updatedAnswers = {
        ...answers[questionType],
        [questionKey]: '재발송 예정'
      };

      // 즉시 업데이트된 답변 상태를 서버에 전송합니다.
      const response = await axios.post(`http://localhost:3001/submit/${params.setId}`, {
        requestionAnswers: questionType === 'requestionAnswers' ? updatedAnswers : answers.requestionAnswers,
        newquestionAnswers: questionType === 'newquestionAnswers' ? updatedAnswers : answers.newquestionAnswers
      });

      // 성공적으로 저장된 후, 전역 상태를 업데이트합니다.
      setAnswers({
        ...answers,
        [questionType]: updatedAnswers
      });

      // 성공 토스트 메시지 표시
      showToast('이후 해당 질문을 재발송 하겠습니다.');
    } catch (error) {
      console.error('재발송 요청에 실패했습니다.', error);
      // 실패 토스트 메시지 표시
      showToast('재발송 요청에 실패했습니다.');
    }
  };



  const saveAllAnswers = async (event) => {
    // 스크롤 방지 함수(만약 버튼 눌렀을 때 스크롤 되는 오류 발생하면 사용할 것)
    //event.preventDefault();
    // 모든 답변이 완료되었는지 확인
    const incompleteReQuestions = requestions.filter((question) => {
      const questionKey = Object.keys(question)[0];
      const answer = answers.requestionAnswers[questionKey]?.trim();
      const clicked = clickedReQuestions[questionKey];
      // 답변이 비어 있고 '다음에 답하기' 버튼도 눌리지 않았을 경우 포함
      return !answer && !clicked;
    });

    const incompleteNewQuestions = newquestions.filter((question) => {
      const questionKey = Object.keys(question)[0];
      const answer = answers.newquestionAnswers[questionKey]?.trim();
      const clicked = clickedNewQuestions[questionKey];
      // 답변이 비어 있고 '다음에 답하기' 버튼도 눌리지 않았을 경우 포함
      return !answer && !clicked;
    });

    const totalIncompleteQuestions = incompleteReQuestions.length + incompleteNewQuestions.length;

    if (totalIncompleteQuestions > 0) {
      // 답변이 입력되지 않은 질문에 대해 "다음에 답하기"와 동일한 답변으로 설정하여 저장
      const updatedReAnswers = {};
      incompleteReQuestions.forEach((question) => {
        const questionKey = Object.keys(question)[0];
        updatedReAnswers[questionKey] = '재발송 예정';
      });
      const updatedNewAnswers = {};
      incompleteNewQuestions.forEach((question) => {
        const questionKey = Object.keys(question)[0];
        updatedNewAnswers[questionKey] = '재발송 예정';
      });

      // 수정된 답변을 기존 답변 상태에 병합
      const mergedReAnswers = { ...answers.requestionAnswers, ...updatedReAnswers };
      const mergedNewAnswers = { ...answers.newquestionAnswers, ...updatedNewAnswers };

      // 답변을 질문 순서와 동일한 순서로 저장
      const sortedReAnswers = {};
      requestions.forEach((question) => {
        const questionKey = Object.keys(question)[0];
        sortedReAnswers[questionKey] = mergedReAnswers[questionKey] || '';
      });

      const sortedNewAnswers = {};
      newquestions.forEach((question) => {
        const questionKey = Object.keys(question)[0];
        sortedNewAnswers[questionKey] = mergedNewAnswers[questionKey] || '';
      });

      // 답변 저장
      try {
        await axios.post(`http://localhost:3001/submit/${params.setId}`, {
          requestionAnswers: sortedReAnswers,
          newquestionAnswers: sortedNewAnswers
        });
        alert(`답변이 제출되었습니다.\n답변이 없는 ${totalIncompleteQuestions}개의 질문은 다음날 재발송드립니다.`);
      } catch (error) {
        console.error('답변 제출에 실패했습니다.', error);
      }
    } else {
      try {
        // 모든 답변이 완료되었을 경우 답변 저장
        await axios.post(`http://localhost:3001/submit/${params.setId}`, answers);
        alert('답변이 제출되었습니다.');
      } catch (error) {
        console.error('답변 제출에 실패했습니다.', error);
      }
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
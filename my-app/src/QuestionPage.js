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
  const [answeredReQuestions, setAnsweredReQuestions] = useState({});
  const [answeredNewQuestions, setAnsweredNewQuestions] = useState({});


  //API 연동을 위한 기본 정의
  const baseUrl = "http://localhost:3001";


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

  useEffect(() => { //사이트 접속 시 데이터 초기 데이터 불러오는 메소드
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const loadQuestions = async () => {
      try {
        const response = await axios.get(`${baseUrl}/questions/${params.setId}`);
        const data = response.data;
        setTitle(data.title);
        setAddress(data.address);

        // 변경된 데이터 구조에 따라 질문과 답변을 처리
        const { requestions, newquestions } = data.questions;
        const loadedAnswers = data.answers;

        setRequestions(Object.entries(requestions).map(([key, value]) => ({ [key]: value })));
        setNewQuestions(Object.entries(newquestions).map(([key, value]) => ({ [key]: value })));
        setAnswers(loadedAnswers);
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


  const saveAnswer = (questionKey, questionType) => {
    const answer = answers[questionType][questionKey]?.trim();

    if (!answer) {
      showToast('답변을 입력해주세요.');
    } else {
      axios
        .post(`${baseUrl}/submit/${params.setId}`, {
          requestionAnswers: answers.requestionAnswers,
          newquestionAnswers: answers.newquestionAnswers,
        })
        .then(() => {
          showToast('답변이 저장되었습니다.');
          if (questionType === 'requestionAnswers') {
            setAnsweredReQuestions((prev) => ({ ...prev, [questionKey]: true }));
          } else {
            setAnsweredNewQuestions((prev) => ({ ...prev, [questionKey]: true }));
          }
        })
        .catch((error) => {
          console.error('답변 저장에 실패했습니다', error);
          showToast('답변 저장에 실패했습니다.');
        });
    }
  };
  const submitResendRequest = async (questionKey, questionType) => {
    try {
      const updatedAnswers = {
        ...answers[questionType],
        [questionKey]: '재발송 예정',
      };

      const response = await axios.post(`${baseUrl}/submit/${params.setId}`, {
        requestionAnswers: questionType === 'requestionAnswers' ? updatedAnswers : answers.requestionAnswers,
        newquestionAnswers: questionType === 'newquestionAnswers' ? updatedAnswers : answers.newquestionAnswers,
      });

      setAnswers({
        ...answers,
        [questionType]: updatedAnswers,
      });

      showToast('이후 해당 질문을 재발송 하겠습니다.');
      if (questionType === 'requestionAnswers') {
        setAnsweredReQuestions((prev) => ({ ...prev, [questionKey]: true }));
      } else {
        setAnsweredNewQuestions((prev) => ({ ...prev, [questionKey]: true }));
      }
    } catch (error) {
      console.error('재발송 요청에 실패했습니다.', error);
      showToast('재발송 요청에 실패했습니다.');
    }
  };



  const saveAllAnswers = async (event) => {
    // 스크롤 방지 함수(만약 버튼 눌렀을 때 스크롤 되는 오류 발생하면 사용할 것)
    event.preventDefault();

    // '재발송 예정'으로 표시된 질문의 수를 초기화합니다.
    let unansweredReQuestionsCount = 0;
    let unansweredNewQuestionsCount = 0;

    // '재발송 예정'으로 표시된 답변 상태를 검사하고, 이를 카운트합니다.
    Object.values(answers.requestionAnswers).forEach(answer => {
      if (answer === '재발송 예정') {
        unansweredReQuestionsCount++;
      }
    });

    Object.values(answers.newquestionAnswers).forEach(answer => {
      if (answer === '재발송 예정') {
        unansweredNewQuestionsCount++;
      }
    });

    // 답변이 작성되지 않은 질문의 수를 추가합니다.
    requestions.forEach((question) => {
      const questionKey = Object.keys(question)[0];
      if (!answers.requestionAnswers[questionKey]) {
        unansweredReQuestionsCount++;
      }
    });

    newquestions.forEach((question) => {
      const questionKey = Object.keys(question)[0];
      if (!answers.newquestionAnswers[questionKey]) {
        unansweredNewQuestionsCount++;
      }
    });

    // 모든 답변이 완료되었는지 확인합니다.
    const totalUnansweredQuestions = unansweredReQuestionsCount + unansweredNewQuestionsCount;

    if (totalUnansweredQuestions > 0) {
      // 답변이 없는 질문에 대해 "다음에 답하기"와 동일한 답변으로 설정하여 저장
      const updatedReAnswers = {};
      const updatedNewAnswers = {};

      // '재발송 예정'으로 표시된 질문에 대해 답변을 설정합니다.
      requestions.forEach((question) => {
        const questionKey = Object.keys(question)[0];
        if (!answers.requestionAnswers[questionKey]) {
          updatedReAnswers[questionKey] = '재발송 예정';
        }
      });

      newquestions.forEach((question) => {
        const questionKey = Object.keys(question)[0];
        if (!answers.newquestionAnswers[questionKey]) {
          updatedNewAnswers[questionKey] = '재발송 예정';
        }
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
        await axios.post(`${baseUrl}/submit/${params.setId}`, {
          requestionAnswers: sortedReAnswers,
          newquestionAnswers: sortedNewAnswers
        });
        alert(`답변이 제출되었습니다. \n답변이 없는 ${totalUnansweredQuestions}개의 질문은 다음날 재발송드립니다.`);
      } catch (error) {
        console.error('답변 제출에 실패했습니다.', error);
      }
    } else {
      try {
        // 모든 답변이 완료되었을 경우 답변 저장
        await axios.post(`${baseUrl}/submit/${params.setId}`, answers);
        alert('답변이 제출되었습니다.');
      } catch (error) {
        console.error('답변 제출에 실패했습니다.', error);
      }
    }
  };


  function autoResizeTextarea(event) {
    event.target.style.height = 'auto'; // 높이를 자동으로 설정하여 현재 텍스트 높이에 맞게 조정합니다.
    event.target.style.height = `${event.target.scrollHeight}px`; // scrollHeight를 사용하여 실제 텍스트 높이에 맞게 높이를 설정합니다.
  }


  return (
    <>
      <div className="header">
        <div className="header-container">
          <a href="#" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/images/logo.png" alt="Logo" className="logo" />
            <span className="title">스타팅블록</span>
          </a>
        </div>
      </div>

      <div className="nav">
        <div className="nav-container">
          <div className="intro">
            <div className="intro">
              <div className="notice">
                <div className="notice-text">안녕하세요, 담당자님<br /><span style={{ fontFamily: 'S-CoreDream-5Medium' }}>'{title}'</span> 공고의 질문을 요약해서 보내드려요</div>
                <a href={address} target="_blank" rel="noreferrer noopener" className="notice-button">
                  {windowWidth <= 600 ? "공고 >" : "공고 확인하기 >"}
                </a>
              </div>
              <div className="sub-text">저희 서비스는 중복된 질문들을 제외 처리하고, 유사 답변 제공 이후 담당자님께 질문 리스트를 발송합니다.<br />
                담당자님의 중복되고, 많은 질문으로 인한 피로도를 낮추고자 합니다.</div>
            </div>
          </div>
          <div className="banner">
            <img src="/images/chr_starter.png" alt="Character Starter" className="banner-image" />
            <div className="banner-text">
              답변의 확인이 필요한 질문은 <span style={{ color: '#5E8BFF' }}>다음에 답하기</span>를 눌러주세요.<br />
              <span style={{ color: '#5E8BFF' }}>다음날 발송되는 질문 메일에 추가하여 발송해드립니다:)</span>
            </div>
          </div>
        </div>
      </div>


      <div className="main">
        {/* 재발송 질문 */}
        <div>
          <h1>재발송 질문</h1>
          <div className="header-container-list">
            <div className="header-textbox-question">질문</div>
            <div className="divider-line"></div>
            <div className="header-textbox-answer">답변</div>
          </div>
          {requestions.map((question, index) => {
            const questionKey = Object.keys(question)[0];
            const isExpanded = expandedRequestion === questionKey;
            const currentAnswer = answers.requestionAnswers[questionKey] || ''; // 현재 질문에 대한 답변
            const isClicked = clickedReQuestions[questionKey]; // 이 질문이 클릭되었는지 확인
            const hasAnswer = !!answers.requestionAnswers[questionKey]; // 이 부분에서 답변 상태를 확인합니다.
            return (
              <div key={index} className="container">
                <div className="question-container">
                  <div
                    className={`list question-list ${isExpanded && 'hide'}`}
                    data-pair={question.pairId}
                    onClick={() => {
                      toggleRequestion(questionKey);
                      handleReQuestionClick(questionKey);
                    }}>
                    <div className={`item question-item ${isClicked ? 'clicked' : ''}`}>
                      <span className="icon"></span>
                      <span>{question[questionKey]}</span>
                    </div>
                  </div>
                  <div
                    className={`question-detail-content ${isExpanded ? 'show' : 'hide'}`}
                    onClick={() => toggleRequestion(questionKey)}>
                    <span className="detail-icon"></span>
                    <span>{question[questionKey]}</span>
                    {/* 답변 목록 */}
                  </div>
                </div>
                <div className="answer-container">
                  <div
                    key={index}
                    className={`list answer-list ${isExpanded && 'hide'}`}
                    data-pair={question.pairId}
                    onClick={() => {
                      toggleRequestion(questionKey);
                      handleReQuestionClick(questionKey);
                    }}>
                    <div className={`item answer-item ${hasAnswer ? 'answeredReQuestions' : ''} ${currentAnswer === '재발송 예정' ? 'pending' : ''}`}>
                      <span className="text-content">{currentAnswer || '답변을 입력해주세요'}</span>
                    </div>
                  </div>
                  <div className={`answer-detail-content ${isExpanded ? 'show' : 'hide'}`}>
                    <textarea
                      disabled={answeredReQuestions[questionKey]}
                      value={currentAnswer !== '재발송 예정' ? currentAnswer : ''} // textarea의 value를 상태와 연결
                      onChange={(e) => handleAnswerChange('requestionAnswers', questionKey, e.target.value)}
                      onInput={autoResizeTextarea}
                      className="answer-textarea"
                      placeholder="답변을 입력해주세요."></textarea>
                    <div
                      onClick={() => !answeredReQuestions[questionKey] && submitResendRequest(questionKey, 'requestionAnswers')}
                      className={`button next-mail ${answeredReQuestions[questionKey] ? 'disabled' : ''}`}
                    >
                      다음에 답하기
                    </div>
                    <div
                      onClick={() => !answeredReQuestions[questionKey] && currentAnswer.trim() && saveAnswer(questionKey, 'requestionAnswers')}
                      className={`button answer-complete ${answeredReQuestions[questionKey] || !currentAnswer.trim() ? 'disabled' : ''}`}
                    >
                      답변 완료
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <hr />
        <div id="toast-container" className={`toast-container ${toast.show ? 'show' : ''}`}>
          {toast.message}
        </div>


        {/* 신규 질문 */}
        <div>
          <h1>신규 질문</h1>
          <div className="header-container-list">
            <div className="header-textbox-question">질문</div>
            <div className="divider-line"></div>
            <div className="header-textbox-answer">답변</div>
          </div>
          {newquestions.map((question, index) => {
            const questionKey = Object.keys(question)[0];
            const isExpanded = expandedNewQuestion === questionKey;
            const currentAnswer = answers.newquestionAnswers[questionKey] || ''; // 현재 질문에 대한 답변
            const isClicked = clickedNewQuestions[questionKey]; // 클릭 상태 확인
            const hasAnswer = !!answers.newquestionAnswers[questionKey]; // 이 부분에서 답변 상태를 확인합니다.
            return (
              <div key={index} className="container">
                <div className="question-container">
                  <div
                    className={`list question-list ${isExpanded && 'hide'}`}
                    data-pair={question.pairId}
                    onClick={() => {
                      toggleNewQuestion(questionKey); // 토글 함수 호출
                      handleNewQuestionClick(questionKey); // 클릭 처리 함수 호출
                    }}>
                    <div className={`question-item ${isClicked ? 'clicked' : ''}`}>
                      <span className="icon"></span>
                      <span>{question[questionKey]}</span>
                    </div>
                  </div>
                  <div
                    className={`question-detail-content ${isExpanded ? 'show' : 'hide'}`}
                    onClick={() => toggleNewQuestion(questionKey)}>
                    <span className="detail-icon"></span>
                    <span>{question[questionKey]}</span>
                    {/* 답변 목록 */}
                  </div>
                </div>
                <div className="answer-container">
                  <div
                    key={index}
                    className={`list answer-list ${isExpanded && 'hide'}`}
                    data-pair={question.pairId}
                    onClick={() => {
                      toggleNewQuestion(questionKey)
                      handleNewQuestionClick(questionKey);
                    }}>
                    <div className={`item answer-item ${hasAnswer ? 'answeredNewQuestions' : ''} ${currentAnswer === '재발송 예정' ? 'pending' : ''}`}>
                      <span className="text-content">{currentAnswer || '답변을 입력해주세요'}</span>
                    </div>
                  </div>
                  <div className={`answer-detail-content ${isExpanded ? 'show' : 'hide'}`}>
                    <textarea
                      disabled={answeredNewQuestions[questionKey]}
                      value={currentAnswer !== '재발송 예정' ? currentAnswer : ''} // textarea의 value를 상태와 연결
                      onChange={(e) => handleAnswerChange('newquestionAnswers', questionKey, e.target.value)}
                      className="answer-textarea"
                      placeholder="답변을 입력해주세요."></textarea>
                    <div
                      onClick={() => !answeredNewQuestions[questionKey] && submitResendRequest(questionKey, 'newquestionAnswers')}
                      className={`button next-mail ${answeredNewQuestions[questionKey] ? 'disabled' : ''}`}
                    >
                      다음에 답하기
                    </div>
                    <div
                      onClick={() => !answeredNewQuestions[questionKey] && currentAnswer.trim() && saveAnswer(questionKey, 'newquestionAnswers')}
                      className={`button answer-complete ${answeredNewQuestions[questionKey] || !currentAnswer.trim() ? 'disabled' : ''}`}
                    >
                      답변 완료
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="done">
        <div className="done-container">
          <div className="done-text1">소중한 답변 감사합니다</div>
          <div className="done-text2">답변은 지원자들의 궁금증을 해결할 뿐 아닌, 중복 질문에 대한 답변 데이터로 활용됩니다.</div>
          <div className="done-text3">중복된 질문들을 한데 모아, 담당자님의 편의가 상승하는 앞날을 응원하겠습니다</div>
          <button onClick={saveAllAnswers} className="done-button">모든 답변 완료</button>
        </div>
      </div>

      <div className="footer">
        <div className="footer-container">
          <div className="newsletter">
            <div className="newsletter-text">스타팅블록</div>
            <div className="social-icons">
              <a href="https://www.facebook.com/withstartingblock?mibextid=LQQJ4d" target="_blank" rel="noreferrer noopener">
                <img src="/images/facebook_logo.png" alt="Facebook" className="social-icon" />
              </a>
              <a href="https://www.instagram.com/startingblock_?igsh=YjUxZHh6OTNnZDVp&utm_source=qr" target="_blank" rel="noreferrer noopener">
                <img src="/images/instagram_logo.png" alt="Instagram" className="social-icon" />
              </a>
            </div>
          </div>

          <div className="credits">
            <div className="credits-container">
              <div className="credits-container1">
                2024 스타팅블록. All rights reserved.
              </div>
              <div className="credits-container2">
                <a href="#">이용약관</a>
                <a href="#">개인정보처리방침</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default QuestionPage;
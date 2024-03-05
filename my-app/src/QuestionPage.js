import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './QuestionPageStyles.css';
import './Constants/Font_style.css';

function QuestionPage() {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [requestions, setRequestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({ requestionAnswers: {}, questionAnswers: {} });
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
        setQuestions(data.questions);
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
      } else if (questionType === 'questionAnswers') {
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
    const questionType = questionKey in answers.requestionAnswers ? 'requestionAnswers' : 'questionAnswers';
    const answer = answers[questionType][questionKey]?.trim();
    

    if (!answer) {
      showToast('답변을 입력해주세요.'); // 답변이 비어 있을 경우 메시지를 표시합니다.
    } else {
      // 답변을 게시합니다.
      axios.post(`http://localhost:3001/submit/${params.setId}`, {
        requestionAnswers: answers.requestionAnswers,
        questionAnswers: answers.questionAnswers
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


  const handleSubmit = async () => {
    try {
      await axios.post(`http://localhost:3001/submit/${params.setId}`, answers);
      alert('답변이 제출되었습니다.');
    } catch (error) {
      console.error('답변 제출에 실패했습니다.', error);
    }
  };

  const submitResendRequest = async (questionKey, questionType) => {
    try {
      // 질문 유형에 따라 적절한 답변 상태를 업데이트
      const updatedAnswers = {
        ...answers[questionType],
        [questionKey]: '재발송 예정 질문입니다.'
      };

      // 즉시 업데이트된 답변 상태를 서버에 전송합니다.
      const response = await axios.post(`http://localhost:3001/submit/${params.setId}`, {
        requestionAnswers: questionType === 'requestionAnswers' ? updatedAnswers : answers.requestionAnswers,
        questionAnswers: questionType === 'questionAnswers' ? updatedAnswers : answers.questionAnswers
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
                    <div className={`item answer-item ${hasAnswer ? 'answered' : ''}`}>
                      <span className="text-content">{currentAnswer || '답변을 입력해주세요'}</span>
                    </div>
                  </div>
                  <div className={`answer-detail-content ${isExpanded ? 'show' : 'hide'}`}>
                    <textarea
                      value={currentAnswer} // textarea의 value를 상태와 연결
                      onChange={(e) => handleAnswerChange('requestionAnswers', questionKey, e.target.value)}
                      onInput={autoResizeTextarea}
                      className="answer-textarea"
                      placeholder="답변을 입력해주세요."></textarea>
                    <div onClick={() => submitResendRequest(questionKey, 'requestionAnswers')} className="button next-mail">다음에 답하기</div>
                    <div onClick={() => saveAnswer(questionKey)} className="button answer-complete">답변 완료</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 구분 선 */}
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
          {questions.map((question, index) => {
            const questionKey = Object.keys(question)[0];
            const isExpanded = expandedNewQuestion === questionKey;
            const currentAnswer = answers.questionAnswers[questionKey] || ''; // 현재 질문에 대한 답변
            const isClicked = clickedNewQuestions[questionKey]; // 클릭 상태 확인
            const hasAnswer = !!answers.questionAnswers[questionKey]; // 이 부분에서 답변 상태를 확인합니다.
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
                    <div className={`item answer-item ${hasAnswer ? 'answered' : ''}`}>
                      <span className="text-content">{currentAnswer || '답변을 입력해주세요'}</span>
                    </div>
                  </div>
                  <div className={`answer-detail-content ${isExpanded ? 'show' : 'hide'}`}>
                    <textarea
                      value={currentAnswer} // textarea의 value를 상태와 연결
                      onChange={(e) => handleAnswerChange('questionAnswers', questionKey, e.target.value)}
                      className="answer-textarea"
                      placeholder="답변을 입력해주세요."></textarea>
                    <div onClick={() => submitResendRequest(questionKey, 'questionAnswers')} className="button next-mail">다음에 답하기</div>
                    <div onClick={() => saveAnswer(questionKey)} className="button answer-complete">답변 완료</div>
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
          <div onClick={handleSubmit} className="done-button">모든 답변 완료</div>
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
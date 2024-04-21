import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './QuestionPageStyles.css';
import './Constants/Font_style.css';



function QuestionPage() {
  const params = useParams();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [oldquestions, setoldquestions] = useState([]);
  const [newquestions, setNewQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [expandedoldquestion, setExpandedoldquestion] = useState(null);
  const [expandedNewQuestion, setExpandedNewQuestion] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [clickedoldQuestions, setClickedoldQuestions] = useState({});
  const [clickedNewQuestions, setClickedNewQuestions] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [isAllAnswersSubmitted, setIsAllAnswersSubmitted] = useState(false);


  //API 연동을 위한 기본 정의
  // const baseUrl = "https://api.startingblock.co.kr";
  const baseUrl = "http://127.0.0.1:3001";


  useEffect(() => { // 사이트 접속 시 데이터 초기 데이터 불러오는 메소드
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const loadQuestions = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/web/question/${params.announcementId}`);
        const data = response.data;
        setTitle(data.announcementName);
        setAddress(data.detailUrl);

        // 변경된 데이터 구조에 따라 질문을 처리
        setoldquestions(data.oldQuestions); // oldQuestions 데이터 설정
        setNewQuestions(data.newQuestions); // newQuestions 데이터 설정
      } catch (error) {
        console.error('질문을 불러오는데 실패했습니다.', error);
      }
    };

    loadQuestions();

    return () => window.removeEventListener('resize', handleResize);
  }, [params.announcementId]); // params.setId를 params.announcementId로 변경



  // 개별 답변을 저장하는 함수
  const saveIndividualAnswer = async (questionId, content) => {
    try {
      const response = await axios.post(`${baseUrl}/api/v1/web/answer`, {
        questionId: questionId,
        content: content
      });
      if (response.status === 201) {
        showToast('답변이 저장되었습니다.');
        setAnsweredQuestions(prev => ({ ...prev, [questionId]: true }));
      } else {
        // 예상치 못한 응답 코드를 받았을 때의 처리
        showToast('답변 저장 중 예상치 못한 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('답변 저장에 실패했습니다:', error);
      showToast('답변 저장에 실패했습니다.');
    }
  };

  // 개별 답변을 저장하는 함수
  const saveToResend = async (questionId) => {
    try {
      const response = await axios.post(`${baseUrl}/api/v1/web/answer`, {
        questionId: questionId,
        content: null
      });
      if (response.status === 201) {
        showToast('이후 해당 질문을 재발송 하겠습니다.');
        setAnsweredQuestions(prev => ({ ...prev, [questionId]: true }));
        setQuestionAnswers(prev => ({ ...prev, [questionId]: '재발송 예정' }));
      } else {
        showToast('재발송 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('재발송 요청에 실패했습니다.', error);
      showToast('재발송 요청에 실패했습니다');
    }
  };

  // 모든 답변을 저장하는 함수
  const saveAllAnswers = async (event) => {
    event.preventDefault(); //스크롤 방지를 위한 기본 이벤트 방지

    let notAnswered = [];

    // 모든 답변을 수집합니다.
    const allAnswers = [];
    // oldquestions와 newquestions의 모든 질문에 대해 반복
    [...oldquestions, ...newquestions].forEach(question => {
      const questionId = question.questionId;
      const answerContent = questionAnswers[questionId] || '';

      // 답변이 비어있지 않다면 allAnswers 배열에 추가
      if (answerContent.trim() !== '') {
        allAnswers.push({
          questionId: questionId,
          content: answerContent
        });
      } else {
        // 답변이 없는 경우, content에 null을 넣고 배열에 추가 및 재발송 예정
        allAnswers.push({
          questionId: questionId,
          content: null
        });
        notAnswered.push(questionId);
      }
    });
    // 모든 답변이 수집되었다면 API 호출을 수행합니다.
    try {
      const response = await axios.post(`${baseUrl}/api/v1/web/answer/all`, {
        questions: allAnswers
      });
      if (response.status === 201) {
        if (notAnswered.length === 0) {
          alert('모든 답변이 제출되었습니다.');
        } else {
          alert(`답변이 제출되었습니다. \n답변이 없는 ${notAnswered.length}개의 질문은 다음날 재발송드립니다.`);
          // 모든 답변 제출 완료 상태 업데이트 및 재발송 예정 상태 설정
          setIsAllAnswersSubmitted(true);
          setQuestionAnswers(prev => {
            const updatedAnswers = { ...prev };
            notAnswered.forEach(questionId => {
              updatedAnswers[questionId] = '재발송 예정';
            });
            return updatedAnswers;
          });
        }
      } else {
        showToast('답변 제출 중 예상치 못한 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('답변 제출에 실패했습니다:', error);
      showToast('답변 제출에 실패했습니다.');
    }
  };

  /* 토클 처리 부분 */
  // 재발송 질문 클릭 처리 함수
  const handleoldQuestionClick = (questionKey) => {
    setClickedoldQuestions({
      ...clickedoldQuestions,
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
  const toggleoldquestion = (questionKey) => {
    if (expandedoldquestion === questionKey) {
      setExpandedoldquestion(null);
    } else {
      setExpandedoldquestion(questionKey);
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

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000); // 토스트 메시지는 3초 후에 사라집니다.
  };


  function autoResizeTextarea(event) {
    event.target.style.height = 'auto'; // 높이를 자동으로 설정하여 현재 텍스트 높이에 맞게 조정합니다.
    event.target.style.height = `${event.target.scrollHeight}px`; // scrollHeight를 사용하여 실제 텍스트 높이에 맞게 높이를 설정합니다.
  }

  const handleAnswerChange = (questionId, value) => {
    // 기존 답변 상태 업데이트
    const newAnswers = {
      ...questionAnswers,
      [questionId]: value
    };

    // 답변 상태 업데이트
    setQuestionAnswers(newAnswers);

    // 입력된 텍스트가 있을 경우, 'answered' 상태를 true로 설정
    if (value.trim() !== '') {
      setClickedoldQuestions({ ...clickedoldQuestions, [questionId]: true });
    }
  };


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
        {oldquestions.length > 0 && (
          <div className='oldQuestion'>
            <h1>재발송 질문</h1>
            <div className="header-container-list">
              <div className="header-textbox-question">질문</div>
              <div className="divider-line"></div>
              <div className="header-textbox-answer">답변</div>
            </div>
            {oldquestions.map((question, index) => {
              const questionId = question.questionId; // questionKey 대신 questionId를 사용
              const isExpanded = expandedoldquestion === questionId;
              const currentAnswer = questionAnswers[questionId] || ''; // 현재 질문에 대한 답변
              const isClicked = clickedoldQuestions[questionId]; // 이 질문이 클릭되었는지 확인
              const hasAnswer = !!questionAnswers[questionId]; // 이 부분에서 답변 상태를 확인합니다.
              return (
                <div key={index} className="container">
                  <div className="question-container">
                    <div
                      className={`list question-list ${isExpanded && 'hide'}`}
                      onClick={() => {
                        toggleoldquestion(questionId); // 토글 함수 호출
                        handleoldQuestionClick(questionId); // 클릭 처리 함수 호출
                      }}>
                      <div className={`item question-item ${isClicked ? 'clicked' : ''}`}>
                        <span className="icon"></span>
                        <span>{question.content}</span> {/* question[questionKey] 대신 question.content 사용 */}
                      </div>
                    </div>
                    <div
                      className={`question-detail-content ${isExpanded ? 'show' : 'hide'}`}
                      onClick={() => toggleoldquestion(questionId)}>
                      <span className="detail-icon"></span>
                      <span>{question.content}</span> {/* 답변 목록에도 동일하게 적용 */}
                    </div>
                  </div>
                  <div className="answer-container">
                    <div
                      key={index}
                      className={`list answer-list ${isExpanded && 'hide'}`}
                      onClick={() => {
                        toggleoldquestion(questionId);
                        handleoldQuestionClick(questionId);
                      }}>
                      <div className={`item answer-item ${hasAnswer ? 'answeredoldQuestions' : ''} ${currentAnswer === '재발송 예정' ? 'pending' : ''}`}>
                        <span className="text-content">{currentAnswer || '답변을 입력해주세요'}</span>
                      </div>
                    </div>
                    <div className={`answer-detail-content ${isExpanded ? 'show' : 'hide'}`}>
                      <textarea
                        value={currentAnswer !== '재발송 예정' ? currentAnswer : ''} // textarea의 value를 상태와 연결
                        disabled={answeredQuestions[questionId] || isAllAnswersSubmitted}
                        onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                        onInput={autoResizeTextarea}
                        className="answer-textarea"
                        placeholder="답변을 입력해주세요."></textarea>
                      <div
                        onClick={() => { saveToResend(questionId); }}
                        className={`button next-mail ${(answeredQuestions[questionId] || isAllAnswersSubmitted) ? 'disabled' : ''}`}
                      >
                        다음에 답하기
                      </div>
                      <div
                        onClick={() => { saveIndividualAnswer(questionId, currentAnswer); }}
                        className={`button answer-complete ${(answeredQuestions[questionId] || !currentAnswer.trim() || isAllAnswersSubmitted) ? 'disabled' : ''}`}
                      >
                        답변 완료
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {oldquestions.length > 0 && (
          <>
            <hr />
            <div id="toast-container" className={`toast-container ${toast.show ? 'show' : ''}`}>
              {toast.message}
            </div>
          </>
        )}



        <div className='newQuestion'>
          <h1>신규 질문</h1>
          <div className="header-container-list">
            <div className="header-textbox-question">질문</div>
            <div className="divider-line"></div>
            <div className="header-textbox-answer">답변</div>
          </div>
          {newquestions.map((question, index) => {
            const questionId = question.questionId;
            const isExpanded = expandedNewQuestion === questionId;
            const currentAnswer = questionAnswers[questionId] || ''; // 현재 질문에 대한 답변
            const isClicked = clickedNewQuestions[questionId]; // 클릭 상태 확인
            const hasAnswer = !!questionAnswers[questionId]; // 이 부분에서 답변 상태를 확인합니다.
            return (
              <div key={index} className="container">
                <div className="question-container">
                  <div
                    className={`list question-list ${isExpanded && 'hide'}`}
                    onClick={() => {
                      toggleNewQuestion(questionId); // 토글 함수 호출
                      handleNewQuestionClick(questionId); // 클릭 처리 함수 호출
                    }}>
                    <div className={`question-item ${isClicked ? 'clicked' : ''}`}>
                      <span className="icon"></span>
                      <span>{question.content}</span>
                    </div>
                  </div>
                  <div
                    className={`question-detail-content ${isExpanded ? 'show' : 'hide'}`}
                    onClick={() => toggleNewQuestion(questionId)}>
                    <span className="detail-icon"></span>
                    <span>{question.content}</span>
                  </div>
                </div>
                <div className="answer-container">
                  <div
                    key={index}
                    className={`list answer-list ${isExpanded && 'hide'}`}
                    onClick={() => {
                      toggleNewQuestion(questionId)
                      handleNewQuestionClick(questionId);
                    }}>
                    <div className={`item answer-item ${hasAnswer ? 'answeredNewQuestions' : ''} ${currentAnswer === '재발송 예정' ? 'pending' : ''}`}>
                      <span className="text-content">{currentAnswer || '답변을 입력해주세요'}</span>
                    </div>
                  </div>
                  <div className={`answer-detail-content ${isExpanded ? 'show' : 'hide'}`}>
                    <textarea
                      value={currentAnswer !== '재발송 예정' ? currentAnswer : ''} // textarea의 value를 상태와 연결
                      disabled={answeredQuestions[questionId] || isAllAnswersSubmitted}
                      onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                      className="answer-textarea"
                      placeholder="답변을 입력해주세요."></textarea>
                    <div
                      onClick={() => { saveToResend(questionId); }}
                      className={`button next-mail ${(answeredQuestions[questionId] || isAllAnswersSubmitted) ? 'disabled' : ''}`}
                    >
                      다음에 답하기
                    </div>
                    <div
                      onClick={() => { saveIndividualAnswer(questionId, currentAnswer); }} className={`button answer-complete ${(answeredQuestions[questionId] || !currentAnswer.trim() || isAllAnswersSubmitted) ? 'disabled' : ''}`}
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
          <button onClick={saveAllAnswers} className="done-button" disabled={isAllAnswersSubmitted}>
            모든 답변 완료
          </button>
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './QuestionPageStyles.css';
import './Constants/Font_style.css';



function QuestionPage() {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [oldquestions, setoldquestions] = useState([]);
  const [newquestions, setNewQuestions] = useState([]);
  const [answers, setAnswers] = useState({ requestionAnswers: {}, newquestionAnswers: {} });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const params = useParams();
  const [expandedRequestion, setExpandedRequestion] = useState(null);
  const [expandedNewQuestion, setExpandedNewQuestion] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [clickedoldQuestions, setClickedoldQuestions] = useState({});
  const [clickedNewQuestions, setClickedNewQuestions] = useState({});
  const [answeredoldQuestions, setAnsweredoldQuestions] = useState({});
  const [answeredNewQuestions, setAnsweredNewQuestions] = useState({});
  const [isAllAnswersSubmitted, setIsAllAnswersSubmitted] = useState(false);


  //API 연동을 위한 기본 정의
  const baseUrl = "https://api.startingblock.co.kr";


  // 재발송 질문 클릭 처리 함수
  const handleReQuestionClick = (questionKey) => {
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
              const isExpanded = expandedRequestion === questionId;
              const currentAnswer = answers.requestionAnswers[questionId] || ''; // 현재 질문에 대한 답변
              const isClicked = clickedoldQuestions[questionId]; // 이 질문이 클릭되었는지 확인
              const hasAnswer = !!answers.requestionAnswers[questionId]; // 이 부분에서 답변 상태를 확인합니다.
              return (
                <div key={index} className="container">
                  <div className="question-container">
                    <div
                      className={`list question-list ${isExpanded && 'hide'}`}
                      onClick={() => {
                        toggleRequestion(questionId); // 토글 함수 호출
                        handleReQuestionClick(questionId); // 클릭 처리 함수 호출
                      }}>
                      <div className={`item question-item ${isClicked ? 'clicked' : ''}`}>
                        <span className="icon"></span>
                        <span>{question.content}</span> {/* question[questionKey] 대신 question.content 사용 */}
                      </div>
                    </div>
                    <div
                      className={`question-detail-content ${isExpanded ? 'show' : 'hide'}`}
                      onClick={() => toggleRequestion(questionId)}>
                      <span className="detail-icon"></span>
                      <span>{question.content}</span> {/* 답변 목록에도 동일하게 적용 */}
                    </div>
                  </div>
                  <div className="answer-container">
                    <div
                      key={index}
                      className={`list answer-list ${isExpanded && 'hide'}`}
                      onClick={() => {
                        toggleRequestion(questionId);
                        handleReQuestionClick(questionId);
                      }}>
                      <div className={`item answer-item ${hasAnswer ? 'answeredoldQuestions' : ''} ${currentAnswer === '재발송 예정' ? 'pending' : ''}`}>
                        <span className="text-content">{currentAnswer || '답변을 입력해주세요'}</span>
                      </div>
                    </div>
                    <div className={`answer-detail-content ${isExpanded ? 'show' : 'hide'}`}>
                      <textarea
                        disabled={answeredoldQuestions[questionId] || isAllAnswersSubmitted}
                        value={currentAnswer !== '재발송 예정' ? currentAnswer : ''} // textarea의 value를 상태와 연결
                        onChange={(e) => handleAnswerChange('requestionAnswers', questionId, e.target.value)}
                        onInput={autoResizeTextarea}
                        className="answer-textarea"
                        placeholder="답변을 입력해주세요."></textarea>
                      <div
                        onClick={() => !answeredoldQuestions[questionId] && !isAllAnswersSubmitted && submitResendRequest(questionId, 'requestionAnswers')}
                        className={`button next-mail ${(answeredoldQuestions[questionId] || isAllAnswersSubmitted) ? 'disabled' : ''}`}
                      >
                        다음에 답하기
                      </div>
                      <div
                        onClick={() => !answeredoldQuestions[questionId] && !isAllAnswersSubmitted && currentAnswer.trim() && saveAnswer(questionId, 'requestionAnswers')}
                        className={`button answer-complete ${(answeredoldQuestions[questionId] || !currentAnswer.trim() || isAllAnswersSubmitted) ? 'disabled' : ''}`}
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
            const currentAnswer = answers.newquestionAnswers[questionId] || ''; // 현재 질문에 대한 답변
            const isClicked = clickedNewQuestions[questionId]; // 클릭 상태 확인
            const hasAnswer = !!answers.newquestionAnswers[questionId]; // 이 부분에서 답변 상태를 확인합니다.
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
                      disabled={answeredNewQuestions[questionId] || isAllAnswersSubmitted}
                      value={currentAnswer !== '재발송 예정' ? currentAnswer : ''} // textarea의 value를 상태와 연결
                      onChange={(e) => handleAnswerChange('newquestionAnswers', questionId, e.target.value)}
                      className="answer-textarea"
                      placeholder="답변을 입력해주세요."></textarea>
                    <div
                      onClick={() => !answeredNewQuestions[questionId] && !isAllAnswersSubmitted && submitResendRequest(questionId, 'newquestionAnswers')}
                      className={`button next-mail ${(answeredNewQuestions[questionId] || isAllAnswersSubmitted) ? 'disabled' : ''}`}
                    >
                      다음에 답하기
                    </div>
                    <div
                      onClick={() => !answeredNewQuestions[questionId] && !isAllAnswersSubmitted && currentAnswer.trim() && saveAnswer(questionId, 'newquestionAnswers')}
                      className={`button answer-complete ${(answeredNewQuestions[questionId] || !currentAnswer.trim() || isAllAnswersSubmitted) ? 'disabled' : ''}`}
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
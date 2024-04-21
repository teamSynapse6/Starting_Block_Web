import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionPage from './QuestionPage';
import MainHome from './screen/home/MainHome';
import TermPage from './screen/term/TermScreen';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/api/v1/web/question/:announcementId" element={<QuestionPage />} />
        <Route path="/home" element={<MainHome />} />
        <Route path="/term" element={<TermPage />} />
      </Routes>
    </Router>
  );
}

export default App;

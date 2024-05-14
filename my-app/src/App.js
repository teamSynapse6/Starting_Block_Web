import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionPage from './QuestionPage';
import TermPage from './screen/term/TermScreen';
import HomePage from './screen/home/HomeScreen';
 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/api/v1/web/question/:announcementId" element={<QuestionPage />} />
        <Route path="/term" element={<TermPage />} />
      </Routes>
    </Router>
  );
}

export default App;

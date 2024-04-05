import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionPage from './QuestionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/api/v1/web/question/:announcementId" element={<QuestionPage />} />
      </Routes>
    </Router>
  );
}

export default App;

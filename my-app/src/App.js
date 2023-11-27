import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionPage from './QuestionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/questions/:setId" element={<QuestionPage />} />
      </Routes>
    </Router>
  );
}

export default App;

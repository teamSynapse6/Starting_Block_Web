import React, { useState, useEffect } from 'react';
import termsData from '../../data/terms.json'; // 경로는 JSON 파일의 실제 위치에 따라 달라질 수 있습니다.

function TermPage() {
    const [terms, setTerms] = useState([]);

    useEffect(() => {
        setTerms(termsData);
    }, []);

    return (
        <div>
            <h1>이용약관</h1>
            {terms.map((term, index) => (
                <div key={index}>
                    <h2>{term.소제목}</h2>
                    <p>{term.내용}</p>
                </div>
            ))}
        </div>
    );
}

export default TermPage;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import termsData from '../../data/terms.json'; 
import privateData from '../../data/PrivateProcess.json'; 
import styles from './TermScreenStyles.module.css';

function TermPage() {
    const [terms, setTerms] = useState([]);
    const [PrivateProcess, setPrivate] = useState([]);
    const location = useLocation();  // 현재 위치 정보를 가져옵니다.

    useEffect(() => {
        setTerms(termsData);
        setPrivate(privateData);

        // 페이지 로드 후 location.hash에 따라 스크롤
        if (location.hash) {
            const id = location.hash.replace("#", "");
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView();
            }
        }
    }, [location]); // location 변경 감지

    return (
        <div>
            <br /><br />
            <h1 className={styles.TermPageH1}>이용약관</h1>
            {terms.map((term, index) => (
                <div key={index} className={styles.content}>
                    <h2 className={styles.TermPageH2}>{term.소제목}</h2>
                    <p>{term.내용}</p>
                </div>
            ))}
            <br /><br /><br /><br />
            <h1 id="privacyPolicy" className={styles.TermPageH1}>개인정보 처리방침</h1>
            {PrivateProcess.map((term, index) => (
                <div key={index} className={styles.content}>
                    <h2 className={styles.TermPageH2}>{term.소제목}</h2>
                    <p>{term.내용}</p>
                </div>
            ))}
        </div>
    );
}

export default TermPage;

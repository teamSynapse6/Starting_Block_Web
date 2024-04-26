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
    
        // 데이터 설정 후 비동기적으로 스크롤 시도
        setTimeout(() => {
            if (location.hash) {
                const id = location.hash.replace("#", "");
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
        }, 0);
    }, [location, termsData, privateData]);
    

    return (
        <div className={styles.termBody}>
            <br /><br />
            <h1 className={styles.TermPageH1}>시냅스(스타팅블록) 약관 및 개인정보 보호</h1>
            <br /><br />
            <h1 className={styles.TermPageH1}>이용약관</h1>
            {terms.map((term, index) => (
                <div key={index} className={styles.content}>
                    <h2 className={styles.TermPageH2}>{term.소제목}</h2>
                    <p>{term.내용}</p>
                </div>
            ))}
            <br /><br />
            <hr className={styles.TermDivider}></hr>
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

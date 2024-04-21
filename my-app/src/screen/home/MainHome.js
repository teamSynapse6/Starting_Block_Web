import React from 'react';
import './MainHomeStyles.css'; // CSS 파일을 import 합니다.
import '../../Constants/Font_style.css';
// import StartingBlockSymbol from '../../Constants/images/starting_block_symbol.png'; // 이미지를 임포트합니다.
import PhoneMockUp from '../../Constants/images/phone_mockup.png'; // 이미지를 임포트합니다.




function MainHome() {
    return (
        <div className='BG-Color'>
            <div className='main-content'>
                <div className='text-box'>
                    <div className='main-text'>스타팅블록</div>
                    <div className='sub-text'>대학생 스타트업 헬퍼 서비스</div>
                </div>
                <img src={PhoneMockUp} alt="Phone_Image" className='Phone-image' />
            </div>
        </div>
    )
}

export default MainHome;
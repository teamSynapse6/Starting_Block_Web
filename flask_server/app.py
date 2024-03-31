from flask import Flask, request, Response
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# 애플리케이션의 루트 디렉토리 기반으로 절대 경로 생성
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/questions/<setId>', methods=['GET'])
def get_questions_answer(setId):
    try:
        # 질문 데이터 로드
        questions_file_path = os.path.join(BASE_DIR, 'question', f'{setId}.json')
        with open(questions_file_path, 'r', encoding='utf-8') as file:
            questions_data = json.load(file)
        
        # 답변 데이터 로드
        answers_file_path = os.path.join(BASE_DIR, 'answers', f'answers_{setId}.json')
        if os.path.exists(answers_file_path):
            with open(answers_file_path, 'r', encoding='utf-8') as file:
                answers_data = json.load(file)
        else:
            answers_data = {"requestionAnswers": {}, "newquestionAnswers": {}}
        
        # 질문 데이터와 답변 데이터 결합
        combined_data = {**questions_data, "answers": answers_data}
        
        # 결합된 데이터 반환
        return Response(json.dumps(combined_data, ensure_ascii=False), mimetype='application/json')
    except Exception as error:
        print(f'데이터를 불러오는 중 오류가 발생했습니다: {error}')
        return '데이터를 찾을 수 없습니다.', 404

def save_answers(setId, answers):
    filename = f'answers_{setId}.json'
    file_path = os.path.join(BASE_DIR, 'answers', filename)
    try:
        print(f'{json.dumps(answers, ensure_ascii=False, indent=2)}')
        # ensure_ascii=False로 설정하여 파일 저장 시 아스키 코드 변환을 방지
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(answers, file, ensure_ascii=False, indent=2)
            print(f'답변이 저장되었습니다: {filename}')
    except Exception as error:
        print(f'답변을 저장하는데 오류가 발생했습니다: {error}')

@app.route('/submit/<setId>', methods=['POST'])
def submit(setId):
    answers = request.json
    save_answers(setId, answers)
    return '답변이 저장되었습니다.', 200

if __name__ == '__main__':
    app.run(port=3001, debug=True)

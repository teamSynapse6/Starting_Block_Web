from flask import Flask, request, Response
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# 애플리케이션의 루트 디렉토리 기반으로 절대 경로 생성
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/api/v1/web/question/<setId>', methods=['GET'])
def get_questions_answer(setId):
    try:
        # 질문 데이터 로드
        questions_file_path = os.path.join(BASE_DIR, 'question', f'{setId}.json')  # 'question' 경로명 확인 및 수정
        with open(questions_file_path, 'r', encoding='utf-8') as file:
            questions_data = json.load(file)
        
        # 질문 데이터 반환
        return Response(json.dumps(questions_data, ensure_ascii=False), mimetype='application/json')
    except Exception as error:
        print(f'데이터를 불러오는 중 오류가 발생했습니다: {error}')
        return '데이터를 찾을 수 없습니다.', 404

# 개별 답변을 저장하는 메소드
@app.route('/api/v1/web/answer', methods=['POST'])
def submit_answer():
    data = request.json
    questionId = data.get('questionId')
    content = data.get('content')

    # 답변 파일 경로 정의, questionId를 파일명으로 사용
    answers_file_path = os.path.join(BASE_DIR, 'answers', f'{questionId}.json')

    # 파일이 이미 존재하는 경우, 중복 저장 방지
    if os.path.exists(answers_file_path):
        return '이미 답변이 저장되었습니다.', 500

    # 새 답변 파일 생성
    try:
        # 파일 생성 및 questionId와 content 저장
        with open(answers_file_path, 'w', encoding='utf-8') as file:
            # questionId와 content를 모두 포함하는 데이터를 저장
            json.dump(data, file, ensure_ascii=False, indent=2)
        return '답변이 저장되었습니다.', 201
    except Exception as e:
        return f'답변 저장 중 오류가 발생했습니다: {e}', 500


        

# 모든 답변을 저장하는 메소드
@app.route('/api/v1/web/answer/all', methods=['POST'])
def submit_all_answers():
    data = request.json
    questions = data.get('questions')

    # 모든 답변을 저장하기 위한 로직
    for question in questions:
        questionId = question.get('questionId')
        content = question.get('content')

        # 답변 파일 경로 정의
        answers_file_path = os.path.join(BASE_DIR, 'answers', f'{questionId}.json')

        # 이미 답변 파일이 존재하는 경우, 중복 저장 방지
        if os.path.exists(answers_file_path):
            continue  # 이미 존재하는 답변은 건너뛰고 다음 답변 처리
        else:
            # 새 답변 파일 생성
            try:
                with open(answers_file_path, 'w', encoding='utf-8') as file:
                    json.dump({"questionId": questionId, "content": content}, file, ensure_ascii=False, indent=2)
            except Exception as e:
                print(f'답변 저장 중 오류가 발생했습니다: {e}')
                return f'답변 저장 중 오류가 발생했습니다: {e}', 500

    return '모든 답변이 저장되었습니다.', 201


if __name__ == '__main__':
    app.run(port=3001, debug=True)

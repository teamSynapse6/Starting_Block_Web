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
    # POST 요청에서 JSON 데이터 추출
    data = request.json
    questionId = data.get('questionId')
    content = data.get('content')

    # setId를 추출합니다. 여기서는 예시로 questionId를 setId로 사용합니다.
    # 실제 사용 시에는 setId를 어떻게 결정할지에 따라 다를 수 있습니다.
    setId = str(questionId)  # setId 정의 방식에 따라 수정 필요

    answers_file_path = os.path.join(BASE_DIR, 'answers', f'{setId}.json')

    # 이미 파일이 존재하는 경우, 수정을 방지
    if os.path.exists(answers_file_path):
        try:
            with open(answers_file_path, 'r', encoding='utf-8') as file:
                existing_answers = json.load(file)
            
            # 이미 해당 questionId에 대한 답변이 있는지 확인
            if str(questionId) in existing_answers:
                return '이미 답변이 저장되었습니다.', 500
            else:
                # 새로운 답변을 추가합니다. (현재 요구 사항과는 다를 수 있음)
                existing_answers[str(questionId)] = content
                with open(answers_file_path, 'w', encoding='utf-8') as file:
                    json.dump(existing_answers, file, ensure_ascii=False, indent=2)
                return '답변이 추가되었습니다.', 201
        except Exception as e:
            return f'답변 저장 중 오류가 발생했습니다: {e}', 500
    else:
        # 답변 파일이 존재하지 않는 경우, 새 파일 생성
        try:
            with open(answers_file_path, 'w', encoding='utf-8') as file:
                json.dump({str(questionId): content}, file, ensure_ascii=False, indent=2)
            return '답변이 저장되었습니다.', 201
        except Exception as e:
            return f'답변 저장 중 오류가 발생했습니다: {e}', 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)

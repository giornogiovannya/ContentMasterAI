from flask import Flask, jsonify
import subprocess
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)
@app.route('/crawl', methods=['GET'])
def carar():
    """
    Обрабатывает GET-запрос на маршрут '/crawl'.
    
    Этот метод запускает краулер rbc с помощью subprocess и ожидает его завершения.
    Результат возвращается в формате JSON с сообщением об успешном завершении.
    В противном случае возвращается сообщение об ошибке, если результаты не найдены.
    
    Если возникает ошибка во время выполнения, возвращается сообщение об ошибке с соответствующим статусом.
    
    Returns:
        JSON: Статус выполнения и данные, если сбор завершен успешно, или сообщение об ошибке.
    """
    try:
        result = subprocess.run(['python', 'crawlers.py'], capture_output=True, text=True)

        if result.returncode != 0:
            return jsonify(status='Ошибка при запуске краулера', error=result.stderr), 500

        output_path = '/tmp/output.json'
        if os.path.exists(output_path):
            with open(output_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify(status='Сбор завершен успешно', data=data)
        else:
            return jsonify(status='Файл с результатами не найден'), 500

    except Exception as e:
        print(f'Ошибка: {e}')
        return jsonify(status='Ошибка при запуске краулера', error=str(e)), 500
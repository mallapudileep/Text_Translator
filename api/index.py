from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

@app.route('/api/translate', methods=['POST', 'GET'])
def translate():
    if request.method == 'GET':
        return jsonify({"status": "API is online"}), 200

    try:
        data = request.get_json()
        text = data.get('text', '')
        target = data.get('target', 'en')
        source = data.get('source', 'auto')

        if not text:
            return jsonify({"error": "Empty text"}), 400

        # Translation
        translated = GoogleTranslator(source=source, target=target).translate(text)

        return jsonify({
            "translated": translated
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
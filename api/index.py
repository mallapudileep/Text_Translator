from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

@app.route('/api/translate', methods=['POST', 'GET'])
def translate_text():
    if request.method == 'GET':
        return jsonify({"status": "Backend is running"}), 200

    try:
        data = request.json
        text = data.get('text')
        target = data.get('target', 'en')
        source = data.get('source', 'auto')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Logic for translation
        translated = GoogleTranslator(source=source, target=target).translate(text)
        
        return jsonify({
            "translated": translated,
            "source": source,
            "target": target
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run()
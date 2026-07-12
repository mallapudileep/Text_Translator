from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator

app = Flask(__name__)
# IMPORTANT: This allows your HTML on port 5500 to talk to Python on port 5000
CORS(app) 

@app.route('/api/translate', methods=['POST'])
def translate_text():
    try:
        data = request.json
        text = data.get('text')
        target = data.get('target', 'en')
        source = data.get('source', 'auto')

        if not text:
            return jsonify({"error": "No text"}), 400

        translated = GoogleTranslator(source=source, target=target).translate(text)
        
        return jsonify({
            "translated": translated,
            "source": source,
            "target": target
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# This part is for LOCAL testing only
if __name__ == '__main__':
    print("Backend running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)
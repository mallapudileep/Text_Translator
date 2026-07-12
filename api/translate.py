from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

@app.route('/api/translate', methods=['POST', 'GET'])
def translate():
    # Health check (useful for debugging 404s)
    if request.method == 'GET':
        return jsonify({"status": "Backend Active"}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data received"}), 400

        text = data.get('text', '')
        target = data.get('target', 'en')
        source = data.get('source', 'auto')

        if not text:
            return jsonify({"error": "Empty text"}), 400

        # Translation execution
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
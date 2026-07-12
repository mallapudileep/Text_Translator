from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

# Ensure this is the EXACT name of your route
@app.route('/api/translate', methods=['POST', 'GET'])
def translate_text():
    # ... (Keep your existing translation code here)
    data = request.json
    text = data.get('text')
    # ... rest of your logic

# IMPORTANT: Remove the 'def handler' function if it's there. 
# Vercel's Flask support only needs the 'app' variable.

if __name__ == "__main__":
    app.run()
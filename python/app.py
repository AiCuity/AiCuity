
import os
import sys
import json
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify

app = Flask(__name__)

# Configure CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Extract text from EPUB
def epub_to_text(epub_path):
    try:
        book = epub.read_epub(epub_path)
        chapters = []
        
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                chapters.append(item.get_content())
        
        # Extract text from chapters
        text = ""
        for html_content in chapters:
            soup = BeautifulSoup(html_content, 'html.parser')
            chapter_text = soup.get_text()
            text += chapter_text + "\n\n"
        
        return text
    except Exception as e:
        print(f"Error extracting text: {e}", file=sys.stderr)
        return ""

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Python EPUB service is running"})

@app.route('/process-epub', methods=['POST'])
def process_epub():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Save the file temporarily
    temp_path = f"/tmp/{file.filename}"
    file.save(temp_path)
    
    # Process the EPUB
    text = epub_to_text(temp_path)
    
    # Clean up
    os.remove(temp_path)
    
    if not text:
        return jsonify({"error": "Failed to extract text from file"}), 500
    
    return jsonify({"success": True, "text": text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

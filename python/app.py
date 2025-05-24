
import os
import sys
import json
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from html import unescape
import re

app = Flask(__name__)

# Configure CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def clean_text(text):
    """Clean the extracted text."""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Convert HTML entities
    text = unescape(text)
    
    # Remove non-printable characters
    text = re.sub(r'[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]', '', text)
    
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    
    # Remove excessive line breaks
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

# Extract text from EPUB using ebooklib
def epub_to_text(epub_path):
    try:
        # Read the EPUB file using ebooklib
        book = epub.read_epub(epub_path)
        
        # Extract all text content
        all_text = []
        
        # Get all items that contain document content
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                try:
                    # Get the content as bytes and decode
                    content = item.get_content().decode('utf-8', errors='ignore')
                    
                    # Parse HTML content with BeautifulSoup
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Extract text content
                    text_content = soup.get_text()
                    
                    # Clean and add to collection if not empty
                    cleaned_text = clean_text(text_content)
                    if cleaned_text:
                        all_text.append(cleaned_text)
                        
                except Exception as item_error:
                    print(f"Error processing item: {item_error}", file=sys.stderr)
                    continue
        
        # Join all text with paragraph breaks
        final_text = "\n\n".join(all_text)
        
        if not final_text.strip():
            raise Exception("No text content found in EPUB")
        
        return final_text
        
    except Exception as e:
        print(f"Error extracting text: {e}", file=sys.stderr)
        raise Exception(f"Failed to process EPUB: {str(e)}")

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
    try:
        file.save(temp_path)
        
        # Process the EPUB using ebooklib
        text = epub_to_text(temp_path)
        
        return jsonify({"success": True, "text": text})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as cleanup_error:
                print(f"Error cleaning up temp file: {cleanup_error}", file=sys.stderr)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

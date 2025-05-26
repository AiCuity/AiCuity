
import json
import base64
import tempfile
import os
from urllib.parse import parse_qs
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import PyPDF2
import io
import re
from html import unescape

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

def process_epub(file_data):
    """Process EPUB file and extract text."""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.epub', delete=False) as temp_file:
            temp_file.write(file_data)
            temp_path = temp_file.name
        
        # Read the EPUB file
        book = epub.read_epub(temp_path)
        
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
                    print(f"Error processing item: {item_error}")
                    continue
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        # Join all text with paragraph breaks
        final_text = "\n\n".join(all_text)
        
        if not final_text.strip():
            raise Exception("No text content found in EPUB")
        
        return final_text
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_path' in locals():
            try:
                os.unlink(temp_path)
            except:
                pass
        raise Exception(f"Failed to process EPUB: {str(e)}")

def process_pdf(file_data):
    """Process PDF file and extract text."""
    try:
        # Create a BytesIO object from the file data
        pdf_stream = io.BytesIO(file_data)
        
        # Create PDF reader
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        
        # Extract text from all pages
        all_text = []
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            if text.strip():
                all_text.append(clean_text(text))
        
        # Join all text
        final_text = "\n\n".join(all_text)
        
        if not final_text.strip():
            raise Exception("No text content found in PDF")
        
        return final_text
        
    except Exception as e:
        raise Exception(f"Failed to process PDF: {str(e)}")

def process_text(file_data):
    """Process text file."""
    try:
        # Decode the text file
        text = file_data.decode('utf-8', errors='ignore')
        return clean_text(text)
    except Exception as e:
        raise Exception(f"Failed to process text file: {str(e)}")

def handler(event, context):
    """Main handler for file upload processing."""
    
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight OPTIONS request
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Only allow POST requests
    if event['httpMethod'] != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse the multipart form data
        content_type = event.get('headers', {}).get('content-type', '')
        
        if 'multipart/form-data' not in content_type:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Content-Type must be multipart/form-data'})
            }
        
        # Get the body (base64 encoded in Netlify)
        body = event.get('body', '')
        is_base64 = event.get('isBase64Encoded', False)
        
        if is_base64:
            body = base64.b64decode(body)
        else:
            body = body.encode('utf-8')
        
        # Simple multipart parsing (basic implementation)
        # In production, you might want to use a more robust parser
        boundary = content_type.split('boundary=')[1]
        parts = body.split(f'--{boundary}'.encode())
        
        file_data = None
        filename = None
        content_type_file = None
        
        for part in parts:
            if b'Content-Disposition: form-data' in part and b'filename=' in part:
                # Extract filename
                disposition_line = part.split(b'\r\n')[1].decode('utf-8')
                filename = disposition_line.split('filename="')[1].split('"')[0]
                
                # Extract content type
                content_type_line = part.split(b'\r\n')[2].decode('utf-8')
                if content_type_line.startswith('Content-Type:'):
                    content_type_file = content_type_line.split(': ')[1]
                
                # Extract file data (after double CRLF)
                file_data = part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0]
                break
        
        if not file_data or not filename:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No file uploaded'})
            }
        
        # Determine file type
        file_extension = os.path.splitext(filename)[1].lower()
        
        # Process based on file type
        extracted_text = ""
        
        if file_extension == '.epub':
            extracted_text = process_epub(file_data)
        elif file_extension == '.pdf':
            extracted_text = process_pdf(file_data)
        elif file_extension == '.txt':
            extracted_text = process_text(file_data)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': f'Unsupported file type: {file_extension}'})
            }
        
        # Return the extracted text
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'text': extracted_text,
                'originalFilename': filename
            })
        }
        
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Failed to process file',
                'details': str(e)
            })
        }

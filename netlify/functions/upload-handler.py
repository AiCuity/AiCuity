import json
import base64
import tempfile
import os
from urllib.parse import parse_qs

# Import with error handling for dependencies
try:
    import ebooklib
    from ebooklib import epub
    from bs4 import BeautifulSoup
    import PyPDF2
except ImportError as e:
    print(f"Import error: {e}")
    # These will be handled in the function if missing

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
        # Check if required modules are available
        if 'ebooklib' not in globals() or 'BeautifulSoup' not in globals():
            raise Exception("Required dependencies (ebooklib, beautifulsoup4) are not available")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.epub', delete=False) as temp_file:
            temp_file.write(file_data)
            temp_path = temp_file.name
        
        print(f"Processing EPUB file at: {temp_path}")
        
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
        
        print(f"Successfully extracted {len(final_text)} characters from EPUB")
        return final_text
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_path' in locals():
            try:
                os.unlink(temp_path)
            except:
                pass
        print(f"EPUB processing error: {str(e)}")
        raise Exception(f"Failed to process EPUB: {str(e)}")

def process_pdf(file_data):
    """Process PDF file and extract text."""
    try:
        # Check if PyPDF2 is available
        if 'PyPDF2' not in globals():
            raise Exception("Required dependency (PyPDF2) is not available")
        
        print(f"Processing PDF file, size: {len(file_data)} bytes")
        
        # Create a BytesIO object from the file data
        pdf_stream = io.BytesIO(file_data)
        
        # Create PDF reader
        pdf_reader = PyPDF2.PdfReader(pdf_stream)
        
        print(f"PDF has {len(pdf_reader.pages)} pages")
        
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
        
        print(f"Successfully extracted {len(final_text)} characters from PDF")
        return final_text
        
    except Exception as e:
        print(f"PDF processing error: {str(e)}")
        raise Exception(f"Failed to process PDF: {str(e)}")

def process_text(file_data):
    """Process text file."""
    try:
        # Decode the text file
        text = file_data.decode('utf-8', errors='ignore')
        cleaned = clean_text(text)
        print(f"Successfully processed text file, {len(cleaned)} characters")
        return cleaned
    except Exception as e:
        print(f"Text processing error: {str(e)}")
        raise Exception(f"Failed to process text file: {str(e)}")

# Main handler function - this is the entry point for Netlify
def handler(event, context):
    """Main handler for file upload processing."""
    
    print(f"Handler called with method: {event.get('httpMethod')}")
    print(f"Event keys: {list(event.keys())}")
    print(f"Headers: {event.get('headers', {})}")
    
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    try:
        # Handle preflight OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            print("Handling OPTIONS request")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }
        
        # Only allow POST requests
        if event.get('httpMethod') != 'POST':
            print(f"Method not allowed: {event.get('httpMethod')}")
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed. Only POST requests are supported.'})
            }
        
        # Check for required fields
        if not event.get('body'):
            print("No request body provided")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No request body provided'})
            }
        
        # Parse the multipart form data
        content_type = event.get('headers', {}).get('content-type', '')
        if not content_type:
            content_type = event.get('headers', {}).get('Content-Type', '')
        
        print(f"Content-Type: {content_type}")
        
        if 'multipart/form-data' not in content_type:
            print("Invalid content type")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Content-Type must be multipart/form-data'})
            }
        
        # Get the body (base64 encoded in Netlify)
        body = event.get('body', '')
        is_base64 = event.get('isBase64Encoded', False)
        
        print(f"Body length: {len(body)}, isBase64Encoded: {is_base64}")
        
        if is_base64:
            try:
                body = base64.b64decode(body)
                print(f"Decoded body length: {len(body)}")
            except Exception as decode_error:
                print(f"Base64 decode error: {decode_error}")
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': f'Failed to decode base64 body: {str(decode_error)}'})
                }
        else:
            body = body.encode('utf-8')
        
        # Extract boundary from content type
        try:
            boundary = content_type.split('boundary=')[1]
            print(f"Boundary: {boundary}")
        except IndexError:
            print("No boundary found")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No boundary found in Content-Type header'})
            }
        
        # Parse multipart data
        parts = body.split(f'--{boundary}'.encode())
        print(f"Found {len(parts)} parts")
        
        file_data = None
        filename = None
        
        for i, part in enumerate(parts):
            if b'Content-Disposition: form-data' in part and b'filename=' in part:
                try:
                    print(f"Processing part {i}")
                    # Extract filename
                    disposition_line = part.split(b'\r\n')[1].decode('utf-8')
                    filename = disposition_line.split('filename="')[1].split('"')[0]
                    print(f"Found filename: {filename}")
                    
                    # Extract file data (after double CRLF)
                    file_data = part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0]
                    print(f"File data length: {len(file_data)}")
                    break
                except Exception as parse_error:
                    print(f"Parse error for part {i}: {parse_error}")
                    continue
        
        if not file_data or not filename:
            print("No file uploaded or filename missing")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No file uploaded or filename missing'})
            }
        
        # Determine file type
        file_extension = os.path.splitext(filename)[1].lower()
        print(f"File extension: {file_extension}")
        
        # Process based on file type
        extracted_text = ""
        
        try:
            if file_extension == '.epub':
                extracted_text = process_epub(file_data)
            elif file_extension == '.pdf':
                extracted_text = process_pdf(file_data)
            elif file_extension == '.txt':
                extracted_text = process_text(file_data)
            else:
                print(f"Unsupported file type: {file_extension}")
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': f'Unsupported file type: {file_extension}. Supported types: .epub, .pdf, .txt'})
                }
        except Exception as processing_error:
            print(f"Processing error: {processing_error}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Failed to process file',
                    'details': str(processing_error),
                    'filename': filename,
                    'file_type': file_extension
                })
            }
        
        # Validate extracted text
        if not extracted_text or len(extracted_text.strip()) < 10:
            print(f"Insufficient text extracted: {len(extracted_text.strip())} characters")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Insufficient text content extracted from file',
                    'details': f'Only {len(extracted_text.strip())} characters extracted',
                    'filename': filename
                })
            }
        
        # Return the extracted text
        response_data = {
            'success': True,
            'text': extracted_text,
            'originalFilename': filename,
            'extractedLength': len(extracted_text),
            'message': f'Successfully processed {filename}'
        }
        
        print(f"Success! Returning {len(extracted_text)} characters")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        # Catch-all error handler
        print(f"Unexpected error in handler: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e),
                'message': 'An unexpected error occurred while processing the file'
            })
        }

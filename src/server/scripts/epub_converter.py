
#!/usr/bin/env python3
"""
EPUB converter script using ebooklib for robust text extraction.
"""

import sys
import os
import re
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
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

def extract_text_from_epub(epub_path):
    """Extract text content from an EPUB file using ebooklib."""
    if not os.path.exists(epub_path):
        print(f"Error: File not found - {epub_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Read the EPUB file using ebooklib
        book = epub.read_epub(epub_path)
        
        # Extract all text content
        all_text = []
        
        # Get all items that contain document content
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
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
        
        # Join all text with paragraph breaks
        final_text = "\n\n".join(all_text)
        
        if not final_text.strip():
            print("Error: No text content found in EPUB", file=sys.stderr)
            sys.exit(1)
        
        return final_text
    
    except Exception as e:
        print(f"Error processing EPUB: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python epub_converter.py <path_to_epub_file>", file=sys.stderr)
        sys.exit(1)
    
    epub_path = sys.argv[1]
    extracted_text = extract_text_from_epub(epub_path)
    print(extracted_text)

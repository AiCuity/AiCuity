
#!/usr/bin/env python3
"""
EPUB converter script for extracting text from EPUB files.
"""

import sys
import os
import re
import zipfile
import xml.etree.ElementTree as ET
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
    """Extract text content from an EPUB file."""
    if not os.path.exists(epub_path):
        print(f"Error: File not found - {epub_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Open the EPUB file as a zip archive
        with zipfile.ZipFile(epub_path, 'r') as epub:
            # Find the content files
            container = epub.open('META-INF/container.xml')
            container_root = ET.parse(container).getroot()
            
            # Get the path to the content.opf file
            ns = {'ns': 'urn:oasis:names:tc:opendocument:xmlns:container'}
            content_path = container_root.find('.//ns:rootfile', ns).get('full-path')
            
            # Parse the content.opf file
            content = epub.open(content_path)
            content_root = ET.parse(content).getroot()
            
            # Get the spine items
            ns_pkg = {'pkg': 'http://www.idpf.org/2007/opf'}
            manifest = content_root.find('./pkg:manifest', ns_pkg)
            spine = content_root.find('./pkg:spine', ns_pkg)
            
            if spine is None or manifest is None:
                print("Error: Invalid EPUB structure", file=sys.stderr)
                sys.exit(1)
            
            # Create a mapping of id to href
            item_map = {}
            for item in manifest:
                item_id = item.get('id')
                href = item.get('href')
                if item_id and href:
                    item_map[item_id] = href
            
            # Get the content directory
            content_dir = os.path.dirname(content_path)
            
            # Extract text from each spine item
            all_text = []
            for itemref in spine:
                idref = itemref.get('idref')
                if idref and idref in item_map:
                    href = item_map[idref]
                    # Calculate the absolute path within the zip
                    abs_path = os.path.join(content_dir, href).replace('\\', '/')
                    
                    try:
                        # Open and read the content file
                        content_file = epub.open(abs_path)
                        content_data = content_file.read().decode('utf-8', errors='ignore')
                        
                        # Clean the text and add to collection
                        cleaned_content = clean_text(content_data)
                        all_text.append(cleaned_content)
                    except (KeyError, ET.ParseError) as e:
                        continue
            
            return "\n\n".join(all_text)
    
    except zipfile.BadZipFile:
        print("Error: Invalid EPUB file", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python epub_converter.py <path_to_epub_file>", file=sys.stderr)
        sys.exit(1)
    
    epub_path = sys.argv[1]
    extracted_text = extract_text_from_epub(epub_path)
    print(extracted_text)

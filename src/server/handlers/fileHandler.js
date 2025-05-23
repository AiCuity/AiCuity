
const fs = require('fs');
const path = require('path');
const { processTextFile, processPdfFile, processEpubFile } = require('../utils/fileProcessors');

/**
 * Process an uploaded file and extract its text content
 */
const processUploadedFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  console.log(`Processing file: ${file.originalname} (${file.mimetype})`);
  const filePath = file.path;
  
  // Determine file type based on extension and mimetype
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  console.log(`File extension: ${fileExtension}, MIME type: ${mimeType}`);
  
  let fileType = '';
  
  // Check extension first, then fallback to mimetype
  if (['.txt'].includes(fileExtension)) {
    fileType = '.txt';
  } else if (['.pdf'].includes(fileExtension)) {
    fileType = '.pdf';
  } else if (['.epub'].includes(fileExtension)) {
    fileType = '.epub';
  } else if (mimeType === 'text/plain') {
    fileType = '.txt';
  } else if (mimeType === 'application/pdf') {
    fileType = '.pdf';
  } else if (mimeType === 'application/epub+zip' || mimeType === 'application/octet-stream') {
    // Some systems might send EPUB as octet-stream
    fileType = '.epub';
  }
  
  if (!fileType) {
    console.log(`Unsupported file type: extension=${fileExtension}, mime=${mimeType}`);
    throw new Error('Unsupported file type');
  }
  
  let extractedText = '';
  
  // Process different file types
  console.log(`Processing as ${fileType} file`);
  try {
    switch (fileType) {
      case '.txt':
        extractedText = await processTextFile(filePath);
        break;
      case '.pdf':
        extractedText = await processPdfFile(filePath);
        break;
      case '.epub':
        extractedText = await processEpubFile(filePath);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (processingError) {
    console.error(`Error in file processing: ${processingError.message}`);
    throw new Error(`Failed to extract text: ${processingError.message}`);
  }

  // Check if we got any content
  if (!extractedText || extractedText.trim() === '') {
    throw new Error('Failed to extract text from file');
  }
  
  console.log(`Successfully extracted ${extractedText.length} characters from ${fileType} file`);

  // Return the extracted text for response
  return {
    text: extractedText,
    originalFilename: file.originalname,
    fileType
  };
};

/**
 * Delete a file with error handling
 */
const deleteFile = async (filePath) => {
  if (filePath) {
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error(`Error deleting file: ${err.message}`);
    }
  }
};

module.exports = {
  processUploadedFile,
  deleteFile
};

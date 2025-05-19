
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { processTextFile, processPdfFile, processEpubFile } = require('../utils/fileProcessors');
const { fetchHtml } = require('../utils/webFetcher');
const { extractMainContent } = require('../utils/htmlExtractor');
const { exec } = require('child_process');

const router = express.Router();

// Set up file storage with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only specific file types
  const allowedMimeTypes = ['text/plain', 'application/pdf', 'application/epub+zip'];
  const allowedExtensions = ['.txt', '.pdf', '.epub'];
  
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if the file has a valid MIME type or valid extension
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    console.log(`Rejected file: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Invalid file type. Only .txt, .pdf, and .epub files are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit (increased for larger EPUB files)
});

// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);
    const filePath = req.file.path;
    
    // Determine file type based on extension and mimetype
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const mimeType = req.file.mimetype;
    
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
      return res.status(400).json({ error: 'Unsupported file type' });
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

    // Cleanup: delete the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
    });

    res.json({
      success: true,
      text: extractedText,
      originalFilename: req.file.originalname
    });
  } catch (error) {
    console.error(`Error processing file: ${error}`);
    
    // Try to clean up the uploaded file if it exists
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error(`Error deleting file after error: ${err}`);
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process file', 
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined 
    });
  }
});

// Website scraping endpoint
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    // Check URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Set timeout for request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Fetch and extract content
      console.log(`Fetching content from URL: ${url}`);
      const html = await fetchHtml(url);
      clearTimeout(timeoutId);
      
      const extractedData = extractMainContent(html, url);
      
      res.json({
        success: true,
        text: extractedData.text,
        title: extractedData.title,
        sourceUrl: url
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`Error fetching URL: ${url}`, fetchError);
      res.status(500).json({ error: 'Failed to fetch URL', details: fetchError.message });
    }
  } catch (error) {
    console.error(`Error scraping website: ${error}`);
    res.status(500).json({ error: 'Failed to scrape website', details: error.message });
  }
});

// Python script health check endpoint
router.get('/check-python', (req, res) => {
  // First try python3
  exec('python3 --version', (error, stdout, stderr) => {
    if (error) {
      // Fall back to python
      exec('python --version', (fallbackError, fallbackStdout, fallbackStderr) => {
        if (fallbackError) {
          return res.status(500).json({ 
            status: 'error', 
            message: 'Python is not installed or accessible',
            error: fallbackError.message
          });
        }
        
        res.json({ 
          status: 'ok',
          message: 'Python is accessible',
          version: fallbackStdout.trim()
        });
      });
      return;
    }
    
    res.json({ 
      status: 'ok',
      message: 'Python3 is accessible',
      version: stdout.trim()
    });
  });
});

// API health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

module.exports = router;

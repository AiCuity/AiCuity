
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
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .txt, .pdf, and .epub files are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    
    let extractedText = '';
    
    // Process different file types
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
        return res.status(400).json({ error: 'Unsupported file type' });
    }

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
    res.status(500).json({ error: 'Failed to process file', details: error.message });
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
  exec('python --version', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Python is not installed or accessible',
        error: error.message
      });
    }
    
    res.json({ 
      status: 'ok',
      message: 'Python is accessible',
      version: stdout.trim()
    });
  });
});

// API health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

module.exports = router;

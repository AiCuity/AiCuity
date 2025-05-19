const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const pdfParse = require('pdf-parse');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const cheerio = require('cheerio');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Set up file storage with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    
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

// Helper functions for text processing
const cleanText = (text) => {
  return text
    // Replace non-printable and control characters
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Replace multiple whitespaces with a single space
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
};

// Process text files
const processTextFile = async (filePath) => {
  const readFile = promisify(fs.readFile);
  const text = await readFile(filePath, 'utf8');
  return cleanText(text);
};

// Process PDF files
const processPdfFile = async (filePath) => {
  const dataBuffer = await fs.promises.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return cleanText(data.text);
};

// Process EPUB files (using Python subprocess)
const processEpubFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'scripts', 'epub_converter.py');
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    exec(`python ${pythonScript} "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing EPUB file: ${error}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`EPUB processing stderr: ${stderr}`);
      }
      
      resolve(cleanText(stdout));
    });
  });
};

// Fetch HTML from URL
const fetchHtml = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirects
        fetchHtml(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch URL: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Enhanced extract main content from HTML using Cheerio
const extractMainContent = (html, url) => {
  const $ = cheerio.load(html);
  
  // Extract the page title
  const pageTitle = $('title').text().trim() || new URL(url).hostname;
  
  // Remove script, style, nav, header, footer, and other non-content elements
  $('script, style, nav, header, footer, aside, [role=banner], [role=navigation], iframe, .share, .comments, .ad, .advertisement, .sidebar, .menu').remove();
  
  // Find the main content element based on common patterns
  const possibleContentSelectors = [
    'main', 
    'article', 
    'div[role="main"]',
    '.content', 
    '.post-content', 
    '.entry-content', 
    '.article-content', 
    '.article-body',
    '#content', 
    '#main', 
    '#article'
  ];
  
  let mainContent = '';
  for (const selector of possibleContentSelectors) {
    const selectedContent = $(selector);
    if (selectedContent.length > 0) {
      // Extract all text from selected element
      const text = selectedContent.text().trim();
      if (text.length > mainContent.length) {
        mainContent = text;
      }
    }
  }
  
  // If no content found using specific selectors, collect all paragraphs
  if (!mainContent) {
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
    if (paragraphs.length > 0) {
      mainContent = paragraphs.join('\n\n');
    } else {
      // Last resort: use body text
      mainContent = $('body').text();
    }
  }
  
  // Clean the text
  return {
    text: cleanText(mainContent),
    title: pageTitle,
    sourceUrl: url
  };
};

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
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
app.post('/api/scrape', async (req, res) => {
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
app.get('/api/check-python', (req, res) => {
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for testing purposes

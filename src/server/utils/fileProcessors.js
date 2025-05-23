
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const pdfParse = require('pdf-parse');
const { exec } = require('child_process');
const { cleanText } = require('./textCleaner');
const fetch = require('node-fetch').default;

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

// Process EPUB files - with fallback options
const processEpubFile = async (filePath) => {
  // First try the Python service if available
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL;
  
  if (pythonServiceUrl) {
    try {
      console.log(`Attempting to use Python service at ${pythonServiceUrl}`);
      
      // Check if the service is running
      const healthCheck = await fetch(`${pythonServiceUrl}/health`, { timeout: 3000 })
        .then(res => res.json())
        .catch(() => null);
      
      if (healthCheck && healthCheck.status === 'ok') {
        console.log('Python service is available, using it to process EPUB');
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        
        const response = await fetch(`${pythonServiceUrl}/process-epub`, {
          method: 'POST',
          body: formData,
          timeout: 30000
        });
        
        const result = await response.json();
        
        if (result.success && result.text) {
          console.log('Successfully processed EPUB with Python service');
          return cleanText(result.text);
        }
      }
    } catch (err) {
      console.error('Error using Python service:', err.message);
      console.log('Falling back to local Python script');
    }
  }
  
  // Fallback to local Python script
  return new Promise((resolve, reject) => {
    // Get the absolute path to the Python script
    const pythonScript = path.resolve(__dirname, '..', 'scripts', 'epub_converter.py');
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname, '..', 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
      
      // Make sure the Python script is executable
      try {
        fs.chmodSync(pythonScript, '755');
      } catch (err) {
        console.log('Note: Unable to make script executable, continuing anyway');
      }
    }
    
    // Log the command being executed to help with debugging
    const command = `python3 "${pythonScript}" "${filePath}"`;
    console.log(`Executing command: ${command}`);
    
    // Try with python3 first (common on Linux/Mac)
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing EPUB with python3: ${error.message}`);
        console.error(`Command was: ${command}`);
        if (stderr) {
          console.error(`STDERR: ${stderr}`);
        }
        
        // Fall back to 'python' command (common on Windows)
        const fallbackCommand = `python "${pythonScript}" "${filePath}"`;
        console.log(`Trying fallback command: ${fallbackCommand}`);
        
        exec(fallbackCommand, (fallbackError, fallbackStdout, fallbackStderr) => {
          if (fallbackError) {
            console.error(`Error processing EPUB with python fallback: ${fallbackError.message}`);
            console.error(`Fallback command was: ${fallbackCommand}`);
            if (fallbackStderr) {
              console.error(`STDERR: ${fallbackStderr}`);
            }
            
            reject(new Error(`Failed to process EPUB file: ${fallbackError.message}`));
            return;
          }
          
          if (fallbackStderr) {
            console.error(`EPUB processing stderr (python fallback): ${fallbackStderr}`);
          }
          
          if (!fallbackStdout || fallbackStdout.trim() === '') {
            reject(new Error('No text extracted from EPUB file'));
            return;
          }
          
          resolve(cleanText(fallbackStdout));
        });
        return;
      }
      
      if (stderr) {
        console.error(`EPUB processing stderr: ${stderr}`);
      }
      
      if (!stdout || stdout.trim() === '') {
        reject(new Error('No text extracted from EPUB file'));
        return;
      }
      
      resolve(cleanText(stdout));
    });
  });
};

module.exports = {
  processTextFile,
  processPdfFile,
  processEpubFile
};

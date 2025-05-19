
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const pdfParse = require('pdf-parse');
const { exec } = require('child_process');
const { cleanText } = require('./textCleaner');

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

// Process EPUB files using Python script
const processEpubFile = (filePath) => {
  return new Promise((resolve, reject) => {
    // Get the absolute path to the Python script
    const pythonScript = path.resolve(__dirname, '..', 'scripts', 'epub_converter.py');
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname, '..', 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Log the command being executed to help with debugging
    const command = `python3 "${pythonScript}" "${filePath}"`;
    console.log(`Executing command: ${command}`);
    
    // Try with python3 first (common on Linux/Mac)
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error processing EPUB with python3: ${error.message}`);
        // Fall back to 'python' command (common on Windows)
        exec(`python "${pythonScript}" "${filePath}"`, (fallbackError, fallbackStdout, fallbackStderr) => {
          if (fallbackError) {
            console.error(`Error processing EPUB with python fallback: ${fallbackError.message}`);
            reject(fallbackError);
            return;
          }
          
          if (fallbackStderr) {
            console.error(`EPUB processing stderr (python fallback): ${fallbackStderr}`);
          }
          
          resolve(cleanText(fallbackStdout));
        });
        return;
      }
      
      if (stderr) {
        console.error(`EPUB processing stderr: ${stderr}`);
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

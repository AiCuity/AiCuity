
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

// Process EPUB files (using Python subprocess)
const processEpubFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', 'scripts', 'epub_converter.py');
    
    // Create scripts directory if it doesn't exist
    const scriptsDir = path.join(__dirname, '..', 'scripts');
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

module.exports = {
  processTextFile,
  processPdfFile,
  processEpubFile
};

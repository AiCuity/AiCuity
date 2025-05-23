
const { exec } = require('child_process');

/**
 * Check if Python is installed and accessible
 */
const checkPython = () => {
  return new Promise((resolve, reject) => {
    // First try python3 (common on Unix-based systems)
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        // Fall back to python (common on Windows)
        exec('python --version', (fallbackError, fallbackStdout, fallbackStderr) => {
          if (fallbackError) {
            reject({
              status: 'error',
              message: 'Python is not installed or accessible',
              error: fallbackError.message
            });
            return;
          }
          
          resolve({
            status: 'ok',
            message: 'Python is accessible',
            version: fallbackStdout.trim()
          });
        });
        return;
      }
      
      resolve({
        status: 'ok',
        message: 'Python3 is accessible',
        version: stdout.trim()
      });
    });
  });
};

/**
 * Get API health status
 */
const getHealthStatus = () => {
  return {
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  checkPython,
  getHealthStatus
};

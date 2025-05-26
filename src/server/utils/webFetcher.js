
const https = require('https');
const http = require('http');

// Fetch HTML from URL with improved error handling and connection management
const fetchHtml = (url, signal) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    // Parse URL to get options
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AiCuity/1.0; +https://aicuity.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 20000, // 20 second timeout
    };
    
    const req = protocol.request(options, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = new URL(response.headers.location, url).toString();
        console.log(`Redirecting to: ${redirectUrl}`);
        fetchHtml(redirectUrl, signal).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (data.length === 0) {
          reject(new Error('Empty response received'));
          return;
        }
        console.log(`Received ${data.length} characters from ${url}`);
        resolve(data);
      });
      
      response.on('error', (err) => {
        reject(new Error(`Response error: ${err.message}`));
      });
    });
    
    req.on('error', (err) => {
      reject(new Error(`Request error: ${err.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    // Handle abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        req.destroy();
        reject(new Error('Request aborted'));
      });
    }
    
    req.end();
  });
};

module.exports = {
  fetchHtml
};

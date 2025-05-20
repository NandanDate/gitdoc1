import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";
import https from 'https';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET requests
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!appId || !privateKey) {
      return res.status(500).json({ 
        error: "GitHub App configuration is missing",
        message: "App ID or private key is not configured"
      });
    }

    // Generate a JWT token for GitHub App authentication
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + (5 * 60), // Expires in 5 minutes (reduced from 10)
      iss: appId
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // Make a direct request to GitHub API to list installations
    const options = {
      hostname: 'api.github.com',
      path: '/app/installations',
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'GitHub-App-Node-Client'
      }
    };

    const installationsData = await makeRequest(options);
    const installations = JSON.parse(installationsData);

    // Return the list of installations
    return res.status(200).json({ installations });
  } catch (error) {
    console.error("Error in raw-installations endpoint:", error);
    return res.status(500).json({ 
      error: "Failed to authenticate with GitHub App",
      message: error.message
    });
  }
}

// Helper function to make HTTP requests
function makeRequest(options: https.RequestOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
} 
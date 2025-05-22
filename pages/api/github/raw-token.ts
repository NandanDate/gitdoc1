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

    const { installationId } = req.query;

    if (!installationId) {
      return res.status(400).json({ error: "Installation ID is required" });
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

    // Create an installation token
    const options = {
      hostname: 'api.github.com',
      path: `/app/installations/${installationId}/access_tokens`,
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'CodeBooks',
        'Content-Type': 'application/json'
      }
    };

    const tokenData = await makeRequest(options, JSON.stringify({
      permissions: {
        contents: "read",
        metadata: "read"
      }
    }));
    
    const tokenResponse = JSON.parse(tokenData);

    // Return the installation token
    return res.status(200).json({
      token: tokenResponse.token,
      expiresAt: tokenResponse.expires_at,
      permissions: tokenResponse.permissions
    });
  } catch (error) {
    console.error("Error in raw-token endpoint:", error);
    return res.status(500).json({
      error: "Failed to generate installation token",
      message: error.message,
    });
  }
}

// Helper function to make HTTP requests
function makeRequest(options: https.RequestOptions, body?: string): Promise<string> {
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
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
} 
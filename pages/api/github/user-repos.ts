import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
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

    // Get user session to access their token
    const session = await getSession({ req });

    if (!session || !session.accessToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Make a request to GitHub API to get user's repositories
    const options = {
      hostname: 'api.github.com',
      path: '/user/repos?per_page=100&sort=updated',
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${session.accessToken}`,
        'User-Agent': 'CodeBooks'
      }
    };

    try {
      const reposData = await makeRequest(options);
      const repos = JSON.parse(reposData);
      
      // Return the repositories data
      return res.status(200).json(repos);
    } catch (apiError) {
      console.error("GitHub API error:", apiError);
      return res.status(500).json({
        error: "GitHub API error",
        message: apiError.message
      });
    }
  } catch (error) {
    console.error("Error in user-repos endpoint:", error);
    return res.status(500).json({
      error: "Failed to fetch user repositories",
      message: error.message,
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
          let errorMsg = `Request failed with status code ${res.statusCode}`;
          try {
            // Try to parse error response
            const errorData = JSON.parse(data);
            if (errorData.message) {
              errorMsg += `: ${errorData.message}`;
            }
          } catch (e) {
            // If can't parse, just return the data
            errorMsg += `: ${data}`;
          }
          reject(new Error(errorMsg));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
} 
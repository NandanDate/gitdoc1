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
      path: '/user/repos?per_page=100&sort=updated&visibility=all&affiliation=owner,collaborator,organization_member',
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${session.accessToken}`,
        'User-Agent': 'CodeBooks'
      }
    };

    try {
      const reposData = await makeRequest(options);
      
      // Log the raw response for debugging
      console.log('Raw GitHub API Response:', reposData);
      
      let repos;
      try {
        repos = JSON.parse(reposData);
        
        // Log parsed data for debugging
        console.log('GitHub API Response Stats:', {
          totalRepos: repos.length,
          privateRepos: repos.filter(r => r.private).length,
          publicRepos: repos.filter(r => !r.private).length,
          repoDetails: repos.map(r => ({
            name: r.full_name,
            private: r.private,
            permissions: r.permissions
          }))
        });
        
        // Validate response format
        if (!Array.isArray(repos)) {
          console.error('Invalid response format:', repos);
          throw new Error('Invalid response format from GitHub API');
        }
        
        // Return the repositories data
        return res.status(200).json(repos);
      } catch (parseError) {
        console.error('Failed to parse GitHub response:', parseError);
        console.error('Raw response:', reposData);
        throw new Error('Failed to parse GitHub API response');
      }
    } catch (apiError) {
      // Debug information about the error
      console.error("GitHub API Error Details:", {
        message: apiError.message,
        headers: apiError.headers,
        response: apiError.response,
        stack: apiError.stack
      });
      
      // Check for specific error types
      if (apiError.message.includes('Bad credentials')) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Your GitHub token is invalid or expired. Please try signing in again."
        });
      } else if (apiError.message.includes('API rate limit exceeded')) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "GitHub API rate limit exceeded. Please try again later."
        });
      } else if (apiError.message.includes('Not Found')) {
        return res.status(404).json({
          error: "Not found",
          message: "The requested resource was not found. Please check your permissions."
        });
      }
      
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
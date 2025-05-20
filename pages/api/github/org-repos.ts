import { NextApiRequest, NextApiResponse } from "next";
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

    const { orgName, installationToken, userAccessToken } = req.query;

    if (!orgName) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    if (!installationToken) {
      return res.status(400).json({ error: "Installation token is required" });
    }

    // Validate that installationToken is a string
    if (typeof installationToken !== 'string') {
      return res.status(400).json({ 
        error: "Invalid installation token format", 
        message: "Token must be a string" 
      });
    }

    // First, get all repositories via installation token
    const options = {
      hostname: 'api.github.com',
      path: `/orgs/${orgName}/repos?per_page=100`,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${installationToken}`,
        'User-Agent': 'GitHub-App-Node-Client'
      }
    };

    try {
      // Get all repositories for the organization using installation token
      const reposData = await makeRequest(options);
      const allRepos = JSON.parse(reposData);
      
      if (allRepos.length === 0) {
        return res.status(200).json({ 
          repos: [],
          message: "No repositories found"
        });
      }
      
      // If user access token is provided, filter repos by user access
      if (userAccessToken && typeof userAccessToken === 'string') {
        // First check which org the user belongs to
        const userOrgsOptions = {
          hostname: 'api.github.com',
          path: `/user/orgs`,
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${userAccessToken}`,
            'User-Agent': 'GitHub-App-Node-Client'
          }
        };
        
        const userOrgsData = await makeRequest(userOrgsOptions);
        const userOrgs = JSON.parse(userOrgsData);
        const userOrgLogins = userOrgs.map(org => org.login.toLowerCase());
        
        const isMemberOfCurrentOrg = userOrgLogins.includes(orgName.toString().toLowerCase());
        
        if (!isMemberOfCurrentOrg) {
          return res.status(200).json({ 
            repos: [],
            message: "User is not a member of this organization"
          });
        }
        
        // Get the repositories the user has access to
        const userReposOptions = {
          hostname: 'api.github.com',
          path: `/user/repos?per_page=100&type=all&sort=updated`,
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${userAccessToken}`,
            'User-Agent': 'GitHub-App-Node-Client'
          }
        };
        
        const userReposData = await makeRequest(userReposOptions);
        const userRepos = JSON.parse(userReposData);
        
        // Filter to just this org's repos
        const userOrgRepos = userRepos.filter(repo => 
          repo.owner.login.toLowerCase() === orgName.toString().toLowerCase()
        );
        
        // Create a set of repo full names the user has access to
        const userRepoSet = new Set(
          userOrgRepos.map(repo => repo.full_name.toLowerCase())
        );
        
        // Filter organization repos to only those the user has access to
        const filteredRepos = allRepos.filter(repo => 
          userRepoSet.has(repo.full_name.toLowerCase())
        );
        
        return res.status(200).json({ repos: filteredRepos });
      }
      
      // If no user token, return all repos (for admins)
      return res.status(200).json({ repos: allRepos });
    } catch (apiError) {
      console.error("GitHub API error:", apiError);
      return res.status(500).json({
        error: "GitHub API error",
        message: apiError.message
      });
    }
  } catch (error) {
    console.error("Error in org-repos endpoint:", error);
    return res.status(500).json({
      error: "Failed to fetch organization repositories",
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
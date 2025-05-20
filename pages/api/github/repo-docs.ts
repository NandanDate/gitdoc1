import { getToken } from "next-auth/jwt";
import axios from "axios";

export default async function handler(req, res) {
  // Get token from the authorization header or from NextAuth
  let accessToken = null;
  
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('token ')) {
    accessToken = authHeader.substring(6);
  } else {
    // Fall back to NextAuth token
    const token = await getToken({ req });
    if (!token || !token.accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    accessToken = token.accessToken;
  }

  const { owner, repo } = req.query;
  
  if (!owner || !repo) {
    return res.status(400).json({ error: "Owner and repo parameters are required" });
  }

  try {
    // First, try to fetch the .docs directory content
    const docsContentResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/.docs`, 
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );

    // Process the response to get file information
    const files = docsContentResponse.data.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      download_url: item.download_url,
      url: item.url
    }));

    res.status(200).json({ files });
  } catch (err) {
    // Check if the error is because .docs doesn't exist
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: "No .docs directory found in this repository" });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch documentation", 
      message: err.message 
    });
  }
} 
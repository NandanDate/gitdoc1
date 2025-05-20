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

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    // For raw content, we can use the download_url directly
    const response = await axios.get(url as string, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });

    res.status(200).json({ content: response.data });
  } catch (err) {
    res.status(500).json({ 
      error: "Failed to fetch file content", 
      message: err.message 
    });
  }
} 
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { repo_url, branch, debug } = req.body;

    if (!repo_url || !branch) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await fetch('http://192.168.1.60:8080/api/generate-readme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo_url,
        branch,
        debug,
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error generating README:', error);
    return res.status(500).json({ error: 'Failed to generate README' });
  }
} 
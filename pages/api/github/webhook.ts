import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

// This is a basic webhook handler for GitHub pushes
// In a production app, you'd want to validate payloads, use a database to cache content, etc.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature if you have a secret configured
  const signature = req.headers['x-hub-signature-256'] as string;
  if (process.env.GITHUB_WEBHOOK_SECRET && !verifySignature(req.body, signature, process.env.GITHUB_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'] as string;
  const payload = req.body;

  try {
    // Handle different event types
    switch (event) {
      case 'push':
        // Check if the push affects the .docs directory
        const changedFiles = getChangedFiles(payload);
        const docsChanged = changedFiles.some(file => file.startsWith('.docs/'));
        
        if (docsChanged) {
          // In a real app, you would invalidate your cache and trigger a rebuild
          // or update the content for this repository
          
          console.log(`Documentation changed in ${payload.repository.full_name}`);
          
          // Here you would process the changes
          // await updateDocumentation(payload.repository.full_name);
        }
        break;
        
      case 'repository':
        // Handle repository events (created, deleted, etc.)
        if (payload.action === 'created' || payload.action === 'publicized') {
          console.log(`New repository: ${payload.repository.full_name}`);
          // await indexNewRepository(payload.repository.full_name);
        } else if (payload.action === 'deleted' || payload.action === 'privatized') {
          console.log(`Repository removed: ${payload.repository.full_name}`);
          // await removeRepositoryFromIndex(payload.repository.full_name);
        }
        break;
        
      default:
        // Ignore other events
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}

// Extract changed files from a push event payload
function getChangedFiles(payload: any): string[] {
  const files: string[] = [];
  
  if (payload.commits) {
    payload.commits.forEach((commit: any) => {
      if (commit.added) files.push(...commit.added);
      if (commit.modified) files.push(...commit.modified);
      if (commit.removed) files.push(...commit.removed);
    });
  }
  
  return Array.from(new Set(files)); // Remove duplicates
}

// Verify webhook signature
function verifySignature(payload: any, signature: string, secret: string): boolean {
  if (!signature) return false;
  
  const payloadString = typeof payload === 'string' 
    ? payload 
    : JSON.stringify(payload);
    
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payloadString).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
} 
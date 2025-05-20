# Centralized GitHub Documentation System

A Next.js application that centralizes your organization's GitHub repository documentation by fetching and displaying `.docs` folders from repositories.

## Features

- GitHub OAuth Authentication
- GitHub App for broader organizational access
- Fetches all user's repositories
- Displays documentation from `.docs` folder in each repository
- Markdown rendering with syntax highlighting

## Setup

### 1. Create a GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Set the Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env.local` file

### 2. Create a GitHub App (Optional, for organizational access)

1. Go to GitHub Settings > Developer settings > GitHub Apps > New GitHub App
2. Set the required permissions (repository read access)
3. Generate a private key
4. Copy the App ID and Private Key to your `.env.local` file

### 3. Environment Configuration

Create a `.env.local` file with the following variables:

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Usage

1. Open http://localhost:3000 in your browser
2. Sign in with your GitHub account
3. Browse your repositories
4. Click "View Docs" on a repository to see its documentation (if it has a `.docs` folder)

## Documentation Format

Create a `.docs` folder in your repository root with markdown files:

```
your-repo/
  .docs/
    getting-started.md
    api-reference.md
    contributing.md
    ...
```

## Extending

### Adding Search

To add search functionality to the documentation:

1. Install a search library like Algolia or use GitHub's search API
2. Create an index of documentation content
3. Implement the search UI in the application

### Webhooks

To automatically update documentation when repositories change:

1. Add a webhook endpoint in your application
2. Configure GitHub repository webhooks
3. Update the documentation cache when webhook events are received
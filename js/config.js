/**
 * Frontend configuration
 * Update API_URL with your Render backend URL
 */

const CONFIG = {
  // Backend API URL (update this with your Render service URL after deployment)
  API_URL: 'https://threadforge-backend.onrender.com',
  
  // GitHub repository for forum data (for direct JSON reads)
  GITHUB_RAW_BASE: 'https://raw.githubusercontent.com',
  GITHUB_OWNER: 'Martinezworldwide', // GitHub username
  GITHUB_REPO: 'threadforge_data', // Forum data repository name
  GITHUB_BRANCH: 'main',
  
  // JWT token storage key
  TOKEN_KEY: 'forum_jwt_token',
  USER_KEY: 'forum_user_data'
};

// Helper to get GitHub raw URL for a file
function getGitHubRawUrl(path) {
  return `${CONFIG.GITHUB_RAW_BASE}/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/${CONFIG.GITHUB_BRANCH}/${path}`;
}

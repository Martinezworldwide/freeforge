/**
 * API client for backend communication
 * Handles authenticated write requests
 */

// Fetch JSON from GitHub (direct read)
async function fetchFromGitHub(path) {
  try {
    const url = getGitHubRawUrl(path);
    console.log('Fetching from GitHub:', url); // Debug log
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`File not found: ${path} (404)`);
        return null;
      }
      throw new Error(`Failed to fetch ${path}: ${response.statusText} (${response.status})`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${path}:`, data); // Debug log
    return data;
  } catch (error) {
    console.error('GitHub fetch error:', error);
    console.error('URL attempted:', getGitHubRawUrl(path));
    throw error;
  }
}

// API request helper
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method: method,
      headers: getAuthHeaders()
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Forum API methods

// Create forum
async function createForum(data) {
  return apiRequest('/api/forums', 'POST', data);
}

// Update forum customization
async function updateForumCustomization(forumSlug, data) {
  return apiRequest(`/api/forums/${forumSlug}/customize`, 'PUT', data);
}

// Create announcement
async function createAnnouncement(forumSlug, data) {
  return apiRequest(`/api/forums/${forumSlug}/announcements`, 'POST', data);
}

// Delete announcement
async function deleteAnnouncement(forumSlug, announcementId) {
  return apiRequest(`/api/forums/${forumSlug}/announcements/${announcementId}`, 'DELETE');
}

// Create quick reference
async function createQuickReference(forumSlug, data) {
  return apiRequest(`/api/forums/${forumSlug}/quick-references`, 'POST', data);
}

// Delete quick reference
async function deleteQuickReference(forumSlug, referenceId) {
  return apiRequest(`/api/forums/${forumSlug}/quick-references/${referenceId}`, 'DELETE');
}

// Create board
async function createBoard(forumSlug, data) {
  return apiRequest(`/api/forums/${forumSlug}/boards`, 'POST', data);
}

// Create thread
async function createThread(forumSlug, boardId, data) {
  return apiRequest(`/api/forums/${forumSlug}/boards/${boardId}/threads`, 'POST', data);
}

// Create post
async function createPost(forumSlug, threadId, data) {
  return apiRequest(`/api/forums/${forumSlug}/threads/${threadId}/posts`, 'POST', data);
}

// Edit post
async function editPost(forumSlug, postId, data) {
  return apiRequest(`/api/forums/${forumSlug}/posts/${postId}`, 'PUT', data);
}

// Delete post
async function deletePost(forumSlug, postId) {
  return apiRequest(`/api/forums/${forumSlug}/posts/${postId}`, 'DELETE');
}

// Data fetching methods (read-through backend for private repo)

// Get forums index
async function getForumsIndex() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/data/forums/index.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch forums index: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Forums index from backend:', data);
    return data;
  } catch (error) {
    console.error('Error fetching forums index:', error);
    throw error;
  }
}

// Get forum data
async function getForum(forumSlug) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/data/forums/${forumSlug}/forum.json`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch forum: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching forum:', error);
    throw error;
  }
}

// Get boards for a forum
async function getBoards(forumSlug) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/data/forums/${forumSlug}/boards.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch boards: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching boards:', error);
    throw error;
  }
}

// Get threads for a forum
async function getThreads(forumSlug) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/data/forums/${forumSlug}/threads.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch threads: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
}

// Get posts for a forum
async function getPosts(forumSlug) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/data/forums/${forumSlug}/posts.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Get users data (not typically needed by frontend, but available if needed)
async function getUsers() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/data/users.json`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return null;
  }
}

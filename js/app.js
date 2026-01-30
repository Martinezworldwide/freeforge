/**
 * Main application entry point
 * Sets up routes and initializes the app
 */

// Register routes
router.route('/', renderHome);
router.route('/forum/:slug', renderForum);
router.route('/forum/:slug/board/:boardId', renderBoard);
router.route('/forum/:slug/thread/:threadId', renderThread);

// Initialize router after routes are registered
router.init();

// Modal functions

// Show authentication modal
function showAuthModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Login / Register</h2>
      <div class="auth-form">
        <input type="text" id="auth-username" placeholder="Username" maxlength="50">
        <div class="auth-buttons">
          <button class="btn btn-primary" onclick="handleLogin()">Login</button>
          <button class="btn btn-secondary" onclick="handleRegister()">Register</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Show create forum modal
function showCreateForumModal() {
  if (!isAuthenticated()) {
    showAuthModal();
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Create Forum</h2>
      <div class="form">
        <label>Forum Name</label>
        <input type="text" id="forum-name" placeholder="My Awesome Forum" maxlength="100">
        
        <label>Slug (URL-friendly identifier)</label>
        <input type="text" id="forum-slug" placeholder="my-awesome-forum" maxlength="50" pattern="[a-z0-9-]+">
        <small>Lowercase letters, numbers, and hyphens only</small>
        
        <label>Rules (optional)</label>
        <textarea id="forum-rules" rows="5" placeholder="Forum rules..." maxlength="5000"></textarea>
        
        <label>Visibility</label>
        <select id="forum-visibility">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        
        <details>
          <summary style="cursor: pointer; margin-top: 15px; font-weight: 500;">Advanced Customization (Optional)</summary>
          <div style="margin-top: 10px;">
            <label>Custom CSS (InvisionFree-style skins)</label>
            <textarea id="forum-customCSS" rows="8" placeholder="/* Paste your custom CSS here */&#10;.forum-card { background: #f0f0f0; }" maxlength="50000"></textarea>
            <small>Add custom CSS to style your forum. Max 50,000 characters.</small>
            
            <label style="margin-top: 15px;">Custom Bullet Point Image URL</label>
            <input type="url" id="forum-bulletImageUrl" placeholder="https://i.pinimg.com/..." maxlength="500">
            <small>Paste a Pinterest image URL (or any image URL) to use as bullet points. Leave empty for default.</small>
          </div>
        </details>
        
        <button class="btn btn-primary" onclick="handleCreateForum()">Create Forum</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Show create board modal
function showCreateBoardModal(forumSlug) {
  if (!isAuthenticated()) {
    showAuthModal();
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Create Board</h2>
      <div class="form">
        <label>Board Name</label>
        <input type="text" id="board-name" placeholder="General Discussion" maxlength="100">
        
        <label>Description (optional)</label>
        <textarea id="board-description" rows="3" placeholder="Board description..." maxlength="500"></textarea>
        
        <button class="btn btn-primary" onclick="handleCreateBoard('${forumSlug}')">Create Board</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Show create thread modal
function showCreateThreadModal(forumSlug, boardId) {
  if (!isAuthenticated()) {
    showAuthModal();
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>New Thread</h2>
      <div class="form">
        <label>Title</label>
        <input type="text" id="thread-title" placeholder="Thread title" maxlength="200">
        
        <label>Content</label>
        <textarea id="thread-content" rows="8" placeholder="Write your post..." maxlength="10000"></textarea>
        
        <button class="btn btn-primary" onclick="handleCreateThread('${forumSlug}', '${boardId}')">Create Thread</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Show customize forum modal
function showCustomizeForumModal(forumSlug) {
  if (!isAuthenticated()) {
    return;
  }

  // Fetch current forum data
  getForum(forumSlug).then(forum => {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
        <h2>Customize Forum</h2>
        <div class="form">
          <label>Custom CSS (InvisionFree-style skins)</label>
          <textarea id="customize-customCSS" rows="12" placeholder="/* Paste your custom CSS here */" maxlength="50000">${(forum.customCSS || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
          <small>Add custom CSS to style your forum. Max 50,000 characters.</small>
          
          <label style="margin-top: 15px;">Custom Bullet Point Image URL</label>
          <input type="url" id="customize-bulletImageUrl" placeholder="https://i.pinimg.com/..." value="${(forum.bulletImageUrl || '').replace(/"/g, '&quot;')}" maxlength="500">
          <small>Paste a Pinterest image URL (or any image URL) to use as bullet points. Leave empty for default.</small>
          
          <div style="margin-top: 20px;">
            <button class="btn btn-primary" onclick="handleUpdateForumCustomization('${forumSlug}')">Save Customization</button>
            <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }).catch(error => {
    showNotification('Error loading forum: ' + error.message, 'error');
  });
}

// Handle update forum customization
async function handleUpdateForumCustomization(forumSlug) {
  const customCSS = document.getElementById('customize-customCSS').value.trim();
  const bulletImageUrl = document.getElementById('customize-bulletImageUrl').value.trim();

  try {
    showLoading();
    await updateForumCustomization(forumSlug, { customCSS, bulletImageUrl });
    showNotification('Forum customization updated successfully!', 'success');
    document.querySelector('.modal').remove();
    // Refresh the forum view
    setTimeout(() => {
      router.navigate(`/forum/${forumSlug}`);
    }, 1000);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Show edit post modal
function showEditPostModal(forumSlug, postId, currentContent) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Edit Post</h2>
      <div class="form">
        <label>Content</label>
        <textarea id="edit-post-content" rows="8" maxlength="10000">${currentContent}</textarea>
        
        <button class="btn btn-primary" onclick="handleEditPost('${forumSlug}', '${postId}')">Save Changes</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Event handlers

// Handle login
async function handleLogin() {
  const username = document.getElementById('auth-username').value.trim();
  
  if (!username) {
    showNotification('Please enter a username', 'error');
    return;
  }

  try {
    showLoading();
    await login(username);
    showNotification('Logged in successfully', 'success');
    document.querySelector('.modal').remove();
    router.navigate('/');
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle register
async function handleRegister() {
  const username = document.getElementById('auth-username').value.trim();
  
  if (!username) {
    showNotification('Please enter a username', 'error');
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    showNotification('Username must be alphanumeric with underscores or hyphens only', 'error');
    return;
  }

  try {
    showLoading();
    await register(username);
    showNotification('Registered successfully', 'success');
    document.querySelector('.modal').remove();
    router.navigate('/');
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle create forum
async function handleCreateForum() {
  const name = document.getElementById('forum-name').value.trim();
  const slug = document.getElementById('forum-slug').value.trim().toLowerCase();
  const rules = document.getElementById('forum-rules').value.trim();
  const visibility = document.getElementById('forum-visibility').value;
  const customCSS = document.getElementById('forum-customCSS')?.value.trim() || '';
  const bulletImageUrl = document.getElementById('forum-bulletImageUrl')?.value.trim() || '';

  if (!name || !slug) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    showNotification('Slug must be lowercase alphanumeric with hyphens only', 'error');
    return;
  }

  try {
    showLoading();
    const result = await createForum({ name, slug, rules, visibility, customCSS, bulletImageUrl });
    console.log('Forum creation result:', result); // Debug log
    showNotification('Forum created successfully! Refreshing in 10 seconds...', 'success');
    document.querySelector('.modal').remove();
    // Wait longer for GitHub to update (GitHub API can take 5-10 seconds)
    setTimeout(() => {
      // Force reload to get fresh data from GitHub
      console.log('Refreshing page to load new forum...');
      window.location.reload();
    }, 10000);
  } catch (error) {
    showNotification(error.message, 'error');
    hideLoading();
  }
}

// Handle create board
async function handleCreateBoard(forumSlug) {
  const name = document.getElementById('board-name').value.trim();
  const description = document.getElementById('board-description').value.trim();

  if (!name) {
    showNotification('Please enter a board name', 'error');
    return;
  }

  try {
    showLoading();
    await createBoard(forumSlug, { name, description });
    showNotification('Board created successfully', 'success');
    document.querySelector('.modal').remove();
    setTimeout(() => {
      router.navigate(`/forum/${forumSlug}`);
    }, 2000);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle create thread
async function handleCreateThread(forumSlug, boardId) {
  const title = document.getElementById('thread-title').value.trim();
  const content = document.getElementById('thread-content').value.trim();

  if (!title || !content) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  try {
    showLoading();
    await createThread(forumSlug, boardId, { title, content });
    showNotification('Thread created successfully', 'success');
    document.querySelector('.modal').remove();
    // Refresh the board view to show new thread
    setTimeout(() => {
      router.navigate(`/forum/${forumSlug}/board/${boardId}`);
    }, 2000);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle create post
async function handleCreatePost(forumSlug, threadId) {
  const content = document.getElementById('post-content').value.trim();

  if (!content) {
    showNotification('Please enter post content', 'error');
    return;
  }

  try {
    showLoading();
    await createPost(forumSlug, threadId, { content });
    showNotification('Post created successfully', 'success');
    document.getElementById('post-content').value = '';
    // Refresh the thread view
    setTimeout(() => {
      router.navigate(`/forum/${forumSlug}/thread/${threadId}`);
    }, 2000);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle edit post
async function handleEditPost(forumSlug, postId) {
  const content = document.getElementById('edit-post-content').value.trim();

  if (!content) {
    showNotification('Post content cannot be empty', 'error');
    return;
  }

  try {
    showLoading();
    await editPost(forumSlug, postId, { content });
    showNotification('Post updated successfully', 'success');
    document.querySelector('.modal').remove();
    // Refresh the thread view
    const threadId = window.location.hash.split('/').pop();
    setTimeout(() => {
      router.navigate(`/forum/${forumSlug}/thread/${threadId}`);
    }, 2000);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle delete post
async function handleDeletePost(forumSlug, postId) {
  if (!confirm('Are you sure you want to delete this post?')) {
    return;
  }

  try {
    showLoading();
    await deletePost(forumSlug, postId);
    showNotification('Post deleted successfully', 'success');
    // Refresh the thread view
    const threadId = window.location.hash.split('/').pop();
    setTimeout(() => {
      router.navigate(`/forum/${forumSlug}/thread/${threadId}`);
    }, 2000);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Router is initialized after routes are registered above

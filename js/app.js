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
      <h2>Login</h2>
      <div class="auth-form">
        <input type="text" id="auth-username" placeholder="Username" maxlength="50" autocomplete="username">
        <input type="password" id="auth-password" placeholder="Password" maxlength="128" autocomplete="current-password">
        <div class="auth-buttons">
          <button class="btn btn-primary" onclick="handleLogin()">Login</button>
          <button class="btn btn-secondary" onclick="showRegisterModal()">Register</button>
        </div>
        <div style="margin-top: 15px; text-align: center;">
          <a href="#" onclick="showPasswordResetModal(); return false;" style="color: #3498db; text-decoration: none; font-size: 14px;">Forgot Password?</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Show registration modal
function showRegisterModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Register</h2>
      <div class="form">
        <label>Username</label>
        <input type="text" id="register-username" placeholder="Username" maxlength="50" autocomplete="username">
        <small>Alphanumeric, underscores, and hyphens only</small>
        
        <label>Password</label>
        <input type="password" id="register-password" placeholder="Password (min 8 chars, must include letter and number)" maxlength="128" autocomplete="new-password">
        <small>Minimum 8 characters, must contain at least one letter and one number</small>
        
        <label>Security Question</label>
        <input type="text" id="register-security-question" placeholder="e.g., What city were you born in?" maxlength="200">
        <small>Used for password recovery</small>
        
        <label>Security Answer</label>
        <input type="text" id="register-security-answer" placeholder="Your answer" maxlength="200" autocomplete="off">
        <small>Remember this answer - you'll need it to reset your password</small>
        
        <button class="btn btn-primary" onclick="handleRegister()">Register</button>
        <button class="btn btn-secondary" onclick="showAuthModal(); this.closest('.modal').remove();">Back to Login</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Show password reset modal
function showPasswordResetModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Reset Password</h2>
      <div class="form" id="password-reset-form">
        <label>Username</label>
        <input type="text" id="reset-username" placeholder="Enter your username" maxlength="50">
        <button class="btn btn-primary" onclick="handleGetSecurityQuestion()">Continue</button>
      </div>
      <div class="form" id="security-question-form" style="display: none;">
        <label id="security-question-label">Security Question</label>
        <input type="text" id="reset-security-answer" placeholder="Your answer" maxlength="200" autocomplete="off">
        <label style="margin-top: 15px;">New Password</label>
        <input type="password" id="reset-new-password" placeholder="New password (min 8 chars)" maxlength="128" autocomplete="new-password">
        <small>Minimum 8 characters, must contain at least one letter and one number</small>
        <button class="btn btn-primary" onclick="handleResetPassword()">Reset Password</button>
        <button class="btn btn-secondary" onclick="document.getElementById('password-reset-form').style.display='block'; document.getElementById('security-question-form').style.display='none';">Back</button>
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
          <summary style="cursor: pointer; margin-top: 15px; font-weight: 500;">Visual Customization (Optional)</summary>
          <div style="margin-top: 10px;">
            <label>Header/Banner Image URL</label>
            <input type="url" id="forum-headerImageUrl" placeholder="https://i.pinimg.com/..." maxlength="500">
            <small><strong>Important:</strong> Use direct image URLs (e.g., https://i.pinimg.com/...). For Pinterest: Right-click the image → "Copy image address". Do NOT use pin.it links.</small>
            
            <label style="margin-top: 15px;">Logo Image URL</label>
            <input type="url" id="forum-logoImageUrl" placeholder="https://i.pinimg.com/..." maxlength="500">
            <small>Use direct image URLs. For Pinterest: Right-click image → "Copy image address"</small>
            
            <label style="margin-top: 15px;">Custom Bullet Point Image URL</label>
            <input type="url" id="forum-bulletImageUrl" placeholder="https://i.pinimg.com/..." maxlength="500">
            <small>Use direct image URLs. For Pinterest: Right-click image → "Copy image address"</small>
            
            <label style="margin-top: 15px;">Homepage Layout</label>
            <select id="forum-homepageLayout">
              <option value="1-column">1 Column (Default)</option>
              <option value="2-column">2 Columns</option>
              <option value="3-column">3 Columns</option>
            </select>
            <small>Choose how many columns for homepage content</small>
          </div>
        </details>
        
        <details>
          <summary style="cursor: pointer; margin-top: 15px; font-weight: 500;">Advanced CSS (Optional)</summary>
          <div style="margin-top: 10px;">
            <label>Custom CSS (InvisionFree-style skins)</label>
            <textarea id="forum-customCSS" rows="8" placeholder="/* Paste your custom CSS here */&#10;.forum-card { background: #f0f0f0; }" maxlength="50000"></textarea>
            <small>Add custom CSS to style your forum. Max 50,000 characters.</small>
          </div>
        </details>
        
        <label style="margin-top: 15px;">Welcome Message (Optional)</label>
        <textarea id="forum-welcomeMessage" rows="3" placeholder="Welcome to our forum!" maxlength="1000"></textarea>
        <small>Custom welcome message displayed on homepage</small>
        
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
      <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
        <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
        <h2>Customize Forum</h2>
        
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button class="btn btn-secondary" onclick="showCustomizeTab('${forumSlug}', 'visual')">Visual</button>
          <button class="btn btn-secondary" onclick="showCustomizeTab('${forumSlug}', 'content')">Content</button>
          <button class="btn btn-secondary" onclick="showCustomizeTab('${forumSlug}', 'css')">CSS</button>
          <button class="btn btn-secondary" onclick="showCustomizeTab('${forumSlug}', 'settings')">Settings</button>
        </div>
        
        <div id="customize-tab-content">
          <!-- Tab content will be loaded here -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Load default tab
    showCustomizeTab(forumSlug, 'visual', forum);
  }).catch(error => {
    showNotification('Error loading forum: ' + error.message, 'error');
  });
}

// Show customize tab
function showCustomizeTab(forumSlug, tab, forumData) {
  if (!forumData) {
    getForum(forumSlug).then(forum => {
      renderCustomizeTab(forumSlug, tab, forum);
    });
  } else {
    renderCustomizeTab(forumSlug, tab, forumData);
  }
}

// Render customize tab content
function renderCustomizeTab(forumSlug, tab, forum) {
  const contentDiv = document.getElementById('customize-tab-content');
  
  if (tab === 'visual') {
    contentDiv.innerHTML = `
      <div class="form">
        <label>Header/Banner Image URL</label>
        <input type="url" id="customize-headerImageUrl" placeholder="https://i.pinimg.com/..." value="${(forum.headerImageUrl || '').replace(/"/g, '&quot;')}" maxlength="500">
        <small><strong>Important:</strong> Use direct image URLs (e.g., https://i.pinimg.com/...). For Pinterest: Right-click the image → "Copy image address". Do NOT use pin.it links.</small>
        
        <label style="margin-top: 15px;">Logo Image URL</label>
        <input type="url" id="customize-logoImageUrl" placeholder="https://i.pinimg.com/..." value="${(forum.logoImageUrl || '').replace(/"/g, '&quot;')}" maxlength="500">
        <small>Use direct image URLs. For Pinterest: Right-click image → "Copy image address"</small>
        
        <label style="margin-top: 15px;">Custom Bullet Point Image URL</label>
        <input type="url" id="customize-bulletImageUrl" placeholder="https://i.pinimg.com/..." value="${(forum.bulletImageUrl || '').replace(/"/g, '&quot;')}" maxlength="500">
        <small>Use direct image URLs. For Pinterest: Right-click image → "Copy image address"</small>
        
        <label style="margin-top: 15px;">Homepage Layout</label>
        <select id="customize-homepageLayout">
          <option value="1-column" ${forum.homepageLayout === '1-column' ? 'selected' : ''}>1 Column</option>
          <option value="2-column" ${forum.homepageLayout === '2-column' ? 'selected' : ''}>2 Columns</option>
          <option value="3-column" ${forum.homepageLayout === '3-column' ? 'selected' : ''}>3 Columns</option>
        </select>
        <small>Choose how many columns for homepage content</small>
        
        <div style="margin-top: 20px;">
          <button class="btn btn-primary" onclick="handleUpdateForumCustomization('${forumSlug}')">Save Changes</button>
        </div>
      </div>
    `;
  } else if (tab === 'content') {
    const announcements = forum.announcements || [];
    const quickRefs = forum.quickReferences || [];
    
    contentDiv.innerHTML = `
      <div class="form">
        <label>Welcome Message</label>
        <textarea id="customize-welcomeMessage" rows="3" placeholder="Welcome to our forum!" maxlength="1000">${(forum.welcomeMessage || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        <small>Custom welcome message displayed on homepage</small>
        
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Announcements</h3>
        <div id="announcements-list">
          ${announcements.map(a => `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
              <strong>${escapeHtml(a.title)}</strong>
              <p style="margin: 5px 0; color: #666;">${escapeHtml(a.content.substring(0, 100))}${a.content.length > 100 ? '...' : ''}</p>
              <button class="btn btn-small btn-danger" onclick="handleDeleteAnnouncement('${forumSlug}', '${a.id}')">Delete</button>
            </div>
          `).join('')}
          ${announcements.length === 0 ? '<p style="color: #999;">No announcements yet</p>' : ''}
        </div>
        <button class="btn btn-secondary" onclick="showAddAnnouncementModal('${forumSlug}')" style="margin-top: 10px;">Add Announcement</button>
        
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Quick References</h3>
        <div id="quick-refs-list">
          ${quickRefs.map(r => `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
              <strong>${escapeHtml(r.label)}</strong> - <a href="${escapeHtml(r.url)}" target="_blank">${escapeHtml(r.url)}</a>
              <button class="btn btn-small btn-danger" onclick="handleDeleteQuickReference('${forumSlug}', '${r.id}')" style="margin-left: 10px;">Delete</button>
            </div>
          `).join('')}
          ${quickRefs.length === 0 ? '<p style="color: #999;">No quick references yet</p>' : ''}
        </div>
        <button class="btn btn-secondary" onclick="showAddQuickReferenceModal('${forumSlug}')" style="margin-top: 10px;">Add Quick Reference</button>
        
        <div style="margin-top: 20px;">
          <button class="btn btn-primary" onclick="handleUpdateForumCustomization('${forumSlug}')">Save Changes</button>
        </div>
      </div>
    `;
  } else if (tab === 'css') {
    contentDiv.innerHTML = `
      <div class="form">
        <label>Custom CSS (InvisionFree-style skins)</label>
        <textarea id="customize-customCSS" rows="15" placeholder="/* Paste your custom CSS here */" maxlength="50000">${(forum.customCSS || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        <small>Add custom CSS to style your forum. Max 50,000 characters.</small>
        
        <div style="margin-top: 20px;">
          <button class="btn btn-primary" onclick="handleUpdateForumCustomization('${forumSlug}')">Save CSS</button>
        </div>
      </div>
    `;
  } else if (tab === 'settings') {
    contentDiv.innerHTML = `
      <div class="form">
        <label>Board Limit</label>
        <input type="number" id="customize-boardLimit" placeholder="Leave empty for unlimited" value="${forum.boardLimit || ''}" min="1">
        <small>Maximum number of boards. Leave empty for unlimited.</small>
        
        <div style="margin-top: 20px;">
          <button class="btn btn-primary" onclick="handleUpdateForumCustomization('${forumSlug}')">Save Settings</button>
        </div>
      </div>
    `;
  }
}

// Show add announcement modal
function showAddAnnouncementModal(forumSlug) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Add Announcement</h2>
      <div class="form">
        <label>Title</label>
        <input type="text" id="announcement-title" placeholder="Announcement title" maxlength="200">
        
        <label>Content</label>
        <textarea id="announcement-content" rows="6" placeholder="Announcement content..." maxlength="5000"></textarea>
        
        <label>Priority</label>
        <select id="announcement-priority">
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        
        <button class="btn btn-primary" onclick="handleAddAnnouncement('${forumSlug}')">Add Announcement</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Show add quick reference modal
function showAddQuickReferenceModal(forumSlug) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
      <h2>Add Quick Reference</h2>
      <div class="form">
        <label>Label</label>
        <input type="text" id="quickref-label" placeholder="Link label" maxlength="100">
        
        <label>URL</label>
        <input type="url" id="quickref-url" placeholder="https://..." maxlength="500">
        
        <button class="btn btn-primary" onclick="handleAddQuickReference('${forumSlug}')">Add Reference</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Handle update forum customization
async function handleUpdateForumCustomization(forumSlug) {
  const customCSS = document.getElementById('customize-customCSS')?.value.trim() || '';
  const bulletImageUrl = document.getElementById('customize-bulletImageUrl')?.value.trim() || '';
  const headerImageUrl = document.getElementById('customize-headerImageUrl')?.value.trim() || '';
  const logoImageUrl = document.getElementById('customize-logoImageUrl')?.value.trim() || '';
  const welcomeMessage = document.getElementById('customize-welcomeMessage')?.value.trim() || '';
  const homepageLayout = document.getElementById('customize-homepageLayout')?.value || '1-column';
  const boardLimitInput = document.getElementById('customize-boardLimit');
  // Convert empty string to null, otherwise parse as integer
  const boardLimit = boardLimitInput && boardLimitInput.value.trim() ? parseInt(boardLimitInput.value.trim()) : null;

  try {
    showLoading();
    await updateForumCustomization(forumSlug, { 
      customCSS, bulletImageUrl, headerImageUrl, logoImageUrl,
      welcomeMessage, homepageLayout, boardLimit
    });
    showNotification('Forum customization updated successfully!', 'success');
    // Refresh the customization modal
    setTimeout(() => {
      showCustomizeForumModal(forumSlug);
    }, 500);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle add announcement
async function handleAddAnnouncement(forumSlug) {
  const title = document.getElementById('announcement-title').value.trim();
  const content = document.getElementById('announcement-content').value.trim();
  const priority = document.getElementById('announcement-priority').value;

  if (!title || !content) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${CONFIG.API_URL}/api/forums/${forumSlug}/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content, priority })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create announcement');
    }

    showNotification('Announcement added successfully!', 'success');
    document.querySelector('.modal').remove();
    // Refresh customization modal
    setTimeout(() => {
      showCustomizeForumModal(forumSlug);
    }, 500);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle delete announcement
async function handleDeleteAnnouncement(forumSlug, announcementId) {
  if (!confirm('Are you sure you want to delete this announcement?')) {
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${CONFIG.API_URL}/api/forums/${forumSlug}/announcements/${announcementId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete announcement');
    }

    showNotification('Announcement deleted successfully!', 'success');
    // Refresh customization modal
    setTimeout(() => {
      showCustomizeForumModal(forumSlug);
    }, 500);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle add quick reference
async function handleAddQuickReference(forumSlug) {
  const label = document.getElementById('quickref-label').value.trim();
  const url = document.getElementById('quickref-url').value.trim();

  if (!label || !url) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${CONFIG.API_URL}/api/forums/${forumSlug}/quick-references`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ label, url })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create quick reference');
    }

    showNotification('Quick reference added successfully!', 'success');
    document.querySelector('.modal').remove();
    // Refresh customization modal
    setTimeout(() => {
      showCustomizeForumModal(forumSlug);
    }, 500);
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle delete quick reference
async function handleDeleteQuickReference(forumSlug, referenceId) {
  if (!confirm('Are you sure you want to delete this quick reference?')) {
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${CONFIG.API_URL}/api/forums/${forumSlug}/quick-references/${referenceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete quick reference');
    }

    showNotification('Quick reference deleted successfully!', 'success');
    // Refresh customization modal
    setTimeout(() => {
      showCustomizeForumModal(forumSlug);
    }, 500);
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
  const password = document.getElementById('auth-password').value;
  
  if (!username || !password) {
    showNotification('Please enter username and password', 'error');
    return;
  }

  try {
    showLoading();
    await login(username, password);
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
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const securityQuestion = document.getElementById('register-security-question').value.trim();
  const securityAnswer = document.getElementById('register-security-answer').value.trim();
  
  if (!username || !password || !securityQuestion || !securityAnswer) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    showNotification('Username must be alphanumeric with underscores or hyphens only', 'error');
    return;
  }

  if (password.length < 8) {
    showNotification('Password must be at least 8 characters long', 'error');
    return;
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    showNotification('Password must contain at least one letter and one number', 'error');
    return;
  }

  try {
    showLoading();
    await register(username, password, securityQuestion, securityAnswer);
    showNotification('Registered successfully', 'success');
    document.querySelector('.modal').remove();
    router.navigate('/');
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle get security question
async function handleGetSecurityQuestion() {
  const username = document.getElementById('reset-username').value.trim();
  
  if (!username) {
    showNotification('Please enter your username', 'error');
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${CONFIG.API_URL}/api/auth/security-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to retrieve security question');
    }

    const data = await response.json();
    document.getElementById('security-question-label').textContent = data.securityQuestion;
    document.getElementById('password-reset-form').style.display = 'none';
    document.getElementById('security-question-form').style.display = 'block';
    hideLoading();
  } catch (error) {
    showNotification(error.message, 'error');
    hideLoading();
  }
}

// Handle reset password
async function handleResetPassword() {
  const username = document.getElementById('reset-username').value.trim();
  const securityAnswer = document.getElementById('reset-security-answer').value.trim();
  const newPassword = document.getElementById('reset-new-password').value;

  if (!username || !securityAnswer || !newPassword) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  if (newPassword.length < 8) {
    showNotification('Password must be at least 8 characters long', 'error');
    return;
  }

  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    showNotification('Password must contain at least one letter and one number', 'error');
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${CONFIG.API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, securityAnswer, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reset password');
    }

    showNotification('Password reset successfully! You can now login.', 'success');
    document.querySelector('.modal').remove();
    showAuthModal();
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
  const headerImageUrl = document.getElementById('forum-headerImageUrl')?.value.trim() || '';
  const logoImageUrl = document.getElementById('forum-logoImageUrl')?.value.trim() || '';
  const welcomeMessage = document.getElementById('forum-welcomeMessage')?.value.trim() || '';
  const homepageLayout = document.getElementById('forum-homepageLayout')?.value || '1-column';

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
    const result = await createForum({ 
      name, slug, rules, visibility, customCSS, bulletImageUrl,
      headerImageUrl, logoImageUrl, welcomeMessage, homepageLayout
    });
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

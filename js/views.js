/**
 * View rendering functions
 */

// Render home page (forum list)
async function renderHome() {
  const app = document.getElementById('app');
  showLoading();

  // Remove any forum-specific custom CSS when on home page
  const customStyle = document.getElementById('forum-custom-css');
  if (customStyle) {
    customStyle.remove();
  }

  try {
    const forumsIndex = await getForumsIndex() || {};
    console.log('Forums index loaded:', forumsIndex); // Debug log
    const forums = Object.values(forumsIndex);
    console.log('Forums array:', forums); // Debug log

    app.innerHTML = `
      <div class="container">
        <div class="header">
          <h1>Forums</h1>
          ${isAuthenticated() ? `
            <button class="btn btn-primary" onclick="showCreateForumModal()">Create Forum</button>
          ` : ''}
        </div>
        
        ${isAuthenticated() ? `
          <div class="user-info">
            <span>Logged in as: <strong>${getUser().username}</strong></span>
            <button class="btn btn-secondary" onclick="logout()">Logout</button>
          </div>
        ` : `
          <div class="auth-section">
            <button class="btn btn-primary" onclick="showAuthModal()">Login / Register</button>
          </div>
        `}

        <div class="forums-list">
          ${forums.length === 0 ? `
            <div class="empty-state">
              <p>No forums yet. ${isAuthenticated() ? 'Create one to get started!' : 'Login to create a forum.'}</p>
            </div>
          ` : forums.map(forum => `
            <div class="forum-card" onclick="router.navigate('/forum/${forum.slug}')">
              <h2>${escapeHtml(forum.name)}</h2>
              <p class="forum-meta">by ${escapeHtml(forum.ownerUsername)} • ${formatDate(forum.createdAt)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    app.innerHTML = `
      <div class="container">
        <div class="error">
          <p>Error loading forums: ${error.message}</p>
          <button class="btn btn-primary" onclick="router.navigate('/')">Retry</button>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

// Render forum detail page
async function renderForum(params) {
  const { slug } = params;
  const app = document.getElementById('app');
  showLoading();

  try {
    const [forum, boards] = await Promise.all([
      getForum(slug),
      getBoards(slug)
    ]);

    if (!forum) {
      app.innerHTML = `
        <div class="container">
          <div class="error">
            <p>Forum not found</p>
            <button class="btn btn-primary" onclick="router.navigate('/')">Back to Home</button>
          </div>
        </div>
      `;
      hideLoading();
      return;
    }

    const boardsList = Object.values(boards || {});
    const announcements = forum.announcements || [];
    const quickRefs = forum.quickReferences || [];
    const layout = forum.homepageLayout || '1-column';

    // Apply custom CSS if provided
    if (forum.customCSS) {
      let styleEl = document.getElementById('forum-custom-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'forum-custom-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = forum.customCSS;
    }

    // Apply custom bullet image if provided
    let bulletStyle = '';
    if (forum.bulletImageUrl) {
      bulletStyle = `
        <style>
          .forum-${slug} ul li::before,
          .forum-${slug} .post-content ul li::before {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px;
            background-image: url('${escapeHtml(forum.bulletImageUrl)}');
            background-size: contain;
            background-repeat: no-repeat;
            margin-right: 8px;
            vertical-align: middle;
          }
          .forum-${slug} ul {
            list-style: none;
            padding-left: 0;
          }
        </style>
      `;
    }

    // Build header with banner/logo
    let headerHtml = '';
    if (forum.headerImageUrl) {
      headerHtml += `<div style="width: 100%; margin-bottom: 20px;"><img src="${escapeHtml(forum.headerImageUrl)}" alt="Forum Banner" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 5px;"></div>`;
    }
    if (forum.logoImageUrl) {
      headerHtml += `<div style="text-align: center; margin-bottom: 20px;"><img src="${escapeHtml(forum.logoImageUrl)}" alt="Forum Logo" style="max-height: 100px; max-width: 300px;"></div>`;
    }

    // Build welcome message
    let welcomeHtml = '';
    if (forum.welcomeMessage) {
      welcomeHtml = `<div class="welcome-message" style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="margin: 0; font-size: 1.1em; color: #2c3e50;">${formatPostContent(forum.welcomeMessage)}</p>
      </div>`;
    }

    // Build announcements section
    let announcementsHtml = '';
    if (announcements.length > 0) {
      announcementsHtml = `
        <div class="announcements-section" style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #3498db; margin-bottom: 15px;">Announcements</h2>
          ${announcements.map(a => `
            <div style="border-left: 4px solid ${a.priority === 'urgent' ? '#e74c3c' : a.priority === 'high' ? '#f39c12' : '#3498db'}; padding-left: 15px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 5px 0; color: #2c3e50;">${escapeHtml(a.title)}</h3>
              <div style="color: #555;">${formatPostContent(a.content)}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Build quick references section
    let quickRefsHtml = '';
    if (quickRefs.length > 0) {
      quickRefsHtml = `
        <div class="quick-refs-section" style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #3498db; margin-bottom: 15px;">Quick References</h2>
          <ul style="list-style: none; padding: 0;">
            ${quickRefs.map(r => `
              <li style="margin-bottom: 10px;">
                <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" style="color: #3498db; text-decoration: none;">${escapeHtml(r.label)}</a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Build boards section based on layout
    let boardsHtml = '';
    if (layout === '3-column') {
      // Split boards into 3 columns
      const boardsPerCol = Math.ceil(boardsList.length / 3);
      const col1 = boardsList.slice(0, boardsPerCol);
      const col2 = boardsList.slice(boardsPerCol, boardsPerCol * 2);
      const col3 = boardsList.slice(boardsPerCol * 2);
      
      boardsHtml = `
        <div class="boards-section" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div>
            ${col1.map(board => `
              <div class="board-card" onclick="router.navigate('/forum/${slug}/board/${board.id}')">
                <h3>${escapeHtml(board.name)}</h3>
                ${board.description ? `<p>${escapeHtml(board.description)}</p>` : ''}
                <div class="board-stats">
                  <span>${board.threadCount || 0} threads</span>
                  <span>${board.postCount || 0} posts</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div>
            ${col2.map(board => `
              <div class="board-card" onclick="router.navigate('/forum/${slug}/board/${board.id}')">
                <h3>${escapeHtml(board.name)}</h3>
                ${board.description ? `<p>${escapeHtml(board.description)}</p>` : ''}
                <div class="board-stats">
                  <span>${board.threadCount || 0} threads</span>
                  <span>${board.postCount || 0} posts</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div>
            ${col3.map(board => `
              <div class="board-card" onclick="router.navigate('/forum/${slug}/board/${board.id}')">
                <h3>${escapeHtml(board.name)}</h3>
                ${board.description ? `<p>${escapeHtml(board.description)}</p>` : ''}
                <div class="board-stats">
                  <span>${board.threadCount || 0} threads</span>
                  <span>${board.postCount || 0} posts</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (layout === '2-column') {
      // Split boards into 2 columns
      const boardsPerCol = Math.ceil(boardsList.length / 2);
      const col1 = boardsList.slice(0, boardsPerCol);
      const col2 = boardsList.slice(boardsPerCol);
      
      boardsHtml = `
        <div class="boards-section" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
          <div>
            ${col1.map(board => `
              <div class="board-card" onclick="router.navigate('/forum/${slug}/board/${board.id}')">
                <h3>${escapeHtml(board.name)}</h3>
                ${board.description ? `<p>${escapeHtml(board.description)}</p>` : ''}
                <div class="board-stats">
                  <span>${board.threadCount || 0} threads</span>
                  <span>${board.postCount || 0} posts</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div>
            ${col2.map(board => `
              <div class="board-card" onclick="router.navigate('/forum/${slug}/board/${board.id}')">
                <h3>${escapeHtml(board.name)}</h3>
                ${board.description ? `<p>${escapeHtml(board.description)}</p>` : ''}
                <div class="board-stats">
                  <span>${board.threadCount || 0} threads</span>
                  <span>${board.postCount || 0} posts</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // 1-column layout (default)
      boardsHtml = `
        <div class="boards-section">
          <h2>Boards</h2>
          ${boardsList.length === 0 ? `
            <div class="empty-state">
              <p>No boards yet.</p>
              ${isAuthenticated() && forum.ownerId === getUser()?.id ? `
                <button class="btn btn-primary" onclick="showCreateBoardModal('${slug}')">Create Board</button>
              ` : ''}
            </div>
          ` : `
            <div class="boards-list">
              ${boardsList.map(board => `
                <div class="board-card" onclick="router.navigate('/forum/${slug}/board/${board.id}')">
                  <h3>${escapeHtml(board.name)}</h3>
                  ${board.description ? `<p>${escapeHtml(board.description)}</p>` : ''}
                  <div class="board-stats">
                    <span>${board.threadCount || 0} threads</span>
                    <span>${board.postCount || 0} posts</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    app.innerHTML = bulletStyle + `
      <div class="container forum-${slug}">
        ${headerHtml}
        <div class="header">
          <button class="btn btn-secondary" onclick="router.navigate('/')">← Back</button>
          <h1>${escapeHtml(forum.name)}</h1>
          ${isAuthenticated() && forum.ownerId === getUser()?.id ? `
            <button class="btn btn-secondary" onclick="showCustomizeForumModal('${slug}')">Customize</button>
          ` : ''}
        </div>

        ${welcomeHtml}

        ${forum.rules ? `
          <div class="forum-rules" style="background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>Rules</h3>
            <div class="rules-content">${formatPostContent(forum.rules)}</div>
          </div>
        ` : ''}

        ${layout === '3-column' ? `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
            <div>${announcementsHtml}</div>
            <div>${quickRefsHtml}</div>
            <div></div>
          </div>
          ${boardsHtml}
        ` : layout === '2-column' ? `
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
            <div>${announcementsHtml}</div>
            <div>${quickRefsHtml}</div>
          </div>
          ${boardsHtml}
        ` : `
          ${announcementsHtml}
          ${quickRefsHtml}
          ${boardsHtml}
        `}
      </div>
    `;
  } catch (error) {
    app.innerHTML = `
      <div class="container">
        <div class="error">
          <p>Error loading forum: ${error.message}</p>
          <button class="btn btn-primary" onclick="router.navigate('/')">Back to Home</button>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

// Render board detail page (threads list)
async function renderBoard(params) {
  const { slug, boardId } = params;
  const app = document.getElementById('app');
  showLoading();

  try {
    const [forum, boards, threads, posts] = await Promise.all([
      getForum(slug),
      getBoards(slug),
      getThreads(slug),
      getPosts(slug)
    ]);

    const board = boards?.[boardId];
    if (!board) {
      app.innerHTML = `
        <div class="container">
          <div class="error">
            <p>Board not found</p>
            <button class="btn btn-primary" onclick="router.navigate('/forum/${slug}')">Back</button>
          </div>
        </div>
      `;
      hideLoading();
      return;
    }

    // Get threads for this board
    const boardThreads = Object.values(threads || {})
      .filter(thread => thread.boardId === boardId)
      .sort((a, b) => new Date(b.lastPostAt) - new Date(a.lastPostAt));

    // Get first post for each thread
    const threadsWithFirstPost = boardThreads.map(thread => {
      const firstPost = Object.values(posts || {}).find(p => 
        p.threadId === thread.id && p.isFirstPost
      );
      return { ...thread, firstPost };
    });

    app.innerHTML = `
      <div class="container">
        <div class="header">
          <button class="btn btn-secondary" onclick="router.navigate('/forum/${slug}')">← Back</button>
          <h1>${escapeHtml(board.name)}</h1>
        </div>

        ${board.description ? `
          <div class="board-description">
            <p>${formatPostContent(board.description)}</p>
          </div>
        ` : ''}

        <div class="threads-section">
          <div class="section-header">
            <h2>Threads</h2>
            ${isAuthenticated() ? `
              <button class="btn btn-primary" onclick="showCreateThreadModal('${slug}', '${boardId}')">New Thread</button>
            ` : ''}
          </div>

          ${threadsWithFirstPost.length === 0 ? `
            <div class="empty-state">
              <p>No threads yet. ${isAuthenticated() ? 'Start a discussion!' : 'Login to create a thread.'}</p>
            </div>
          ` : `
            <div class="threads-list">
              ${threadsWithFirstPost.map(thread => `
                <div class="thread-card" onclick="router.navigate('/forum/${slug}/thread/${thread.id}')">
                  <div class="thread-header">
                    <h3>${escapeHtml(thread.title)}</h3>
                    <span class="thread-meta">by ${escapeHtml(thread.authorUsername)}</span>
                  </div>
                  ${thread.firstPost ? `
                    <div class="thread-preview">
                      ${formatPostContent(thread.firstPost.content.substring(0, 200))}
                      ${thread.firstPost.content.length > 200 ? '...' : ''}
                    </div>
                  ` : ''}
                  <div class="thread-footer">
                    <span>${thread.postCount || 0} posts</span>
                    <span>Last post: ${formatDate(thread.lastPostAt)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  } catch (error) {
    app.innerHTML = `
      <div class="container">
        <div class="error">
          <p>Error loading board: ${error.message}</p>
          <button class="btn btn-primary" onclick="router.navigate('/forum/${slug}')">Back</button>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

// Render thread detail page (posts list)
async function renderThread(params) {
  const { slug, threadId } = params;
  const app = document.getElementById('app');
  showLoading();

  try {
    const [forum, threads, posts] = await Promise.all([
      getForum(slug),
      getThreads(slug),
      getPosts(slug)
    ]);

    const thread = threads?.[threadId];
    if (!thread) {
      app.innerHTML = `
        <div class="container">
          <div class="error">
            <p>Thread not found</p>
            <button class="btn btn-primary" onclick="router.navigate('/forum/${slug}')">Back</button>
          </div>
        </div>
      `;
      hideLoading();
      return;
    }

    // Get all posts for this thread, sorted by creation date
    const threadPosts = Object.values(posts || {})
      .filter(post => post.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    app.innerHTML = `
      <div class="container">
        <div class="header">
          <button class="btn btn-secondary" onclick="router.navigate('/forum/${slug}/board/${thread.boardId}')">← Back</button>
          <h1>${escapeHtml(thread.title)}</h1>
        </div>

        <div class="posts-section">
          <div class="posts-list">
            ${threadPosts.map(post => `
              <div class="post-card" id="post-${post.id}">
                <div class="post-header">
                  <strong>${escapeHtml(post.authorUsername)}</strong>
                  <span class="post-date">${formatDate(post.createdAt)}</span>
                  ${post.updatedAt !== post.createdAt ? `
                    <span class="post-edited">(edited)</span>
                  ` : ''}
                </div>
                <div class="post-content">
                  ${formatPostContent(post.content)}
                </div>
                ${isAuthenticated() && (post.authorId === getUser()?.id || forum.ownerId === getUser()?.id) ? `
                  <div class="post-actions">
                    ${post.authorId === getUser()?.id ? `
                      <button class="btn btn-small" onclick="showEditPostModal('${slug}', '${post.id}', '${escapeHtml(post.content)}')">Edit</button>
                    ` : ''}
                    ${!post.isFirstPost ? `
                      <button class="btn btn-small btn-danger" onclick="handleDeletePost('${slug}', '${post.id}')">Delete</button>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          ${isAuthenticated() ? `
            <div class="post-form">
              <h3>Reply</h3>
              <textarea id="post-content" rows="5" placeholder="Write your reply..."></textarea>
              <button class="btn btn-primary" onclick="handleCreatePost('${slug}', '${threadId}')">Post Reply</button>
            </div>
          ` : `
            <div class="auth-prompt">
              <p>Please <a href="#" onclick="showAuthModal(); return false;">login</a> to post a reply.</p>
            </div>
          `}
        </div>
      </div>
    `;
  } catch (error) {
    app.innerHTML = `
      <div class="container">
        <div class="error">
          <p>Error loading thread: ${error.message}</p>
          <button class="btn btn-primary" onclick="router.navigate('/forum/${slug}')">Back</button>
        </div>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

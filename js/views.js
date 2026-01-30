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

    app.innerHTML = bulletStyle + `
      <div class="container forum-${slug}">
        <div class="header">
          <button class="btn btn-secondary" onclick="router.navigate('/')">← Back</button>
          <h1>${escapeHtml(forum.name)}</h1>
          ${isAuthenticated() && forum.ownerId === getUser()?.id ? `
            <button class="btn btn-secondary" onclick="showCustomizeForumModal('${slug}')">Customize</button>
          ` : ''}
        </div>

        ${forum.rules ? `
          <div class="forum-rules">
            <h3>Rules</h3>
            <div class="rules-content">${formatPostContent(forum.rules)}</div>
          </div>
        ` : ''}

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

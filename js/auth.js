/**
 * Authentication management
 * Handles JWT token storage and retrieval
 */

// Get stored token
function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

// Store token
function setToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

// Get stored user data
function getUser() {
  const userData = localStorage.getItem(CONFIG.USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

// Store user data
function setUser(user) {
  localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
}

// Clear authentication
function clearAuth() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  localStorage.removeItem(CONFIG.USER_KEY);
}

// Check if user is authenticated
function isAuthenticated() {
  return getToken() !== null;
}

// Get auth headers for API requests
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Register new user
async function register(username) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
async function login(username) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout user
function logout() {
  clearAuth();
  router.navigate('/');
}

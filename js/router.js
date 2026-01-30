/**
 * Client-side router
 * Handles navigation and routing for the SPA
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    // Don't init immediately - wait for routes to be registered
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    // Handle initial route
    this.handleRoute();
  }

  // Register a route
  route(path, handler) {
    this.routes[path] = handler;
  }

  // Navigate to a route
  navigate(path) {
    window.location.hash = path;
  }

  // Handle current route
  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('?')[0];
    
    // Find matching route
    let matchedRoute = null;
    let params = {};

    for (const routePath in this.routes) {
      // Convert route path to regex
      const regex = new RegExp('^' + routePath.replace(/:\w+/g, '([^/]+)') + '$');
      const match = hash.match(regex);
      
      if (match) {
        matchedRoute = routePath;
        // Extract params
        const paramNames = routePath.match(/:(\w+)/g) || [];
        paramNames.forEach((param, index) => {
          params[param.slice(1)] = match[index + 1];
        });
        break;
      }
    }

    if (matchedRoute && this.routes[matchedRoute]) {
      this.currentRoute = matchedRoute;
      this.routes[matchedRoute](params);
    } else if (this.routes['/']) {
      this.currentRoute = '/';
      this.routes['/'](params);
    }
  }

  // Get current route
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Initialize router (will be initialized after routes are registered)
const router = new Router();

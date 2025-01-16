// Weights for different scoring components
const WEIGHTS = {
  recency: 0.5,
  frequency: 0.3,
  duration: 0.2
};

// Time windows for scoring
const TIME = {
  HOUR: 3600000,
  DAY: 86400000
};

class TabScorer {
  constructor() {
    this.interactions = {};
    this.loadInteractions();
    this.setupListeners();
  }

  // Load saved interaction data
  async loadInteractions() {
    const data = await chrome.storage.local.get(['tabInteractions']);
    this.interactions = data.tabInteractions || {};
    this.cleanupOldData();
  }

  // Save interaction data
  async saveInteractions() {
    await chrome.storage.local.set({ tabInteractions: this.interactions });
  }

  // Clean up data older than 24 hours
  cleanupOldData() {
    const now = Date.now();
    for (const tabId in this.interactions) {
      const data = this.interactions[tabId];
      if (now - data.lastAccess > TIME.DAY) {
        delete this.interactions[tabId];
      }
    }
    this.saveInteractions();
  }

  // Record tab activation
  recordActivation(tabId) {
    const now = Date.now();
    if (!this.interactions[tabId]) {
      this.interactions[tabId] = {
        activations: [],
        totalDuration: 0,
        lastAccess: now
      };
    }

    const data = this.interactions[tabId];
    data.activations.push(now);
    data.lastAccess = now;

    // Keep only last 24 hours of activations
    data.activations = data.activations.filter(time => now - time <= TIME.DAY);

    this.saveInteractions();
  }

  // Record tab deactivation
  recordDeactivation(tabId, activationTime) {
    if (this.interactions[tabId]) {
      const duration = Date.now() - activationTime;
      this.interactions[tabId].totalDuration += duration;
      this.saveInteractions();
    }
  }

  // Calculate recency score (0-1)
  getRecencyScore(tabId) {
    const data = this.interactions[tabId];
    if (!data) return 0;

    const timeSinceLastAccess = Date.now() - data.lastAccess;
    return Math.exp(-timeSinceLastAccess / TIME.DAY); // Exponential decay
  }

  // Calculate frequency score (0-1)
  getFrequencyScore(tabId) {
    const data = this.interactions[tabId];
    if (!data) return 0;

    const recentActivations = data.activations.length;
    return Math.min(recentActivations / 10, 1); // Cap at 10 activations
  }

  // Calculate duration score (0-1)
  getDurationScore(tabId) {
    const data = this.interactions[tabId];
    if (!data) return 0;

    return Math.min(data.totalDuration / TIME.HOUR, 1); // Cap at 1 hour
  }

  // Calculate final score for a tab
  getTabScore(tabId) {
    return (
      WEIGHTS.recency * this.getRecencyScore(tabId) +
      WEIGHTS.frequency * this.getFrequencyScore(tabId) +
      WEIGHTS.duration * this.getDurationScore(tabId)
    );
  }

  // Set up event listeners for tab interactions
  setupListeners() {
    let lastActiveTab = null;
    let lastActivationTime = Date.now();

    chrome.tabs.onActivated.addListener(({ tabId }) => {
      if (lastActiveTab) {
        this.recordDeactivation(lastActiveTab, lastActivationTime);
      }
      this.recordActivation(tabId);
      lastActiveTab = tabId;
      lastActivationTime = Date.now();
    });

    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        if (lastActiveTab) {
          this.recordDeactivation(lastActiveTab, lastActivationTime);
        }
      } else {
        chrome.tabs.query({ active: true, windowId }, (tabs) => {
          if (tabs.length > 0) {
            const tabId = tabs[0].id;
            this.recordActivation(tabId);
            lastActiveTab = tabId;
            lastActivationTime = Date.now();
          }
        });
      }
    });
  }
}

// Export for use in floating.js
window.TabScorer = TabScorer; 
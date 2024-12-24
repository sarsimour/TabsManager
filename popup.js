document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const tabsList = document.getElementById('tabsList');

  // Load all tabs when popup opens
  loadTabs();

  // Add search functionality
  searchInput.addEventListener('input', function(e) {
    loadTabs(e.target.value);
  });

  function loadTabs(searchQuery = '') {
    chrome.tabs.query({}, function(tabs) {
      tabsList.innerHTML = '';
      
      const filteredTabs = tabs.filter(tab => {
        const title = tab.title.toLowerCase();
        const url = tab.url.toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || url.includes(query);
      });

      filteredTabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab-item';
        tabElement.innerHTML = `
          <div class="tab-title">${tab.title}</div>
          <div class="tab-url">${tab.url}</div>
        `;

        // Add click event to switch to tab
        tabElement.addEventListener('click', function() {
          chrome.tabs.update(tab.id, { active: true });
          chrome.windows.update(tab.windowId, { focused: true });
        });

        tabsList.appendChild(tabElement);
      });
    });
  }
}); 
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const tabsList = document.getElementById('tabsList');
  const searchStats = document.getElementById('searchStats');
  let allTabs = [];
  let selectedIndex = -1;
  let fuse = null;

  // Initialize Fuse.js options
  const fuseOptions = {
    keys: ['title', 'url'],
    includeScore: true,
    threshold: 0.4,
    shouldSort: true,
    minMatchCharLength: 2,
    findAllMatches: true
  };

  // Load all tabs when window opens
  loadTabs();
  
  // Focus search input immediately
  searchInput.focus();

  // Add search functionality
  searchInput.addEventListener('input', function(e) {
    searchTabs(e.target.value);
  });

  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    const items = tabsList.getElementsByClassName('tab-item');
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection();
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          items[selectedIndex].click();
          window.close();
        }
        break;
      case 'Escape':
        window.close();
        break;
      case 'PageDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 5, items.length - 1);
        updateSelection();
        break;
      case 'PageUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 5, 0);
        updateSelection();
        break;
    }
  });

  function loadTabs() {
    chrome.tabs.query({}, function(tabs) {
      console.log('Loaded tabs:', tabs);
      if (chrome.runtime.lastError) {
        console.error('Error loading tabs:', chrome.runtime.lastError);
        return;
      }

      if (!tabs || tabs.length === 0) {
        tabsList.innerHTML = '<div class="tab-item">No tabs found</div>';
        return;
      }

      allTabs = tabs;
      fuse = new Fuse(allTabs, fuseOptions);
      displayAllTabs();
    });
  }

  function displayAllTabs() {
    renderTabs(allTabs, '');
    updateSearchStats(allTabs.length, allTabs.length);
  }

  function searchTabs(searchQuery = '') {
    if (!allTabs || allTabs.length === 0) {
      console.log('No tabs available for search');
      return;
    }

    let filteredTabs = allTabs;
    selectedIndex = 0;

    if (searchQuery.trim()) {
      if (!fuse) {
        console.log('Reinitializing Fuse');
        fuse = new Fuse(allTabs, fuseOptions);
      }
      const results = fuse.search(searchQuery);
      filteredTabs = results.map(result => result.item);
      updateSearchStats(results.length, allTabs.length);
    } else {
      updateSearchStats(allTabs.length, allTabs.length);
    }

    renderTabs(filteredTabs, searchQuery);
  }

  function renderTabs(tabs, searchQuery) {
    console.log('Rendering tabs:', tabs.length);
    tabsList.innerHTML = '';
    
    if (!tabs || tabs.length === 0) {
      tabsList.innerHTML = '<div class="tab-item">No matching tabs</div>';
      return;
    }

    tabs.forEach((tab, index) => {
      const tabElement = document.createElement('div');
      tabElement.className = 'tab-item' + (index === selectedIndex ? ' selected' : '');
      
      // Highlight matching text if there's a search query
      const titleHtml = searchQuery ? highlightMatches(tab.title, searchQuery) : tab.title;
      const urlHtml = searchQuery ? highlightMatches(tab.url, searchQuery) : tab.url;

      tabElement.innerHTML = `
        <div class="tab-title">${titleHtml}</div>
        <div class="tab-url">${urlHtml}</div>
      `;

      tabElement.addEventListener('click', function() {
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
        window.close();
      });

      tabElement.addEventListener('mouseover', function() {
        selectedIndex = index;
        updateSelection();
      });

      tabsList.appendChild(tabElement);
    });

    // Ensure selected item is visible
    const selectedItem = tabsList.children[selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  function updateSelection() {
    const items = tabsList.getElementsByClassName('tab-item');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle('selected', i === selectedIndex);
    }
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }

  function updateSearchStats(matchCount, totalCount) {
    searchStats.textContent = `Showing ${matchCount} of ${totalCount} tabs`;
  }

  function highlightMatches(text, query) {
    if (!query) return text;
    
    // Escape special characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
}); 
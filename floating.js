document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const tabsList = document.getElementById('tabsList');
  const searchStats = document.getElementById('searchStats');
  let allItems = [];
  let selectedIndex = -1;
  let fuse = null;

  // Initialize Fuse.js options with weights for different fields
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'url', weight: 0.3 },
      { name: 'type', weight: 0.3 }
    ],
    includeScore: true,
    threshold: 0.4,
    shouldSort: true,
    minMatchCharLength: 2,
    findAllMatches: true
  };

  // Load all items when window opens
  loadAllItems();
  
  // Focus search input immediately
  searchInput.focus();

  // Add search functionality
  searchInput.addEventListener('input', function(e) {
    searchItems(e.target.value);
  });

  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    const items = tabsList.getElementsByClassName('item');
    
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

  function loadAllItems() {
    Promise.all([loadTabs(), loadAllBookmarks()])
      .then(([tabs, bookmarks]) => {
        allItems = [
          ...tabs.map(tab => ({ ...tab, type: 'tab' })),
          ...bookmarks.map(bookmark => ({ ...bookmark, type: 'bookmark' }))
        ];
        fuse = new Fuse(allItems, fuseOptions);
        displayAllItems();
      })
      .catch(error => {
        console.error('Error loading items:', error);
        // Still show tabs even if bookmarks fail
        loadTabs().then(tabs => {
          allItems = tabs.map(tab => ({ ...tab, type: 'tab' }));
          fuse = new Fuse(allItems, fuseOptions);
          displayAllItems();
        });
      });
  }

  function loadTabs() {
    return new Promise((resolve) => {
      chrome.tabs.query({}, function(tabs) {
        if (chrome.runtime.lastError) {
          console.error('Error loading tabs:', chrome.runtime.lastError);
          resolve([]);
          return;
        }
        resolve(tabs || []);
      });
    });
  }

  function loadAllBookmarks() {
    return new Promise((resolve) => {
      try {
        chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
          if (chrome.runtime.lastError) {
            console.error('Error loading bookmarks:', chrome.runtime.lastError);
            resolve([]);
            return;
          }
          
          const bookmarks = [];
          
          function processNode(node) {
            if (node.url) {
              bookmarks.push({
                id: node.id,
                title: node.title,
                url: node.url
              });
            }
            if (node.children) {
              node.children.forEach(processNode);
            }
          }
          
          bookmarkTreeNodes.forEach(processNode);
          resolve(bookmarks);
        });
      } catch (error) {
        console.error('Error in loadAllBookmarks:', error);
        resolve([]);
      }
    });
  }

  function displayAllItems() {
    renderItems(allItems, '');
    updateSearchStats(allItems.length, allItems.length);
  }

  function searchItems(searchQuery = '') {
    if (!allItems || allItems.length === 0) {
      console.log('No items available for search');
      return;
    }

    let filteredItems = allItems;
    selectedIndex = 0;

    if (searchQuery.trim()) {
      if (!fuse) {
        console.log('Reinitializing Fuse');
        fuse = new Fuse(allItems, fuseOptions);
      }
      const results = fuse.search(searchQuery);
      filteredItems = results.map(result => result.item);
      updateSearchStats(results.length, allItems.length);
    } else {
      updateSearchStats(allItems.length, allItems.length);
    }

    renderItems(filteredItems, searchQuery);
  }

  function renderItems(items, searchQuery) {
    console.log('Rendering items:', items.length);
    tabsList.innerHTML = '';
    
    if (!items || items.length === 0) {
      tabsList.innerHTML = '<div class="item">No matching items</div>';
      return;
    }

    items.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'item' + (index === selectedIndex ? ' selected' : '');
      
      // Add icon based on type
      const icon = item.type === 'tab' ? '📄' : '🔖';
      
      // Highlight matching text if there's a search query
      const titleHtml = searchQuery ? highlightMatches(item.title || '', searchQuery) : (item.title || '');
      const urlHtml = searchQuery ? highlightMatches(item.url || '', searchQuery) : (item.url || '');

      itemElement.innerHTML = `
        <div class="tab-title">${icon} ${titleHtml}</div>
        <div class="tab-url">${urlHtml}</div>
      `;

      itemElement.addEventListener('click', function() {
        if (item.type === 'tab') {
          chrome.tabs.update(item.id, { active: true });
          chrome.windows.update(item.windowId, { focused: true });
        } else {
          // For bookmarks, open in new tab and switch to it
          chrome.tabs.create({ url: item.url, active: true });
        }
        window.close();
      });

      itemElement.addEventListener('mouseover', function() {
        selectedIndex = index;
        updateSelection();
      });

      tabsList.appendChild(itemElement);
    });

    // Ensure selected item is visible
    const selectedItem = tabsList.children[selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }

  function updateSelection() {
    const items = tabsList.getElementsByClassName('item');
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle('selected', i === selectedIndex);
    }
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }

  function updateSearchStats(matchCount, totalCount) {
    searchStats.textContent = `Showing ${matchCount} of ${totalCount} items`;
  }

  function highlightMatches(text, query) {
    if (!query) return text;
    
    // Escape special characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
}); 
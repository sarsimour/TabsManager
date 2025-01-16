document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const tabsList = document.getElementById('tabsList');
  const searchStats = document.getElementById('searchStats');
  let allItems = [];
  let filteredItems = [];
  let selectedIndex = -1;
  let fuse = null;
  let favorites = new Set();
  let tabScorer = new TabScorer();

  // Initialize Fuse.js options with weights for different fields
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'url', weight: 0.3 },
      { name: 'type', weight: 0.2 }
    ],
    includeScore: true,
    threshold: 0.3,
    shouldSort: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    distance: 100,
    useExtendedSearch: true,
    ignoreLocation: true
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

  // Load saved data
  chrome.storage.local.get(['favorites'], function(result) {
    favorites = new Set(result.favorites || []);
  });

  // Toggle favorite status
  function toggleFavorite(item) {
    const itemKey = `${item.type}-${item.id}`;
    if (favorites.has(itemKey)) {
      favorites.delete(itemKey);
    } else {
      favorites.add(itemKey);
    }
    chrome.storage.local.set({ favorites: Array.from(favorites) });
    renderItems(filteredItems || allItems, searchInput.value);
  }

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
    filteredItems = allItems;
    renderItems(filteredItems, '');
    updateSearchStats(allItems.length, allItems.length);
  }

  function searchItems(searchQuery = '') {
    if (!allItems || allItems.length === 0) {
      console.log('No items available for search');
      return;
    }

    selectedIndex = 0;

    if (searchQuery.trim()) {
      if (!fuse) {
        console.log('Reinitializing Fuse');
        fuse = new Fuse(allItems, fuseOptions);
      }
      const results = fuse.search(searchQuery);
      filteredItems = results.map(result => result.item);
      updateSearchStats(filteredItems.length, allItems.length);
    } else {
      filteredItems = allItems;
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

    // Sort items to show favorites first, then by score
    items.sort((a, b) => {
      const aFav = favorites.has(`${a.type}-${a.id}`);
      const bFav = favorites.has(`${b.type}-${b.id}`);
      
      if (aFav !== bFav) {
        return bFav - aFav;
      }
      
      // If both are tabs, use scoring
      if (a.type === 'tab' && b.type === 'tab') {
        return tabScorer.getTabScore(b.id) - tabScorer.getTabScore(a.id);
      }
      
      // If only one is a tab, prefer it
      if (a.type === 'tab') return -1;
      if (b.type === 'tab') return 1;
      
      // For bookmarks, keep original order
      return 0;
    });

    items.forEach((item, index) => {
      const itemElement = document.createElement('div');
      const isFavorite = favorites.has(`${item.type}-${item.id}`);
      itemElement.className = `item${index === selectedIndex ? ' selected' : ''}${isFavorite ? ' favorite' : ''}`;
      
      // Create favicon/icon element
      const iconElement = document.createElement('div');
      iconElement.className = 'item-icon';
      
      if (item.type === 'tab' && item.favIconUrl) {
        const img = document.createElement('img');
        img.src = item.favIconUrl;
        img.onerror = function() {
          // Fallback to emoji if favicon fails to load
          iconElement.textContent = '📄';
        };
        iconElement.appendChild(img);
      } else {
        // Use emoji for bookmarks or tabs without favicon
        iconElement.textContent = item.type === 'tab' ? '📄' : '🔖';
      }

      // Create content container
      const contentElement = document.createElement('div');
      contentElement.className = 'item-content';
      
      const titleHtml = searchQuery ? highlightMatches(item.title || '', searchQuery) : (item.title || '');
      const urlHtml = searchQuery ? highlightMatches(item.url || '', searchQuery) : (item.url || '');

      // Create title element
      const titleElement = document.createElement('div');
      titleElement.className = 'tab-title';
      titleElement.innerHTML = titleHtml;

      // Create URL element
      const urlElement = document.createElement('div');
      urlElement.className = 'tab-url';
      urlElement.innerHTML = urlHtml;

      // Create favorite icon
      const favIconElement = document.createElement('div');
      favIconElement.className = 'favorite-icon';
      favIconElement.textContent = isFavorite ? '⭐' : '☆';
      
      // Assemble the elements
      contentElement.appendChild(titleElement);
      contentElement.appendChild(urlElement);
      
      itemElement.appendChild(iconElement);
      itemElement.appendChild(contentElement);
      itemElement.appendChild(favIconElement);

      // Add click handler for favorite icon
      favIconElement.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(item);
      });

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
# Privacy Practices Documentation

## Single Purpose Description
Tabs Manager is a tab management extension that helps users efficiently organize, search, and switch between their browser tabs. The extension provides quick access to tabs through a searchable interface and keyboard shortcuts, making tab management more productive.

## Permission Justifications

### 1. tabs Permission
**Justification**: The tabs permission is essential for our core functionality. We need to:
- List and access all open tabs
- Switch between tabs
- Read tab titles and URLs for search functionality
- Monitor tab updates for real-time organization
This permission is used solely for tab management and search features.

### 2. activeTab Permission
**Justification**: The activeTab permission is required to:
- Identify the currently active tab
- Enable quick switching between tabs
- Update tab information when it becomes active
This permission is only used when the user interacts with the extension.

### 3. bookmarks Permission
**Justification**: The bookmarks permission enables:
- Integration of bookmarks into the search interface
- Quick access to frequently used bookmarks
- Unified search across tabs and bookmarks
This enhances the user's ability to find and access their saved content.

### 4. storage Permission
**Justification**: The storage permission is used to:
- Save user preferences and settings
- Store tab usage statistics for smart ranking
- Cache recent searches for better performance
All data is stored locally and never transmitted externally.

### 5. windows Permission
**Justification**: The windows permission is needed to:
- Support multi-window tab management
- Enable window-based tab grouping
- Allow moving tabs between windows
This is essential for users who work with multiple Chrome windows.

### 6. host Permission (<all_urls>)
**Justification**: The host permission is required to:
- Read tab URLs for search functionality
- Enable tab switching across all domains
- Support domain-based tab grouping
We do not collect or transmit any browsing data.

### 7. Remote Code Justification
**Justification**: Our extension:
- Does not load or execute any remote code
- All code is packaged within the extension
- Uses only local JavaScript files
- No external scripts are loaded

## Data Usage Certification
I certify that Tabs Manager:
1. Only collects data necessary for core functionality
2. Does not transmit any user data externally
3. Stores all data locally on the user's device
4. Complies with the Chrome Web Store Developer Program Policies
5. Respects user privacy and data protection

## Data Collection
- **What we collect**: Tab titles, URLs, and user preferences
- **How we use it**: Local search and organization features
- **Where we store it**: Chrome's local storage only
- **How long we keep it**: Only while the extension is installed
- **Who has access**: Only the user on their local device 
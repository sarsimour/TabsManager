# Privacy Practices Documentation

## Single Purpose Description
Tabs Manager is a tab management extension that helps users efficiently organize, search, and switch between their browser tabs. The extension provides quick access to tabs through a searchable interface and keyboard shortcuts, making tab management more productive.

## Permission Justifications

### 1. activeTab Permission
**Justification**: The activeTab permission is required to:
- Access and manage the current tab when the user interacts with our extension
- Enable quick switching between tabs
- Read tab information only when the extension is actively being used
This permission is temporary and only activates when users interact with the extension, providing better privacy and security.

### 2. bookmarks Permission
**Justification**: The bookmarks permission enables:
- Integration of bookmarks into the search interface
- Quick access to frequently used bookmarks
- Unified search across tabs and bookmarks
This enhances the user's ability to find and access their saved content.

### 3. storage Permission
**Justification**: The storage permission is used to:
- Save user preferences and settings
- Store tab usage statistics for smart ranking
- Cache recent searches for better performance
All data is stored locally and never transmitted externally.

### 4. windows Permission
**Justification**: The windows permission is needed to:
- Support multi-window tab management
- Enable window-based tab grouping
- Allow moving tabs between windows
This is essential for users who work with multiple Chrome windows.

### 5. host Permission (<all_urls>)
**Justification**: The host permission is required to:
- Read tab URLs for search functionality
- Enable tab switching across all domains
- Support domain-based tab grouping
We do not collect or transmit any browsing data.

### 6. commands Permission
**Justification**: The commands permission is needed to:
- Enable keyboard shortcuts (Command+K/Ctrl+K)
- Provide quick access to the extension
- Support keyboard-first navigation
This improves user productivity through keyboard shortcuts.

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
- **What we collect**: Current tab information (only when extension is active), user preferences
- **How we use it**: Local search and organization features
- **Where we store it**: Chrome's local storage only
- **How long we keep it**: Only while the extension is installed
- **Who has access**: Only the user on their local device 
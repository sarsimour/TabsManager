# Tabs Manager Improvements

## 1. Tabs List Order Improvements
- [ ] Implement most recently used (MRU) ordering
- [ ] Add domain/site-based grouping
- [ ] Create smart ranking based on interaction frequency
- [ ] Support manual ordering/pinning
- [ ] Add window-based grouping for multi-window setups

## 2. Navigation Method - Character Shortcuts
- [ ] Implement Vimium-style character hints
  - [ ] Single character mode (a-z) for first 26 items
  - [ ] Two character mode (aa-zz) for supporting more items
- [ ] Keep arrow keys as fallback navigation
- [ ] Add keyboard shortcut documentation

## 3. Search Enhancements
### Content Improvements
- [ ] Add meta tags support (description, keywords)
- [ ] Implement page content indexing
  - [ ] First paragraph/main content extraction
  - [ ] Text summarization
  - [ ] Content caching system
- [ ] Add SEO data support
  - [ ] Meta descriptions
  - [ ] OG tags
  - [ ] Header tags (h1, h2)
  - [ ] Main keywords extraction

### Search Algorithm
- [ ] Implement improved fuzzy search (Smith-Waterman)
- [ ] Enhanced scoring system based on:
  - [ ] Match location priority
  - [ ] Visit frequency
  - [ ] Recency
  - [ ] User interaction patterns

## Implementation Priority
1. Improve tab ordering system
2. Add character hint navigation
3. Enhance search capabilities progressively

## Technical Considerations
- Balance between search quality and performance
- Optimize memory usage
- Manage extension permissions appropriately
- Implement features incrementally 
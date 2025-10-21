# Project Overview

This project is a browser-based editor for "pet" CLI snippet TOML files. It allows users to upload, create, edit, and download snippet files locally. The app uses Web Components for UI modularity, runs without a server, and features a sidebar for file management and a main pane for snippet editing with advanced features like variable highlighting and editing.

## High-Level Architecture
- index.html: Entry point with inline Web Components (file-list, snippet-list, snippet-item)
- styles.css: Shared generic styles (layout, zebra, highlights, buttons)
- utils/toml-parser.js: TOML parsing/stringifying with case-insensitive field handling
- utils/var-parser.js: Variable extraction, color mapping, and command updating
- Data Model: In-memory array of open files, each with {name, content (string), parsed (object), dirty (boolean)}

## Current Features (Phases 1-6 Complete)
- File ops: Upload TOML files, create new files, multi-open, sidebar list with select/close, dirty indicator (*)
- Snippet display: Zebra-striped cards with editable description, command, tags, output
- Header controls: Select all checkbox, copy/delete selected (stubs), tag filter dropdown (all/any), fuzzy search
- Tag management: Always visible, add/remove tags with +/× buttons, auto-updates tag filter dropdown
- Variables: Collapsible section (always visible), color-coded variables, editable values, list support with +/-, real-time command sync
- Filtering: Tag filtering (all/any mode), fuzzy search on description/command, filters reset on file switch

## Implementation Notes
- Libraries (CDN): @ltd/j-toml@1.38.0, fuse.js@6.6.2
- Color palette for vars: 10 colors, hashed by variable name for consistency
- Focus preservation: requestAnimationFrame + setSelectionRange for smooth editing
- Re-rendering: Optimized to only re-render when necessary (e.g., variable count changes)
- Case handling: TOML parser handles [[Snippets]]/[[snippets]] and Description/description fields
- Testing: Run locally via file:///path/to/index.html


# ToDo List

## Completed Phases
- [x] Phase 1: Basic Structure and Layout
  - [x] index.html with sidebar and main sections
  - [x] shared styles.css for basic layout and generic classes
  - [x] Placeholder Web Components registered

- [x] Phase 2: File Handling
  - [x] Upload button to load TOML files (multiple file support)
  - [x] Create new empty TOML file with [[snippets]] template
  - [x] List open files in sidebar with select and close buttons
  - [x] Track selected file; display file name in header
  - [x] Dirty indicator (*) for modified files

- [x] Phase 3: TOML Parsing and Snippet Display
  - [x] utils/toml-parser.js with case-insensitive parsing
  - [x] Parse and display snippet list in main pane
  - [x] snippet-item component with desc, cmd, tags, output fields
  - [x] Zebra striping applied

- [x] Phase 4: Header Controls
  - [x] Select-all checkbox with working toggle
  - [x] Copy selected button (stub)
  - [x] Delete selected button (stub)
  - [x] Tag multi-select dropdown with all/any toggle
  - [x] Fuzzy search input with fuse.js
  - [x] Filters reset when switching files

- [x] Phase 5: Snippet Editing Basics
  - [x] Editable description (input)
  - [x] Editable command (textarea with focus preservation)
  - [x] Editable output (textarea, always visible)
  - [x] Per-snippet checkboxes with selection highlighting
  - [x] Per-snippet copy button (stub)
  - [x] Per-snippet delete button (working with confirmation)
  - [x] Tag management: always visible, add/remove with +/×
  - [x] Tags auto-update filter dropdown

- [x] Phase 6: Variable Management
  - [x] utils/var-parser.js for variable extraction and color mapping
  - [x] Parse variables from command: <var>, <var=value>, <var=|_val1_||_val2_|>
  - [x] Collapsible variables section (always visible)
  - [x] List unique vars with color-coded backgrounds
  - [x] Editable value inputs with real-time command sync
  - [x] List support: + to add, - to remove values
  - [x] "Make List" button to convert single value
  - [x] Command textarea focus preservation

## Remaining Phases

- [ ] Phase 7: Download and Save
  - [ ] Download button to save current file as TOML
  - [ ] Use TomlParser.stringify to convert parsed object back to TOML
  - [ ] Clear dirty flag after save

- [ ] Phase 8: Advanced Interactions
  - [ ] Clicking variable in command selects it in variables section
  - [ ] Implement copy selected snippets functionality
  - [ ] Implement delete selected snippets functionality
  - [ ] Copy snippets to another open file (with file picker)

- [ ] Phase 9: Polish and UX Improvements
  - [ ] Add keyboard shortcuts (Ctrl+S for save, etc.)
  - [ ] Improve error handling and user feedback
  - [ ] Add confirmation dialogs for destructive actions
  - [ ] Performance optimizations for large files

- [ ] Phase 10: Final Testing and Refinements
  - [ ] Test with various TOML files
  - [ ] Test variable edge cases
  - [ ] Cross-browser testing
  - [ ] Fix any remaining bugs



# Project Overview

This project is a browser-based editor for "pet" CLI snippet TOML files. It allows users to upload, create, edit, and download snippet files locally. The app uses Web Components for UI modularity, runs without a server, and features a sidebar for file management and a main pane for snippet editing with advanced features like variable highlighting and editing.

## High-Level Architecture
- index.html: Entry point, loads shared CSS, registers Web Components, sets up layout (sidebar, main).
- styles.css: Shared generic styles (layout, zebra, highlights, buttons).
- components/: JS files for Web Components (e.g., file-list.js, snippet-list.js, snippet-item.js).
- utils/: JS helpers (e.g., toml-parser.js for parsing/stringifying TOML, fuzzy-search.js).
- Data Model: In-memory array of open files, each with {name, content (parsed TOML as JS object), dirty flag}.
- Features Breakdown:
  - File ops: Upload, new, download, multi-open, sidebar list with select/close.
  - Snippet list: Zebra-striped, checkboxes, editable fields, var highlighting/click-to-select.
  - Header: Select all, copy/delete selected, tag filter (multi-select, all/any), fuzzy search.
  - Variables: Collapsed section per snippet, unique vars with colors, editable values/lists (+/-), sync to command.

## Implementation Notes
- Use @ltd/j-toml for TOML (CDN: https://unpkg.com/@ltd/j-toml).

- Color palette for vars: Cycle through 5-10 colors (e.g., blues, greens).

- No mocking: Each phase builds real, testable functionality.

- Testing: Run locally via file:///path/to/index.html; test file ops with browser permissions.


# ToDo List
- [ ] Phase 1: Basic Structure and LayoutCreate index.html with sidebar and main sections.
  - [ ] Add shared styles.css for basic layout and generic classes.
  - [ ] Register placeholder Web Components for sidebar and main.

- [ ] Phase 2: File HandlingImplement upload button to load TOML files.
  - [ ] Support creating new empty TOML file.
  - [ ] List open files in sidebar with select and close buttons.
  - [ ] Track selected file; update main pane header with file name.

- [ ] Phase 3: TOML Parsing and Snippet DisplayAdd TOML parser utility.
  - [ ] For selected file, parse TOML and display snippet list in main pane.
  - [ ] Each snippet as a Web Component with basic fields (desc, cmd, tags, output).

- [ ] Phase 4: Header ControlsAdd header with select-all checkbox, copy selected button, delete selected button.
  - [ ] Implement tag multi-select dropdown with all/any toggle.
  - [ ] Add fuzzy search input for desc/cmd.

- [ ] Phase 5: Snippet Editing BasicsMake description and command editable (input/textarea).
  - [ ] Add checkboxes per snippet; highlight selected with blue tones.
  - [ ] Implement per-snippet copy and delete buttons.

- [ ] Phase 6: Variable Highlighting and SectionParse variables from command; highlight in command with colors (same color per var name).
  - [ ] Add collapsed variables section with dropdown toggle.
  - [ ] List unique vars with name, value(s), colors; + to add list item, - to remove.

- [ ] Phase 7: Variable Editing SyncWhen editing var values/lists, update command (defaults on first instance only).
  - [ ] Handle list format <var=|_val1_||_val2_|>.
  - [ ] If single blank value, revert to <var>.

- [ ] Phase 8: Advanced InteractionsClicking var in command selects it in variables section (open if closed).
  - [ ] Implement copy selected/all to another open file (prompt for target file).
  - [ ] Filtering: Apply tag and search filters to snippet list.

- [ ] Phase 9: Download and PolishAdd download button for selected file (stringify TOML).
  - [ ] Handle multi-file copy/delete logic.
  - [ ] Add zebra striping, ensure styles are shared.

- [ ] Phase 10
  - [ ] Final Testing and RefinementsTest all features with sample TOML.
  - [ ] Fix bugs, improve UX.

Check off as phases are completed.



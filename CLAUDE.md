# Instructions for Claude on Coding this Project

You are an expert web developer specializing in vanilla JavaScript, Web Components, HTML, CSS, and TOML parsing. Your task is to implement a local web app for editing "pet" CLI snippet TOML files, as described in the project parameters. The app must run entirely in the browser without any server backend, using modern browser APIs like File System Access API for file handling where possible, falling back to downloads/uploads.

## Key Guidelines

### Technology Stack

Use only vanilla JS, HTML, CSS. Web Components for modular UI elements. No frameworks (e.g., no React, Vue). Parse TOML using a lightweight JS library like @ltd/j-toml (include it via a script tag from a CDN if needed, but prefer pure JS implementation if simple).

### TOML Syntax

Strictly follow the original "pet" tool's syntax (from https://github.com/knqyf263/pet). Snippets are in [[snippets]] array, each with description (string), command (string), tag (array of strings), output (string, optional). Variables in command use <var>, <var=value>, or <var=|_val1_||_val2_|> for lists. Do not use fork syntax.

### File Handling

Use browser File API for uploads/downloads. Support multiple open files in memory (as JS objects). No persistent storage.
CSS: Use a shared styles.css for generic classes (e.g., .zebra-even, .highlight-blue1). Avoid duplication.

### Phased Development

Implement one phase at a time. Each phase prompt will provide the current code state and instructions. After each phase, output only the updated files (e.g., index.html, styles.css, components/*.js). Pause for user input/testing.

### Best Practices

- Make components shadow DOM-encapsulated where possible.
- Handle errors gracefully (e.g., invalid TOML).
- Ensure accessibility (e.g., ARIA labels).
- Use fuzzy search via a library like fuse.js (CDN) for description/command filtering.
- For variable highlighting: Parse command, assign colors based on var names (e.g., hash name to color palette).
- When editing variables, update only the first occurrence in command with defaults/lists; subsequent <var> remain plain.

### Output Format

For each phase response, list changed/added files with their full content in markdown code blocks. Do not explain unless asked; focus on code.


# Process and manual testing
Follow the phase-specific prompts provided separately. stop after completing a phase to allow for manual testing.

# Current Implementation Status

## Completed Features (Phases 1-6)

### Phase 1: Basic Structure ✓
- HTML layout with sidebar and main sections
- Shared styles.css with generic classes
- Placeholder Web Components (file-list, snippet-list)

### Phase 2: File Handling ✓
- Upload TOML files via File API
- Create new files with [[snippets]] template
- File list in sidebar with select/close buttons
- Multiple open files support
- Selected file name displayed in header

### Phase 3: TOML Parsing and Display ✓
- utils/toml-parser.js for parsing/stringifying TOML
- Handles both [[snippets]] and [[Snippets]] (case-insensitive)
- Handles both uppercase and lowercase field names (Description/description, etc.)
- Snippet list displays parsed snippets with zebra striping
- snippet-item component shows description, command, tags, output

### Phase 4: Header Controls and Filtering ✓
- Select All checkbox for snippets
- Copy Selected and Delete Selected buttons (stubs)
- Tag multi-select dropdown with All/Any toggle
- Fuzzy search using fuse.js for description/command filtering
- Tag filters reset when switching files
- Search maintains focus while typing

### Phase 5: Snippet Editing ✓
- Editable description (input field)
- Editable command (textarea)
- Editable output (textarea)
- Per-snippet checkboxes with selection highlighting (.highlight-blue1/.highlight-blue2)
- Per-snippet Copy (stub) and Delete buttons
- Tag management: always visible, add/remove tags with +/× buttons
- File dirty indicator (*) in sidebar for modified files
- All edits update parsed object and mark file dirty

### Phase 6: Variable Management ✓
- utils/var-parser.js for extracting variables from commands
- Variable syntax: <var>, <var=value>, <var=|_val1_||_val2_|>
- Color-coded variables (10-color palette, hashed by name)
- Collapsible Variables section (always visible)
- Shows count and empty state message
- Variable value inputs with real-time command sync
- List variables with +/- buttons to add/remove values
- "Make List" button to convert single value to list
- Command textarea maintains focus while typing
- Re-parses variables on command changes

## Technical Implementation Notes

### File Structure
- index.html: Main app with inline Web Components
- styles.css: Shared generic styles
- utils/toml-parser.js: TOML parsing with case-insensitive field handling
- utils/var-parser.js: Variable extraction, color mapping, command updating

### Key Libraries (CDN)
- @ltd/j-toml@1.38.0: TOML parsing
- fuse.js@6.6.2: Fuzzy search
- All loaded via unpkg.com

### State Management
- Global appState: openFiles array, selectedFileIndex
- Each file: {name, content, parsed, dirty}
- window.markFileDirty(): Marks current file as modified
- window.updateSnippetsInFile(): Updates snippets and marks dirty

### Important Patterns
- Focus preservation: Use requestAnimationFrame + setSelectionRange for inputs
- Re-rendering optimization: Only re-render when necessary (e.g., variable count changes)
- Shadow DOM: All Web Components use shadow DOM for encapsulation
- Event delegation: Components re-render and re-attach event listeners

## Known Stub Features (To Implement in Future Phases)
- Copy Selected snippets (Phase 4 header control)
- Delete Selected snippets (Phase 4 header control)
- Copy individual snippet (Phase 5 per-snippet button)
- Download/save file functionality
- Click variable in command to select in variables section
- Copy snippets between files
- Actual variable highlighting in command text (currently just variable section)



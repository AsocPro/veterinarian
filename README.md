# Veterinarian 🩺

> Like a pet doctor, but for your [pet](https://github.com/knqyf263/pet) snippet files.

Veterinarian is a browser-based editor for **pet** CLI snippet TOML files. Edit, manage, and organize your command-line snippets with an intuitive interface featuring advanced variable management, tag filtering, and fuzzy search.

## Features

### File Management
- **Multi-file support**: Open and edit multiple TOML files simultaneously
- **Create new files**: Start fresh with a template snippet file
- **Dirty tracking**: Visual indicator (*) for unsaved changes
- **Download files**: Save your edited snippets back to disk

### Snippet Editing
- **Full TOML support**: Compatible with pet's snippet format
- **Rich editing interface**: Edit descriptions, commands, tags, and outputs
- **Add/delete snippets**: Manage your snippet collection easily
- **Select all/bulk operations**: Work with multiple snippets at once

### Advanced Variable Management
The killer feature - a powerful variable editor that understands pet's variable syntax:

- **Automatic extraction**: Parses variables from commands (`<var>`, `<var=value>`, `<var=|_val1_||_val2_|>`)
- **Color-coded display**: Each variable gets a unique, consistent color
- **Real-time editing**: Changes to variables instantly update the command
- **List support**: Edit multi-value variables with +/- buttons
- **Smart reconstruction**: First occurrence gets full syntax, subsequent uses stay simple
- **Collapsible UI**: Keep your workspace clean

### Filtering & Search
- **Tag filtering**: Filter by tags with All/Any matching modes
- **Fuzzy search**: Find snippets quickly using description or command text
- **Tag management**: Add and remove tags with a simple interface
- **Dynamic tag dropdown**: Shows all available tags across snippets

### UI/UX
- **Clean sidebar**: File list with selection and close buttons
- **Zebra striping**: Alternating colors for easy snippet scanning
- **Persistent filters**: Search and tag filters maintained while editing
- **No server required**: Runs entirely in your browser
- **Web Components architecture**: Modular, maintainable code

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or build process required

### Usage

1. **Open the application**:
   ```bash
   # Serve the directory with any web server, e.g.:
   python3 -m http.server 8000
   # Or simply open index.html in your browser
   ```

2. **Load a snippet file**:
   - Click "Upload .toml" to open existing pet snippet files
   - Or click "New File" to start from scratch

3. **Edit your snippets**:
   - Click on any field to edit it
   - Expand the Variables section to manage command variables
   - Add/remove tags using the +/× buttons

4. **Filter and search**:
   - Use the search box for fuzzy matching
   - Click "Tags" to filter by specific tags
   - Toggle between "Any" and "All" tag matching modes

5. **Save your work**:
   - Click the download icon next to the file name in the sidebar
   - The file will download to your default downloads folder

## Project Structure

```
veterinarian/
├── index.html              # Main application entry point
├── styles.css              # Shared styles (layout, colors, buttons)
├── components/
│   ├── file-list.js       # Sidebar file list component
│   ├── snippet-list.js    # Main snippet list with filtering
│   └── snippet-item.js    # Individual snippet editor
├── utils/
│   ├── toml-parser.js     # TOML parsing and stringification
│   └── var-parser.js      # Variable extraction and command updating
└── docs/
    └── initial.md         # Project documentation and status
```

## Technology Stack

- **Vanilla JavaScript**: No frameworks, just clean ES6+ code
- **Web Components**: Shadow DOM for component encapsulation
- **TOML Parsing**: [@ltd/j-toml](https://www.npmjs.com/package/@ltd/j-toml) (v1.38.0)
- **Fuzzy Search**: [Fuse.js](https://fusejs.io/) (v6.6.2)
- **No build process**: Everything runs directly in the browser

## Pet Snippet Format

Veterinarian follows the [pet](https://github.com/knqyf263/pet) CLI tool's TOML format:

```toml
[[snippets]]
  description = "Search for a file by name"
  command = "find <path> -name <filename>"
  tag = ["filesystem", "search"]
  output = ""

[[snippets]]
  description = "Git commit with message"
  command = "git commit -m <message=initial commit>"
  tag = ["git"]
  output = ""
```

### Variable Syntax
- `<var>` - Simple variable placeholder
- `<var=value>` - Variable with default value
- `<var=|_val1_||_val2_||_val3_|>` - Variable with list of options

## Development

### Component Architecture
The application uses a modular Web Component architecture:

- **file-list**: Manages the sidebar file list
- **snippet-list**: Handles filtering, search, and snippet display
- **snippet-item**: Individual snippet editor with variable management

Components communicate via global functions exposed on the `window` object:
- `window.createNewFile()` - Create a new TOML file
- `window.selectFile(index)` - Switch to a different file
- `window.closeFile(index)` - Close a file
- `window.markFileDirty()` - Mark current file as modified
- `window.updateSnippetsInFile(snippets)` - Update snippets in current file

### State Management
Global state is maintained in `index.html`:
```javascript
const appState = {
  openFiles: [],           // Array of {name, content, parsed, dirty}
  selectedFileIndex: -1    // Currently selected file index
};
```

### Adding Features
1. Utility functions go in `utils/`
2. New components go in `components/`
3. Shared styles go in `styles.css`
4. Components should use Shadow DOM and expose a `render()` method

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (requires modern ES6+ features)

## Roadmap

### Completed ✅
- [x] File upload and management
- [x] TOML parsing with case-insensitive field handling
- [x] Snippet editing (description, command, tags, output)
- [x] Tag filtering and fuzzy search
- [x] Variable extraction and color-coding
- [x] Variable editing with real-time command updates
- [x] List variable support
- [x] Command reconstruction with smart syntax handling
- [x] Component extraction and modularization
- [x] Download/save functionality

### Future Enhancements 🚀
- [ ] Click variable in command to highlight in variables section
- [ ] Copy snippets to clipboard
- [ ] Copy/move snippets between files
- [ ] Keyboard shortcuts (Ctrl+S to save, etc.)
- [ ] Drag-and-drop snippet reordering
- [ ] Import/export individual snippets
- [ ] Snippet templates
- [ ] Syntax highlighting in command field

## Contributing

This is a personal project for editing pet snippet files. Feel free to fork and customize for your needs.

## Why "Veterinarian"?

Because it's a tool to "doctor up" your **pet** snippet files! Get it? 🩺🐾

## License

This project is provided as-is for personal use. The [pet CLI tool](https://github.com/knqyf263/pet) is a separate project by [knqyf263](https://github.com/knqyf263).

## Acknowledgments

- [pet](https://github.com/knqyf263/pet) - The excellent CLI snippet manager this tool supports
- [@ltd/j-toml](https://www.npmjs.com/package/@ltd/j-toml) - Robust TOML parsing library
- [Fuse.js](https://fusejs.io/) - Lightweight fuzzy-search library

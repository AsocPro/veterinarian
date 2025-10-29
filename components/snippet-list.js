// Snippet List Component
class SnippetList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.allSnippets = [];
    this.filteredSnippets = [];
    this.selectedIndices = new Set();
    this.searchQuery = '';
    this.selectedTags = new Set();
    this.tagMatchMode = 'any'; // 'any' or 'all'
    this.fuse = null;
  }

  connectedCallback() {
    this.render([]);

    // Listen for variable color changes
    this.colorChangeListener = () => {
      // Re-render all snippet items to update variable colors
      this.renderUI();
    };
    window.addEventListener('variable-colors-changed', this.colorChangeListener);
  }

  disconnectedCallback() {
    // Clean up event listener
    if (this.colorChangeListener) {
      window.removeEventListener('variable-colors-changed', this.colorChangeListener);
    }
  }

  render(snippets, resetFilters = true) {
    this.allSnippets = snippets;

    // Reset filters when switching files
    if (resetFilters) {
      this.selectedTags.clear();
      this.searchQuery = '';
      this.fuse = null;
    }

    this.applyFilters();
    this.renderUI();
  }

  applyFilters() {
    let filtered = [...this.allSnippets];

    // Apply tag filter
    if (this.selectedTags.size > 0) {
      filtered = filtered.filter(snippet => {
        const snippetTags = snippet.tag || [];
        if (this.tagMatchMode === 'all') {
          return Array.from(this.selectedTags).every(tag => snippetTags.includes(tag));
        } else {
          return Array.from(this.selectedTags).some(tag => snippetTags.includes(tag));
        }
      });
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      if (!this.fuse) {
        this.fuse = new Fuse(filtered, {
          keys: ['description', 'command'],
          threshold: 0.3,
          includeScore: true
        });
      } else {
        this.fuse.setCollection(filtered);
      }
      const results = this.fuse.search(this.searchQuery);
      filtered = results.map(r => r.item);
    }

    this.filteredSnippets = filtered;
  }

  renderUI() {
    const allTags = this.getAllTags();
    const allSelected = this.filteredSnippets.length > 0 &&
                       this.filteredSnippets.every((_, i) => this.selectedIndices.has(i));

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles.css">
      <style>
        :host {
          display: block;
        }
        .controls-header {
          background: var(--bg-secondary, #fff);
          border-bottom: 2px solid var(--border-primary, #e0e0e0);
          padding: var(--spacing-lg, 1rem) var(--spacing-xl, 1.5rem);
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-lg, 1rem);
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
          backdrop-filter: blur(10px);
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
        }
        .control-group label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          color: var(--text-primary, #2c3e50);
          transition: color var(--transition-base, 0.2s ease);
        }
        .control-group label:hover {
          color: var(--accent-primary, #339af0);
        }
        .control-group label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary, #339af0);
          cursor: pointer;
        }
        .search-input {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 0.75rem);
          border: 1px solid var(--border-secondary, #d0d0d0);
          border-radius: var(--radius-md, 6px);
          font-size: 14px;
          min-width: 280px;
          background-color: var(--bg-tertiary, #f1f3f5);
          color: var(--text-primary, #2c3e50);
          transition: all var(--transition-base, 0.2s ease);
        }
        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary, #339af0);
          background-color: var(--bg-secondary, #fff);
          box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.1);
        }
        .search-input:hover {
          border-color: var(--border-hover, #a0a0a0);
        }
        .tag-filter {
          position: relative;
        }
        .tag-dropdown {
          position: absolute;
          top: calc(100% + var(--spacing-xs, 0.25rem));
          left: 0;
          background: var(--bg-secondary, #fff);
          border: 1px solid var(--border-primary, #e0e0e0);
          border-radius: var(--radius-md, 6px);
          box-shadow: var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.1));
          max-height: 320px;
          overflow-y: auto;
          min-width: 220px;
          z-index: 100;
          display: none;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .tag-dropdown.open {
          display: block;
        }
        .tag-option {
          padding: var(--spacing-sm, 0.5rem) var(--spacing-lg, 1rem);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          color: var(--text-primary, #2c3e50);
          transition: all var(--transition-fast, 0.15s ease);
          font-size: 13px;
        }
        .tag-option:hover {
          background-color: var(--bg-tertiary, #f1f3f5);
        }
        .tag-option input {
          cursor: pointer;
          width: 16px;
          height: 16px;
          accent-color: var(--accent-primary, #339af0);
        }
        .snippet-list {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-xl, 1.5rem) var(--spacing-lg, 1rem);
        }
        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl, 2rem) var(--spacing-lg, 1rem);
          color: var(--text-secondary, #6c757d);
          font-size: 15px;
        }
        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-lg, 1rem);
          opacity: 0.3;
        }
      </style>
      <div class="controls-header">
        <div class="control-group">
          <label>
            <input type="checkbox" id="select-all" ${allSelected ? 'checked' : ''}>
            <span>Select All</span>
          </label>
        </div>
        <div class="control-group">
          <button class="btn btn-success" id="add-snippet">+ Add Snippet</button>
          <button class="btn btn-primary" id="copy-selected">Copy Selected</button>
          <button class="btn btn-danger" id="delete-selected">Delete Selected</button>
        </div>
        <div class="control-group tag-filter">
          <button class="btn" id="tag-filter-btn">Tags (${this.selectedTags.size})</button>
          <button class="btn btn-small" id="tag-mode-toggle">${this.tagMatchMode === 'all' ? 'All' : 'Any'}</button>
          <div class="tag-dropdown" id="tag-dropdown">
            ${allTags.length === 0 ? '<div style="padding: 1rem; color: var(--text-secondary, #999);">No tags available</div>' : ''}
            ${allTags.map(tag => `
              <label class="tag-option">
                <input type="checkbox" value="${this.escapeHtml(tag)}" ${this.selectedTags.has(tag) ? 'checked' : ''}>
                <span>${this.escapeHtml(tag)}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="control-group">
          <input type="text" class="search-input" id="search-input" placeholder="Search snippets..." value="${this.escapeHtml(this.searchQuery)}">
        </div>
      </div>
      <div class="snippet-list">
        ${this.filteredSnippets.length === 0 ?
          '<div class="empty-state">' + (this.allSnippets.length === 0 ? 'No snippets in this file' : 'No snippets match the current filters') + '</div>' :
          this.filteredSnippets.map((snippet, index) => `
            <snippet-item data-index="${index}"></snippet-item>
          `).join('')
        }
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.getElementById('select-all').addEventListener('change', (e) => {
      if (e.target.checked) {
        this.filteredSnippets.forEach((_, i) => this.selectedIndices.add(i));
      } else {
        this.selectedIndices.clear();
      }
      this.renderUI();
    });

    this.shadowRoot.getElementById('add-snippet').addEventListener('click', () => {
      // Create a new empty snippet
      const newSnippet = {
        description: '',
        command: '',
        tag: [],
        output: ''
      };

      // Add to the beginning of the snippets array
      this.allSnippets.unshift(newSnippet);

      // Update global state
      window.updateSnippetsInFile(this.allSnippets);

      // Re-render without resetting filters
      this.render(this.allSnippets, false);

      // Focus on the description field of the new snippet after render
      requestAnimationFrame(() => {
        const firstSnippetItem = this.shadowRoot.querySelector('snippet-item');
        if (firstSnippetItem && firstSnippetItem.shadowRoot) {
          const descInput = firstSnippetItem.shadowRoot.getElementById('description-input');
          if (descInput) {
            descInput.focus();
          }
        }
      });
    });

    this.shadowRoot.getElementById('copy-selected').addEventListener('click', () => {
      if (this.selectedIndices.size === 0) {
        alert('No snippets selected');
        return;
      }

      // Get selected snippets
      const selectedSnippets = Array.from(this.selectedIndices)
        .map(idx => this.filteredSnippets[idx]);

      this.showCopyDialog(selectedSnippets);
    });

    this.shadowRoot.getElementById('delete-selected').addEventListener('click', () => {
      if (this.selectedIndices.size === 0) {
        alert('No snippets selected');
        return;
      }

      const count = this.selectedIndices.size;
      if (!confirm(`Delete ${count} selected snippet${count > 1 ? 's' : ''}?`)) {
        return;
      }

      // Get snippets to delete from filtered list
      const snippetsToDelete = Array.from(this.selectedIndices)
        .map(idx => this.filteredSnippets[idx]);

      // Remove them from allSnippets array
      snippetsToDelete.forEach(snippet => {
        const allIndex = this.allSnippets.indexOf(snippet);
        if (allIndex > -1) {
          this.allSnippets.splice(allIndex, 1);
        }
      });

      // Clear selection
      this.selectedIndices.clear();

      // Update global state
      window.updateSnippetsInFile(this.allSnippets);

      // Re-render without resetting filters
      this.render(this.allSnippets, false);
    });

    const tagFilterBtn = this.shadowRoot.getElementById('tag-filter-btn');
    const tagDropdown = this.shadowRoot.getElementById('tag-dropdown');

    tagFilterBtn.addEventListener('click', () => {
      tagDropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    this.shadowRoot.addEventListener('click', (e) => {
      if (!e.target.closest('.tag-filter')) {
        tagDropdown.classList.remove('open');
      }
    });

    this.shadowRoot.getElementById('tag-mode-toggle').addEventListener('click', () => {
      this.tagMatchMode = this.tagMatchMode === 'all' ? 'any' : 'all';
      this.applyFilters();
      this.renderUI();
    });

    tagDropdown.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const tag = e.target.value;
        if (e.target.checked) {
          this.selectedTags.add(tag);
        } else {
          this.selectedTags.delete(tag);
        }
        this.applyFilters();
        this.renderUI();
      });
    });

    const searchInput = this.shadowRoot.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.fuse = null; // Reset fuse instance
      this.applyFilters();
      this.renderUI();
      // Restore focus to search input after re-render
      requestAnimationFrame(() => {
        const newSearchInput = this.shadowRoot.getElementById('search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          // Restore cursor position
          newSearchInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    });

    // Render snippet items
    const snippetItems = this.shadowRoot.querySelectorAll('snippet-item');
    snippetItems.forEach((item, index) => {
      const isSelected = this.selectedIndices.has(index);
      item.render(
        this.filteredSnippets[index],
        index,
        isSelected,
        // onCheckChange
        (idx, checked) => {
          if (checked) {
            this.selectedIndices.add(idx);
          } else {
            this.selectedIndices.delete(idx);
          }
          this.renderUI();
        },
        // onEdit
        (idx, field, value) => {
          this.filteredSnippets[idx][field] = value;
          // Mark file as dirty
          window.markFileDirty();
          // If tags were modified, re-render to update tag dropdown
          // But NOT when editing command (which happens during variable editing)
          if (field === 'tag') {
            this.renderUI();
          }
        },
        // onDelete
        (idx) => {
          // Remove from allSnippets array
          const snippetToDelete = this.filteredSnippets[idx];
          const allIndex = this.allSnippets.indexOf(snippetToDelete);
          if (allIndex > -1) {
            this.allSnippets.splice(allIndex, 1);
          }
          // Update global state
          window.updateSnippetsInFile(this.allSnippets);
          // Re-render without resetting filters (we're still in the same file)
          this.render(this.allSnippets, false);
        },
        // onCopy (stub for now)
        (idx) => {
          console.log('Copy snippet at index', idx);
          alert('Copy snippet functionality will be implemented in a later phase');
        }
      );
    });
  }

  getAllTags() {
    const tagSet = new Set();
    this.allSnippets.forEach(snippet => {
      (snippet.tag || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show copy dialog to select destination file for multiple snippets
   */
  showCopyDialog(snippets) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const openFiles = window.getOpenFiles ? window.getOpenFiles() : [];
    const count = snippets.length;

    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">Copy ${count} Snippet${count > 1 ? 's' : ''} To</div>
        <div class="modal-body">
          <div class="modal-field">
            <label for="copy-target-file">Select destination file:</label>
            <select id="copy-target-file">
              <option value="new">+ Create New File</option>
              ${openFiles.map((file, idx) => `
                <option value="${idx}">${this.escapeHtml(file.name)}${file.dirty ? ' *' : ''}</option>
              `).join('')}
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" id="copy-cancel-btn">Cancel</button>
          <button class="btn btn-primary" id="copy-confirm-btn">Copy</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Handle cancel
    overlay.querySelector('#copy-cancel-btn').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Handle copy
    overlay.querySelector('#copy-confirm-btn').addEventListener('click', () => {
      const select = overlay.querySelector('#copy-target-file');
      const value = select.value;

      if (value === 'new') {
        // Create new file first
        if (window.createNewFile) {
          window.createNewFile();
          // Get the new file's index (last file)
          const newFileIndex = (window.getOpenFiles ? window.getOpenFiles() : []).length - 1;
          if (newFileIndex >= 0 && window.copySnippetsToFile) {
            window.copySnippetsToFile(snippets, newFileIndex);
          }
        }
      } else {
        // Copy to existing file
        const targetIndex = parseInt(value);
        if (!isNaN(targetIndex) && window.copySnippetsToFile) {
          window.copySnippetsToFile(snippets, targetIndex);
        }
      }

      // Clear selection after copying
      this.selectedIndices.clear();
      this.renderUI();

      document.body.removeChild(overlay);
    });

    // Handle click outside dialog to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Focus on select
    requestAnimationFrame(() => {
      overlay.querySelector('#copy-target-file').focus();
    });
  }
}

customElements.define('snippet-list', SnippetList);

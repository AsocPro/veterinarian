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
          background-color: #fff;
          border-bottom: 2px solid #ddd;
          padding: 1rem 1.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .control-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 14px;
          cursor: pointer;
        }
        .search-input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          min-width: 250px;
        }
        .tag-filter {
          position: relative;
        }
        .tag-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-height: 300px;
          overflow-y: auto;
          min-width: 200px;
          z-index: 100;
          display: none;
        }
        .tag-dropdown.open {
          display: block;
        }
        .tag-option {
          padding: 0.5rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tag-option:hover {
          background-color: #f5f5f5;
        }
        .tag-option input {
          cursor: pointer;
        }
        .snippet-list {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #999;
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
            ${allTags.length === 0 ? '<div style="padding: 1rem; color: #999;">No tags available</div>' : ''}
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

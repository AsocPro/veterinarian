// File List Component
class FileList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render([], -1);
  }

  render(files, selectedIndex) {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles.css">
      <style>
        :host {
          display: block;
          height: 100%;
        }
        .file-controls {
          padding: var(--spacing-lg, 1rem);
          border-bottom: 1px solid var(--border-primary, #e0e0e0);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 0.5rem);
          background-color: var(--bg-secondary, #fff);
        }
        .file-list {
          padding: var(--spacing-sm, 0.5rem);
        }
        .file-item {
          padding: var(--spacing-md, 0.75rem) var(--spacing-lg, 1rem);
          border-bottom: 1px solid var(--border-primary, #e0e0e0);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          transition: all var(--transition-base, 0.2s ease);
          border-radius: var(--radius-md, 6px);
          margin-bottom: var(--spacing-xs, 0.25rem);
        }
        .file-item:hover {
          background-color: var(--bg-tertiary, #f1f3f5);
        }
        .file-item.selected {
          background: linear-gradient(90deg, var(--bg-highlight-blue1, #e7f5ff) 0%, var(--bg-highlight-blue2, #d0ebff) 100%);
          border-left: 3px solid var(--accent-primary, #339af0);
          padding-left: calc(var(--spacing-lg, 1rem) - 3px);
          box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
        }
        .file-name {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          word-break: break-word;
          cursor: pointer;
          color: var(--text-primary, #2c3e50);
          transition: color var(--transition-base, 0.2s ease);
        }
        .file-name:hover {
          color: var(--accent-primary, #339af0);
        }
        .file-name.dirty::after {
          content: ' *';
          color: var(--danger, #fa5252);
          font-weight: bold;
          font-size: 16px;
        }
        .file-name-input {
          flex: 1;
          font-size: 13px;
          padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
          border: 1px solid var(--accent-primary, #339af0);
          border-radius: var(--radius-sm, 4px);
          background-color: var(--bg-secondary, #fff);
          color: var(--text-primary, #2c3e50);
          box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.1);
        }
        .file-name-input:focus {
          outline: none;
        }
        .file-actions {
          display: flex;
          gap: var(--spacing-xs, 0.25rem);
        }
      </style>
      <div class="file-controls">
        <button class="btn btn-primary" id="upload-btn">Upload TOML</button>
        <button class="btn" id="new-btn">New File</button>
      </div>
      <div class="file-list">
        ${files.length === 0 ? '<div style="padding: 1rem; color: var(--text-secondary, #999); font-size: 13px;">No files open</div>' : ''}
        ${files.map((file, index) => `
          <div class="file-item ${index === selectedIndex ? 'selected' : ''}" data-index="${index}">
            <div class="file-name ${file.dirty ? 'dirty' : ''}" data-rename="${index}">${this.escapeHtml(file.name)}</div>
            <div class="file-actions">
              ${index !== selectedIndex ? `<button class="btn btn-small" data-select="${index}">Select</button>` : ''}
              ${index === selectedIndex ? `<button class="btn btn-small btn-primary" data-save="${index}">Save</button>` : ''}
              <button class="btn btn-small btn-danger" data-close="${index}">Close</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Attach event listeners
    this.shadowRoot.getElementById('upload-btn').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });

    this.shadowRoot.getElementById('new-btn').addEventListener('click', () => {
      window.createNewFile();
    });

    this.shadowRoot.querySelectorAll('[data-select]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.select);
        window.selectFile(index);
      });
    });

    this.shadowRoot.querySelectorAll('[data-save]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.save);
        window.saveFile(index);
      });
    });

    this.shadowRoot.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.close);
        const file = window.appState.openFiles[index];
        const confirmMessage = file.dirty
          ? `Close "${file.name}"? You have unsaved changes.`
          : `Close "${file.name}"?`;

        if (confirm(confirmMessage)) {
          window.closeFile(index);
        }
      });
    });

    this.shadowRoot.querySelectorAll('[data-rename]').forEach(nameDiv => {
      nameDiv.addEventListener('dblclick', (e) => {
        const index = parseInt(e.target.dataset.rename);
        this.startRename(index, e.target);
      });
    });
  }

  startRename(index, nameElement) {
    const fileItem = nameElement.closest('.file-item');
    const currentName = window.appState.openFiles[index].name;

    // Replace name div with input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'file-name-input';
    input.value = currentName;

    // Replace the element
    nameElement.replaceWith(input);
    input.focus();
    input.select();

    const finishRename = () => {
      const newName = input.value.trim();
      if (newName && newName !== currentName) {
        window.renameFile(index, newName);
      } else {
        // Re-render to restore original state
        window.updateUI();
      }
    };

    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishRename();
      } else if (e.key === 'Escape') {
        window.updateUI();
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('file-list', FileList);

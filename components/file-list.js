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
        }
        .file-controls {
          padding: 1rem;
          border-bottom: 1px solid var(--border-primary, #ddd);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .file-list {
          padding: 0.5rem;
        }
        .file-item {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-primary, #eee);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .file-item.selected {
          background-color: var(--bg-highlight-blue1, #e3f2fd);
          border-left: 3px solid var(--highlight-border, #2196f3);
          padding-left: calc(0.75rem - 3px);
        }
        .file-name {
          flex: 1;
          font-size: 13px;
          word-break: break-word;
          cursor: pointer;
          color: var(--text-primary, #333);
        }
        .file-name:hover {
          color: var(--highlight-border, #2196f3);
        }
        .file-name.dirty::after {
          content: ' *';
          color: #f44336;
          font-weight: bold;
        }
        .file-name-input {
          flex: 1;
          font-size: 13px;
          padding: 0.25rem;
          border: 1px solid var(--highlight-border, #2196f3);
          border-radius: 3px;
          background-color: var(--bg-secondary, #fff);
          color: var(--text-primary, #333);
        }
        .file-actions {
          display: flex;
          gap: 0.25rem;
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

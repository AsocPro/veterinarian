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
          border-bottom: 1px solid #ddd;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .file-list {
          padding: 0.5rem;
        }
        .file-item {
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .file-item.selected {
          background-color: #e3f2fd;
          border-left: 3px solid #2196f3;
          padding-left: calc(0.75rem - 3px);
        }
        .file-name {
          flex: 1;
          font-size: 13px;
          word-break: break-word;
        }
        .file-name.dirty::after {
          content: ' *';
          color: #f44336;
          font-weight: bold;
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
        ${files.length === 0 ? '<div style="padding: 1rem; color: #999; font-size: 13px;">No files open</div>' : ''}
        ${files.map((file, index) => `
          <div class="file-item ${index === selectedIndex ? 'selected' : ''}">
            <div class="file-name ${file.dirty ? 'dirty' : ''}">${this.escapeHtml(file.name)}</div>
            <div class="file-actions">
              ${index !== selectedIndex ? `<button class="btn btn-small" data-select="${index}">Select</button>` : ''}
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

    this.shadowRoot.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.close);
        window.closeFile(index);
      });
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('file-list', FileList);

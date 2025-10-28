// Settings Dialog Component
class SettingsDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  show() {
    // Load current settings from localStorage
    const settings = this.loadSettings();
    this.settings = settings;

    this.render();
  }

  getDefaultSettings() {
    return {
      theme: 'auto',
      sidebarWidth: 250,
      variableColors: [
        '#e91e63',
        '#9c27b0',
        '#3f51b5',
        '#2196f3',
        '#009688',
        '#ff9800',
        '#f44336'
      ]
    };
  }

  loadSettings() {
    const defaults = this.getDefaultSettings();
    return {
      theme: localStorage.getItem('theme-mode') || defaults.theme,
      sidebarWidth: parseInt(localStorage.getItem('sidebar-width')) || defaults.sidebarWidth,
      variableColors: JSON.parse(localStorage.getItem('variable-colors') || 'null') || defaults.variableColors
    };
  }

  saveSettings() {
    localStorage.setItem('theme-mode', this.settings.theme);
    localStorage.setItem('sidebar-width', this.settings.sidebarWidth.toString());
    localStorage.setItem('variable-colors', JSON.stringify(this.settings.variableColors));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles.css">
      <style>
        :host {
          display: none;
        }
        :host(.visible) {
          display: block;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--modal-overlay, rgba(0, 0, 0, 0.5));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-dialog {
          background-color: var(--bg-secondary);
          border-radius: 8px;
          padding: 1.5rem;
          width: 500px;
          max-width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .modal-header {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        .modal-body {
          margin-bottom: 1.5rem;
        }
        .modal-field {
          margin-bottom: 1.5rem;
        }
        .modal-field:last-child {
          margin-bottom: 0;
        }
        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }
        .theme-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .theme-button {
          flex: 1;
          padding: 0.5rem 1rem;
          border: 2px solid var(--border-primary);
          border-radius: 4px;
          background-color: var(--button-bg);
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .theme-button:hover {
          background-color: var(--button-hover);
          border-color: var(--border-hover);
        }
        .theme-button.active {
          background-color: #2196f3;
          color: #fff;
          border-color: #2196f3;
        }
        .sidebar-width-input {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .sidebar-width-input input {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          outline: none;
        }
        .sidebar-width-input input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #2196f3;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .sidebar-width-input input::-webkit-slider-thumb:hover {
          background: #1976d2;
        }
        .sidebar-width-input input::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #2196f3;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .sidebar-width-input input::-moz-range-thumb:hover {
          background: #1976d2;
        }
        .sidebar-width-value {
          min-width: 50px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          text-align: right;
        }
        .colors-list {
          margin-top: 0.5rem;
        }
        .color-item {
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          background-color: var(--bg-zebra-even);
          border-radius: 4px;
          border: 1px solid var(--border-primary);
          display: flex;
          gap: 0.75rem;
          align-items: center;
          cursor: grab;
          transition: all 0.05s ease;
          position: relative;
        }
        .color-item:last-child {
          margin-bottom: 0;
        }
        .color-item.dragging {
          opacity: 0.3;
          cursor: grabbing;
          transform: scale(0.9) rotate(2deg);
          background-color: var(--bg-highlight-blue1);
          border-color: #2196f3;
        }
        .color-item.drag-over::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #2196f3;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(33, 150, 243, 0.6);
          animation: pulse 0.6s ease-in-out infinite;
        }
        .color-item.drag-over-bottom::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #2196f3;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(33, 150, 243, 0.6);
          animation: pulse 0.6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.7;
            transform: scaleY(1.2);
          }
        }
        .drag-handle {
          cursor: grab;
          color: var(--text-secondary);
          font-size: 1.25rem;
          line-height: 1;
          user-select: none;
          display: flex;
          align-items: center;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .color-preview {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          border: 2px solid var(--border-primary);
          flex-shrink: 0;
        }
        .color-input-wrapper {
          flex: 1;
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .color-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 4px;
          font-size: 13px;
          font-family: 'Courier New', monospace;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }
        .color-input:focus {
          outline: none;
          border-color: #2196f3;
        }
        .color-picker {
          -webkit-appearance: none;
          appearance: none;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: none;
          padding: 0;
        }
        .color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .color-picker::-webkit-color-swatch {
          border: 2px solid var(--border-primary);
          border-radius: 4px;
        }
        .color-picker::-moz-color-swatch {
          border: 2px solid var(--border-primary);
          border-radius: 4px;
        }
        .add-color-btn {
          margin-top: 0.5rem;
        }
        .modal-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
      </style>
      <div class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">Settings</div>
          <div class="modal-body">
            <div class="modal-field">
              <label class="field-label">Default Theme</label>
              <div class="theme-buttons">
                <button class="theme-button ${this.settings.theme === 'light' ? 'active' : ''}" data-theme="light">Light</button>
                <button class="theme-button ${this.settings.theme === 'auto' ? 'active' : ''}" data-theme="auto">Auto</button>
                <button class="theme-button ${this.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">Dark</button>
              </div>
            </div>
            <div class="modal-field">
              <label class="field-label">Default Sidebar Width (${this.settings.sidebarWidth}px)</label>
              <div class="sidebar-width-input">
                <input type="range" id="sidebar-width-slider" min="150" max="600" value="${this.settings.sidebarWidth}">
                <span class="sidebar-width-value" id="sidebar-width-value">${this.settings.sidebarWidth}px</span>
              </div>
            </div>
            <div class="modal-field">
              <label class="field-label">Variable Colors (${this.settings.variableColors.length})</label>
              <div class="colors-list" id="colors-list">
                ${this.settings.variableColors.map((color, idx) => `
                  <div class="color-item" draggable="true" data-color-idx="${idx}">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="color-preview" style="background-color: ${color};"></div>
                    <div class="color-input-wrapper">
                      <input type="text" class="color-input" data-color-idx="${idx}" value="${color}" placeholder="#000000">
                      <input type="color" class="color-picker" data-color-idx="${idx}" value="${color}">
                      <button class="btn btn-small btn-danger" data-remove-color="${idx}" title="Remove color">&minus;</button>
                    </div>
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-small add-color-btn" id="add-color-btn">+ Add Color</button>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn" id="import-btn">Import Settings</button>
            <button class="btn" id="export-btn">Export Settings</button>
            <button class="btn btn-danger" id="reset-btn">Reset to Defaults</button>
            <input type="file" id="import-file-input" accept=".json" style="display: none;">
            <div style="flex: 1;"></div>
            <button class="btn" id="cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="save-btn">Save</button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  updateColorsList() {
    const colorsList = this.shadowRoot.getElementById('colors-list');
    if (colorsList) {
      colorsList.innerHTML = this.settings.variableColors.map((color, idx) => `
        <div class="color-item" draggable="true" data-color-idx="${idx}">
          <div class="drag-handle">⋮⋮</div>
          <div class="color-preview" style="background-color: ${color};"></div>
          <div class="color-input-wrapper">
            <input type="text" class="color-input" data-color-idx="${idx}" value="${color}" placeholder="#000000">
            <input type="color" class="color-picker" data-color-idx="${idx}" value="${color}">
            <button class="btn btn-small btn-danger" data-remove-color="${idx}" title="Remove color">&minus;</button>
          </div>
        </div>
      `).join('');

      // Re-attach listeners for new color items
      this.attachColorListeners();
      this.attachDragListeners();
    }
  }

  attachEventListeners() {
    // Theme buttons
    this.shadowRoot.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.settings.theme = theme;

        // Update active state
        this.shadowRoot.querySelectorAll('.theme-button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Sidebar width slider
    const slider = this.shadowRoot.getElementById('sidebar-width-slider');
    const valueDisplay = this.shadowRoot.getElementById('sidebar-width-value');

    slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.settings.sidebarWidth = value;
      valueDisplay.textContent = `${value}px`;

      // Update field label
      const label = this.shadowRoot.querySelector('.modal-field:nth-child(2) .field-label');
      if (label) {
        label.textContent = `Default Sidebar Width (${value}px)`;
      }
    });

    // Color management
    this.attachColorListeners();
    this.attachDragListeners();

    // Add color button
    const addColorBtn = this.shadowRoot.getElementById('add-color-btn');
    addColorBtn.addEventListener('click', () => {
      this.settings.variableColors.push('#2196f3');
      this.updateColorsList();

      // Update field label
      const label = this.shadowRoot.querySelector('.modal-field:nth-child(3) .field-label');
      if (label) {
        label.textContent = `Variable Colors (${this.settings.variableColors.length})`;
      }
    });

    // Export button
    const exportBtn = this.shadowRoot.getElementById('export-btn');
    exportBtn.addEventListener('click', () => {
      this.exportSettings();
    });

    // Import button
    const importBtn = this.shadowRoot.getElementById('import-btn');
    const importFileInput = this.shadowRoot.getElementById('import-file-input');

    importBtn.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.importSettings(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    });

    // Reset button
    const resetBtn = this.shadowRoot.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        this.resetToDefaults();
      }
    });

    // Cancel button
    const cancelBtn = this.shadowRoot.getElementById('cancel-btn');
    cancelBtn.addEventListener('click', () => {
      this.hide();
    });

    // Save button
    const saveBtn = this.shadowRoot.getElementById('save-btn');
    saveBtn.addEventListener('click', () => {
      this.saveSettings();

      // Apply settings immediately
      if (window.setTheme) {
        window.setTheme(this.settings.theme);
      }

      // Apply sidebar width
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.style.width = this.settings.sidebarWidth + 'px';
        document.documentElement.style.setProperty('--sidebar-width', this.settings.sidebarWidth + 'px');
      }

      // Notify that colors changed (components can listen for this event)
      window.dispatchEvent(new CustomEvent('variable-colors-changed', {
        detail: { colors: this.settings.variableColors }
      }));

      this.hide();
    });

    // Close on overlay click
    const overlay = this.shadowRoot.querySelector('.modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide();
      }
    });
  }

  attachColorListeners() {
    // Color text inputs
    this.shadowRoot.querySelectorAll('.color-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.colorIdx);
        const value = e.target.value;
        this.settings.variableColors[idx] = value;

        // Update preview
        const preview = e.target.closest('.color-item').querySelector('.color-preview');
        if (preview) {
          preview.style.backgroundColor = value;
        }

        // Update color picker
        const picker = e.target.closest('.color-item').querySelector('.color-picker');
        if (picker && /^#[0-9A-F]{6}$/i.test(value)) {
          picker.value = value;
        }
      });
    });

    // Color pickers
    this.shadowRoot.querySelectorAll('.color-picker').forEach(picker => {
      picker.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.colorIdx);
        const value = e.target.value;
        this.settings.variableColors[idx] = value;

        // Update text input
        const textInput = e.target.closest('.color-item').querySelector('.color-input');
        if (textInput) {
          textInput.value = value;
        }

        // Update preview
        const preview = e.target.closest('.color-item').querySelector('.color-preview');
        if (preview) {
          preview.style.backgroundColor = value;
        }
      });
    });

    // Remove color buttons
    this.shadowRoot.querySelectorAll('[data-remove-color]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.removeColor);

        if (this.settings.variableColors.length === 1) {
          alert('You must have at least one color defined.');
          return;
        }

        this.settings.variableColors.splice(idx, 1);
        this.updateColorsList();

        // Update field label
        const label = this.shadowRoot.querySelector('.modal-field:nth-child(3) .field-label');
        if (label) {
          label.textContent = `Variable Colors (${this.settings.variableColors.length})`;
        }
      });
    });
  }

  attachDragListeners() {
    const colorItems = this.shadowRoot.querySelectorAll('.color-item');

    window.DragReorder.attach(colorItems, (oldIndex, newIndex) => {
      // Reorder the colors array
      const [removed] = this.settings.variableColors.splice(oldIndex, 1);
      this.settings.variableColors.splice(newIndex, 0, removed);

      // Update the UI
      this.updateColorsList();

      // Update field label
      const label = this.shadowRoot.querySelector('.modal-field:nth-child(3) .field-label');
      if (label) {
        label.textContent = `Variable Colors (${this.settings.variableColors.length})`;
      }
    }, {
      dataIndexAttr: 'data-color-idx'
    });
  }

  resetToDefaults() {
    // Load default settings
    const defaults = this.getDefaultSettings();
    this.settings = {
      theme: defaults.theme,
      sidebarWidth: defaults.sidebarWidth,
      variableColors: [...defaults.variableColors] // Create a copy
    };

    // Re-render to show default settings
    this.render();

    // Show confirmation message
    alert('Settings have been reset to defaults. Click "Save" to apply or "Cancel" to discard.');
  }

  exportSettings() {
    // Create settings object with current values
    const settingsData = {
      theme: this.settings.theme,
      sidebarWidth: this.settings.sidebarWidth,
      variableColors: this.settings.variableColors,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Convert to JSON
    const jsonString = JSON.stringify(settingsData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veterinarian-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importSettings(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const settingsData = JSON.parse(e.target.result);

        // Validate settings structure
        if (!settingsData || typeof settingsData !== 'object') {
          alert('Invalid settings file format.');
          return;
        }

        // Import settings with validation
        if (settingsData.theme && ['light', 'auto', 'dark'].includes(settingsData.theme)) {
          this.settings.theme = settingsData.theme;
        }

        if (settingsData.sidebarWidth && typeof settingsData.sidebarWidth === 'number') {
          this.settings.sidebarWidth = Math.max(150, Math.min(600, settingsData.sidebarWidth));
        }

        if (Array.isArray(settingsData.variableColors) && settingsData.variableColors.length > 0) {
          // Validate that all colors are strings (hex codes)
          const validColors = settingsData.variableColors.filter(c => typeof c === 'string' && c.match(/^#[0-9A-Fa-f]{6}$/));
          if (validColors.length > 0) {
            this.settings.variableColors = validColors;
          }
        }

        // Re-render to show imported settings
        this.render();

        // Show success message
        alert('Settings imported successfully!');
      } catch (err) {
        console.error('Failed to import settings:', err);
        alert('Failed to import settings. Please check the file format.');
      }
    };

    reader.onerror = () => {
      alert('Failed to read settings file.');
    };

    reader.readAsText(file);
  }

  hide() {
    this.classList.remove('visible');
    // Remove from DOM after animation
    setTimeout(() => {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    }, 300);
  }
}

customElements.define('settings-dialog', SettingsDialog);

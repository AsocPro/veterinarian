// Snippet Item Component
class SnippetItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render(snippet, index, isSelected = false, onCheckChange = null, onEdit = null, onDelete = null, onCopy = null) {
    this.onCheckChange = onCheckChange;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.onCopy = onCopy;
    this.index = index;
    this.snippet = snippet;

    const tags = snippet.tag || [];
    const output = snippet.output || '';

    // Parse variables from command (preserve existing structure if re-rendering)
    // This prevents losing isList state when command doesn't change
    if (!this.variables || this.lastCommand !== snippet.command) {
      this.variables = window.VarParser.parseVariables(snippet.command || '');
      this.lastCommand = snippet.command;
    }
    this.variablesExpanded = this.variablesExpanded || false;
    this.outputExpanded = this.outputExpanded || false;

    // Determine highlight class based on selection only
    let highlightClass = '';
    if (isSelected) {
      highlightClass = 'highlight-blue1';
    } else {
      highlightClass = 'default-bg';
    }

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles.css">
      <style>
        :host {
          display: block;
          margin-bottom: 1rem;
        }
        .snippet-container {
          border: 1px solid var(--border-primary, #ddd);
          border-radius: 4px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .snippet-header {
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .default-bg {
          background-color: var(--bg-zebra-even, #f9f9f9);
        }
        .snippet-header input[type="checkbox"] {
          cursor: pointer;
        }
        .snippet-title-input {
          flex: 1;
          border: 1px solid var(--border-primary, #ddd);
          border-radius: 4px;
          padding: 0.5rem;
          font-size: 14px;
          font-weight: 600;
          background-color: var(--bg-secondary, #fff);
          color: var(--text-primary, #333);
        }
        .snippet-title-input:focus {
          outline: none;
          border-color: var(--highlight-border, #2196f3);
        }
        .snippet-actions {
          display: flex;
          gap: 0.25rem;
        }
        .snippet-body {
          padding: 1rem;
          background-color: var(--bg-secondary, #fff);
        }
        .snippet-field {
          margin-bottom: 1rem;
        }
        .snippet-field:last-child {
          margin-bottom: 0;
        }
        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary, #666);
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field-value textarea {
          width: 100%;
          min-height: 80px;
          background-color: var(--bg-tertiary, #f5f5f5);
          padding: 0.75rem;
          border: 1px solid var(--border-primary, #ddd);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          color: var(--text-primary, #333);
        }
        .field-value textarea:focus {
          outline: none;
          border-color: var(--highlight-border, #2196f3);
          background-color: var(--bg-secondary, #fff);
        }
        .command-editor {
          width: 100%;
          min-height: 80px;
          background-color: var(--bg-tertiary, #f5f5f5);
          padding: 0.75rem;
          border: 1px solid var(--border-primary, #ddd);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          color: var(--text-primary, #333);
        }
        .command-editor:focus {
          outline: none;
          border-color: var(--highlight-border, #2196f3);
          background-color: var(--bg-secondary, #fff);
        }
        .command-editor:empty:before {
          content: attr(data-placeholder);
          color: var(--text-secondary, #999);
        }
        .var-highlight {
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .var-highlight:hover {
          opacity: 0.7;
        }
        .field-value ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        .tag-item {
          background-color: #e3f2fd;
          color: #1976d2;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tag-remove {
          background: none;
          border: none;
          color: #1976d2;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          line-height: 1;
          font-weight: bold;
        }
        .tag-remove:hover {
          color: #d32f2f;
        }
        .tag-add-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .tag-input {
          padding: 0.25rem 0.5rem;
          border: 1px solid var(--border-primary, #ddd);
          border-radius: 4px;
          font-size: 12px;
          background-color: var(--bg-secondary, #fff);
          color: var(--text-primary, #333);
        }
        .tag-input:focus {
          outline: none;
          border-color: var(--highlight-border, #2196f3);
        }
        .output-textarea {
          width: 100%;
          min-height: 60px;
          background-color: var(--bg-tertiary, #f5f5f5);
          padding: 0.75rem;
          border: 1px solid var(--border-primary, #ddd);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
          color: var(--text-primary, #333);
        }
        .output-textarea:focus {
          outline: none;
          border-color: var(--highlight-border, #2196f3);
          background-color: var(--bg-secondary, #fff);
        }
        .field-value pre {
          background-color: var(--bg-tertiary, #f5f5f5);
          padding: 0.75rem;
          border-radius: 4px;
          overflow-x: auto;
          margin: 0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-primary, #333);
        }
        .variables-header {
          cursor: pointer;
          user-select: none;
        }
        .variables-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .triangle {
          display: inline-block;
          transition: transform 0.2s ease;
          font-size: 10px;
        }
        .triangle.expanded {
          transform: rotate(90deg);
        }
        .variables-section {
          display: none;
          margin-top: 0.5rem;
          padding: 0.75rem;
          background-color: var(--bg-zebra-even, #f9f9f9);
          border-radius: 4px;
        }
        .variables-section.expanded {
          display: block;
        }
        .variable-item {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background-color: var(--bg-secondary, #fff);
          border-radius: 4px;
          border: 1px solid var(--border-primary, #e0e0e0);
        }
        .variable-item:last-child {
          margin-bottom: 0;
        }
        .variable-name {
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }
        .variable-values {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .variable-value-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .variable-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--border-primary, #ddd);
          border-radius: 4px;
          font-size: 13px;
          font-family: 'Courier New', monospace;
          background-color: var(--bg-secondary, #fff);
          color: var(--text-primary, #333);
        }
        .variable-input:focus {
          outline: none;
          border-color: var(--highlight-border, #2196f3);
        }
      </style>
      <div class="snippet-container">
        <div class="snippet-header ${highlightClass}">
          <input type="checkbox" id="snippet-checkbox" ${isSelected ? 'checked' : ''}>
          <input type="text" class="snippet-title-input" id="description-input" value="${this.escapeAttr(snippet.description || '')}" placeholder="Enter description">
          <div class="snippet-actions">
            <button class="btn btn-small" id="test-btn">Test</button>
            <button class="btn btn-small" id="copy-btn">Copy</button>
            <button class="btn btn-small btn-danger" id="delete-btn">Delete</button>
          </div>
        </div>
        <div class="snippet-body">
          <div class="snippet-field">
            <div class="field-label">Command</div>
            <div class="field-value">
              <div class="command-editor" id="command-input" contenteditable="true" data-placeholder="Enter command">${this.renderHighlightedCommand(snippet.command || '')}</div>
            </div>
          </div>
          <div class="snippet-field">
            <div class="field-label">Tags</div>
            <div class="field-value">
              <ul id="tags-list">
                ${tags.map((tag, tagIndex) => `
                  <li class="tag-item">
                    <span>${this.escapeHtml(tag)}</span>
                    <button class="tag-remove" data-tag-index="${tagIndex}" title="Remove tag">&times;</button>
                  </li>
                `).join('')}
                <li class="tag-add-container">
                  <button class="btn btn-small" id="show-tag-input">+ Add Tag</button>
                  <input type="text" class="tag-input" id="tag-input" placeholder="Tag name" style="display: none;">
                  <button class="btn btn-small btn-primary" id="add-tag-btn" style="display: none;">Add</button>
                </li>
              </ul>
            </div>
          </div>
          <div class="snippet-field">
            <div class="field-label variables-header">
              <span class="variables-toggle" id="variables-toggle">
                <span class="triangle ${this.variablesExpanded ? 'expanded' : ''}">▶</span>
                Variables (${this.variables.length})
              </span>
            </div>
            <div class="variables-section ${this.variablesExpanded ? 'expanded' : ''}" id="variables-section">
              ${this.variables.length === 0 ? `
                <div style="padding: 1rem; color: var(--text-secondary, #999); font-size: 13px; text-align: center;">
                  No variables found. Use &lt;varname&gt; syntax in command.
                </div>
              ` : `
                ${this.variables.map((varObj, varIdx) => `
                  <div class="variable-item">
                    <div class="variable-name" style="background-color: ${varObj.color}20; border-left: 3px solid ${varObj.color};">
                      <span style="color: ${varObj.color}; font-weight: bold;">&lt;${this.escapeHtml(varObj.name)}&gt;</span>
                    </div>
                    <div class="variable-values">
                      ${varObj.isList ? `
                        ${varObj.listValues.map((val, valIdx) => `
                          <div class="variable-value-row">
                            <input type="text" class="variable-input" data-var-idx="${varIdx}" data-val-idx="${valIdx}" value="${this.escapeAttr(val)}" placeholder="Value ${valIdx + 1}">
                            <button class="btn btn-small btn-danger" data-remove-val="${varIdx}-${valIdx}" title="Remove value">&minus;</button>
                          </div>
                        `).join('')}
                        <button class="btn btn-small" data-add-val="${varIdx}">+ Add Value</button>
                      ` : `
                        <div class="variable-value-row">
                          <input type="text" class="variable-input" data-var-idx="${varIdx}" data-val-idx="0" value="${this.escapeAttr(varObj.value)}" placeholder="Value">
                          <button class="btn btn-small" data-make-list="${varIdx}">Make List</button>
                        </div>
                      `}
                    </div>
                  </div>
                `).join('')}
              `}
            </div>
          </div>
          <div class="snippet-field">
            <div class="field-label variables-header">
              <span class="variables-toggle" id="output-toggle">
                <span class="triangle ${this.outputExpanded ? 'expanded' : ''}">▶</span>
                Output
              </span>
            </div>
            <div class="variables-section ${this.outputExpanded ? 'expanded' : ''}" id="output-section">
              <textarea class="output-textarea" id="output-input" placeholder="Expected output (optional)">${this.escapeHtml(output)}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach checkbox listener
    if (this.onCheckChange) {
      this.shadowRoot.getElementById('snippet-checkbox').addEventListener('change', (e) => {
        this.onCheckChange(this.index, e.target.checked);
      });
    }

    // Attach edit listeners
    const descInput = this.shadowRoot.getElementById('description-input');
    const cmdInput = this.shadowRoot.getElementById('command-input');
    const outputInput = this.shadowRoot.getElementById('output-input');

    if (this.onEdit) {
      descInput.addEventListener('input', (e) => {
        this.snippet.description = e.target.value;
        this.onEdit(this.index, 'description', e.target.value);
      });

      cmdInput.addEventListener('input', (e) => {
        // Get plain text from contenteditable
        const plainText = e.target.innerText || '';
        this.snippet.command = plainText;
        this.onEdit(this.index, 'command', plainText);

        // Save cursor position BEFORE any DOM changes
        const cursorOffset = this.getCursorOffsetSimple(e.target);

        // Re-parse variables when command changes but don't re-render unless count changed
        const oldVarCount = this.variables.length;
        this.variables = window.VarParser.parseVariables(plainText);
        this.lastCommand = plainText;

        // Always update highlighting
        const newHTML = this.renderHighlightedCommand(plainText);
        if (e.target.innerHTML !== newHTML) {
          e.target.innerHTML = newHTML;

          // Restore cursor position after DOM update
          this.setCursorOffsetSimple(e.target, cursorOffset);

          // Re-attach click handlers for variable spans
          this.attachVariableSpanHandlers();
        }

        if (this.variables.length !== oldVarCount) {
          // Re-render when variable count changes to update the variables section
          requestAnimationFrame(() => {
            this.render(this.snippet, this.index, this.shadowRoot.querySelector('#snippet-checkbox')?.checked || false, this.onCheckChange, this.onEdit, this.onDelete, this.onCopy);
            // Restore focus to command input
            const newCmdInput = this.shadowRoot.getElementById('command-input');
            if (newCmdInput) {
              newCmdInput.focus();
              this.setCursorOffsetSimple(newCmdInput, cursorOffset);
            }
          });
        }
      });

      // Attach initial click handlers for variable spans
      this.attachVariableSpanHandlers();

      if (outputInput) {
        outputInput.addEventListener('input', (e) => {
          this.snippet.output = e.target.value;
          this.onEdit(this.index, 'output', e.target.value);
        });
      }
    }

    // Attach variables section listeners
    const variablesToggle = this.shadowRoot.getElementById('variables-toggle');
    if (variablesToggle) {
      variablesToggle.addEventListener('click', () => {
        this.variablesExpanded = !this.variablesExpanded;
        this.render(this.snippet, this.index, this.shadowRoot.querySelector('#snippet-checkbox')?.checked || false, this.onCheckChange, this.onEdit, this.onDelete, this.onCopy);
      });

      // Variable value inputs
      this.shadowRoot.querySelectorAll('.variable-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const varIdx = parseInt(e.target.dataset.varIdx);
          const valIdx = parseInt(e.target.dataset.valIdx);
          const varObj = this.variables[varIdx];

          if (varObj.isList) {
            varObj.listValues[valIdx] = e.target.value;
          } else {
            varObj.value = e.target.value;
          }

          // Update command with new values
          this.snippet.command = window.VarParser.updateCommand(this.snippet.command, this.variables);
          cmdInput.innerHTML = this.renderHighlightedCommand(this.snippet.command);

          if (this.onEdit) {
            this.onEdit(this.index, 'command', this.snippet.command);
          }
        });
      });

      // Add value button (for lists)
      this.shadowRoot.querySelectorAll('[data-add-val]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const varIdx = parseInt(e.target.dataset.addVal);
          const newValIdx = this.variables[varIdx].listValues.length; // Index of the new field
          this.variables[varIdx].listValues.push('');
          // Update command with new list structure
          this.snippet.command = window.VarParser.updateCommand(this.snippet.command, this.variables);
          this.lastCommand = this.snippet.command;
          if (this.onEdit) {
            this.onEdit(this.index, 'command', this.snippet.command);
          }
          this.render(this.snippet, this.index, this.shadowRoot.querySelector('#snippet-checkbox')?.checked || false, this.onCheckChange, this.onEdit, this.onDelete, this.onCopy);

          // Focus the newly added input field
          requestAnimationFrame(() => {
            const newInput = this.shadowRoot.querySelector(`.variable-input[data-var-idx="${varIdx}"][data-val-idx="${newValIdx}"]`);
            if (newInput) {
              newInput.focus();
            }
          });
        });
      });

      // Remove value button (for lists)
      this.shadowRoot.querySelectorAll('[data-remove-val]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const [varIdx, valIdx] = e.target.dataset.removeVal.split('-').map(Number);
          const varObj = this.variables[varIdx];

          if (varObj.listValues.length === 1) {
            // Last item: convert back to single value and clear it
            varObj.isList = false;
            varObj.value = '';
            varObj.listValues = [''];
          } else if (varObj.listValues.length > 1) {
            // Multiple items: just remove this one
            varObj.listValues.splice(valIdx, 1);
          }

          // Update command
          this.snippet.command = window.VarParser.updateCommand(this.snippet.command, this.variables);
          this.lastCommand = this.snippet.command;
          cmdInput.innerHTML = this.renderHighlightedCommand(this.snippet.command);
          if (this.onEdit) {
            this.onEdit(this.index, 'command', this.snippet.command);
          }
          this.render(this.snippet, this.index, this.shadowRoot.querySelector('#snippet-checkbox')?.checked || false, this.onCheckChange, this.onEdit, this.onDelete, this.onCopy);
        });
      });

      // Make list button
      this.shadowRoot.querySelectorAll('[data-make-list]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const varIdx = parseInt(e.target.dataset.makeList);
          const varObj = this.variables[varIdx];
          varObj.isList = true;
          varObj.listValues = [varObj.value || '', ''];
          varObj.value = '';
          // Update command
          this.snippet.command = window.VarParser.updateCommand(this.snippet.command, this.variables);
          this.lastCommand = this.snippet.command;
          cmdInput.innerHTML = this.renderHighlightedCommand(this.snippet.command);
          if (this.onEdit) {
            this.onEdit(this.index, 'command', this.snippet.command);
          }
          this.render(this.snippet, this.index, this.shadowRoot.querySelector('#snippet-checkbox')?.checked || false, this.onCheckChange, this.onEdit, this.onDelete, this.onCopy);

          // Focus the second field (the empty one) after converting to list
          requestAnimationFrame(() => {
            const secondInput = this.shadowRoot.querySelector(`.variable-input[data-var-idx="${varIdx}"][data-val-idx="1"]`);
            if (secondInput) {
              secondInput.focus();
            }
          });
        });
      });
    }

    // Attach output section toggle
    const outputToggle = this.shadowRoot.getElementById('output-toggle');
    if (outputToggle) {
      outputToggle.addEventListener('click', () => {
        this.outputExpanded = !this.outputExpanded;
        this.render(this.snippet, this.index, this.shadowRoot.querySelector('#snippet-checkbox')?.checked || false, this.onCheckChange, this.onEdit, this.onDelete, this.onCopy);
      });
    }

    // Attach tag management listeners
    const showTagInputBtn = this.shadowRoot.getElementById('show-tag-input');
    const tagInput = this.shadowRoot.getElementById('tag-input');
    const addTagBtn = this.shadowRoot.getElementById('add-tag-btn');

    showTagInputBtn.addEventListener('click', () => {
      showTagInputBtn.style.display = 'none';
      tagInput.style.display = 'inline-block';
      addTagBtn.style.display = 'inline-block';
      tagInput.focus();
    });

    const addTag = () => {
      const tagValue = tagInput.value.trim();
      if (tagValue && !this.snippet.tag.includes(tagValue)) {
        this.snippet.tag.push(tagValue);
        if (this.onEdit) {
          this.onEdit(this.index, 'tag', this.snippet.tag);
          // The parent will re-render everything including this item, updating the tag dropdown
        }
      }
    };

    addTagBtn.addEventListener('click', addTag);
    tagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    });

    // Attach tag remove listeners
    this.shadowRoot.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tagIndex = parseInt(e.target.dataset.tagIndex);
        this.snippet.tag.splice(tagIndex, 1);
        if (this.onEdit) {
          this.onEdit(this.index, 'tag', this.snippet.tag);
          // The parent will re-render everything including this item, updating the tag dropdown
        }
      });
    });

    // Attach action button listeners
    this.shadowRoot.getElementById('test-btn').addEventListener('click', () => {
      this.showTestDialog();
    });

    this.shadowRoot.getElementById('copy-btn').addEventListener('click', () => {
      this.showCopyDialog();
    });

    this.shadowRoot.getElementById('delete-btn').addEventListener('click', () => {
      if (this.onDelete) {
        if (confirm('Delete this snippet?')) {
          this.onDelete(this.index);
        }
      }
    });
  }

  escapeAttr(text) {
    return String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render command with highlighted variables
   */
  renderHighlightedCommand(command) {
    if (!command) return '';

    const positions = window.VarParser.getVariablePositions(command);
    if (positions.length === 0) {
      return this.escapeHtml(command);
    }

    let result = '';
    let lastEnd = 0;

    positions.forEach(pos => {
      // Add text before variable
      if (pos.start > lastEnd) {
        result += this.escapeHtml(command.substring(lastEnd, pos.start));
      }

      // Add highlighted variable with data attribute for clicking
      result += `<span class="var-highlight" data-var-name="${this.escapeAttr(pos.name)}" style="background-color: ${pos.color}20; color: ${pos.color}; border: 1px solid ${pos.color}40;">${this.escapeHtml(pos.fullText)}</span>`;

      lastEnd = pos.end;
    });

    // Add remaining text
    if (lastEnd < command.length) {
      result += this.escapeHtml(command.substring(lastEnd));
    }

    return result;
  }

  /**
   * Attach click handlers to variable spans in command editor
   */
  attachVariableSpanHandlers() {
    const cmdInput = this.shadowRoot.getElementById('command-input');
    if (!cmdInput) return;

    const varSpans = cmdInput.querySelectorAll('.var-highlight');
    varSpans.forEach(span => {
      span.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const varName = span.dataset.varName;
        if (!varName) return;

        // Find the variable index
        const varIdx = this.variables.findIndex(v => v.name === varName);
        if (varIdx === -1) return;

        // Expand variables section if not already expanded
        if (!this.variablesExpanded) {
          this.variablesExpanded = true;
          // Re-render to show variables section
          this.render(this.snippet, this.index, this.shadowRoot.querySelector('#snippet-checkbox')?.checked || false, this.onCheckChange, this.onEdit, this.onDelete, this.onCopy);
        }

        // Focus on the first input of this variable
        requestAnimationFrame(() => {
          const varInput = this.shadowRoot.querySelector(`.variable-input[data-var-idx="${varIdx}"][data-val-idx="0"]`);
          if (varInput) {
            varInput.focus();
            varInput.select();

            // Scroll the variable into view
            varInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      });
    });
  }

  /**
   * Get cursor offset in contenteditable element (simple version using text content)
   */
  getCursorOffsetSimple(element) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  }

  /**
   * Set cursor offset in contenteditable element (simple version using text content)
   */
  setCursorOffsetSimple(element, offset) {
    const selection = window.getSelection();
    const range = document.createRange();

    let charCount = 0;
    let nodeStack = [element];
    let node;
    let foundStart = false;

    while (!foundStart && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.length;
        if (offset <= nextCharCount) {
          range.setStart(node, offset - charCount);
          range.collapse(true);
          foundStart = true;
        }
        charCount = nextCharCount;
      } else {
        // Push child nodes in reverse order to process them in correct order
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    if (foundStart) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Show test dialog to preview interpolated command
   */
  showTestDialog() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Create a copy of variables for testing
    const testVariables = this.variables.map(v => ({
      ...v,
      testValue: v.isList ? v.listValues[0] || '' : v.value || '',
      listValues: v.isList ? [...v.listValues] : []
    }));

    const updatePreview = () => {
      // Interpolate command with test values
      let interpolatedCommand = this.snippet.command || '';
      testVariables.forEach(varObj => {
        const regex = new RegExp(`<${varObj.name}(?:=[^>]*)?(?:=\\|[^>]*\\|)?>`, 'g');
        interpolatedCommand = interpolatedCommand.replace(regex, varObj.testValue);
      });

      const preview = overlay.querySelector('#test-preview');
      if (preview) {
        preview.textContent = interpolatedCommand;
      }
    };

    const renderDialog = () => {
      // Interpolate command with test values
      let interpolatedCommand = this.snippet.command || '';
      testVariables.forEach(varObj => {
        const regex = new RegExp(`<${varObj.name}(?:=[^>]*)?(?:=\\|[^>]*\\|)?>`, 'g');
        interpolatedCommand = interpolatedCommand.replace(regex, varObj.testValue);
      });

      overlay.innerHTML = `
        <div class="modal-dialog" style="max-width: 700px;">
          <div class="modal-header">Test Snippet</div>
          <div class="modal-body">
            ${testVariables.length === 0 ? `
              <div style="padding: 1rem; color: var(--text-secondary, #999); font-size: 13px; text-align: center;">
                No variables to configure. The command will be used as-is.
              </div>
            ` : `
              <div class="modal-field" style="margin-bottom: 1.5rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-primary, #333);">Configure Variables:</label>
                ${testVariables.map((varObj, idx) => `
                  <div style="margin-bottom: 1rem; padding: 0.75rem; background-color: var(--bg-zebra-even, #f9f9f9); border-radius: 4px; border-left: 3px solid ${varObj.color};">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: ${varObj.color}; margin-bottom: 0.5rem;">
                      &lt;${this.escapeHtml(varObj.name)}&gt;
                    </label>
                    ${varObj.isList ? `
                      <select class="test-var-input" data-var-idx="${idx}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-primary, #ddd); border-radius: 4px; font-size: 13px; font-family: 'Courier New', monospace; background-color: var(--bg-secondary, #fff); color: var(--text-primary, #333);">
                        ${varObj.listValues.filter(v => v).map(val => `
                          <option value="${this.escapeAttr(val)}" ${val === varObj.testValue ? 'selected' : ''}>${this.escapeHtml(val)}</option>
                        `).join('')}
                      </select>
                    ` : `
                      <input type="text" class="test-var-input" data-var-idx="${idx}" value="${this.escapeAttr(varObj.testValue)}" placeholder="Value" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-primary, #ddd); border-radius: 4px; font-size: 13px; font-family: 'Courier New', monospace; background-color: var(--bg-secondary, #fff); color: var(--text-primary, #333);">
                    `}
                  </div>
                `).join('')}
              </div>
            `}
            <div class="modal-field">
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary, #333);">Preview:</label>
              <pre id="test-preview" style="background-color: var(--bg-tertiary, #f5f5f5); padding: 1rem; border-radius: 4px; overflow-x: auto; margin: 0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.5; color: var(--text-primary, #333); border: 1px solid var(--border-primary, #ddd); white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(interpolatedCommand)}</pre>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn" id="test-close-btn">Close</button>
            <button class="btn btn-primary" id="test-copy-btn">Copy to Clipboard</button>
          </div>
        </div>
      `;

      // Attach input listeners
      overlay.querySelectorAll('.test-var-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const varIdx = parseInt(e.target.dataset.varIdx);
          testVariables[varIdx].testValue = e.target.value;
          updatePreview();
        });
        input.addEventListener('change', (e) => {
          const varIdx = parseInt(e.target.dataset.varIdx);
          testVariables[varIdx].testValue = e.target.value;
          updatePreview();
        });
      });

      // Handle close
      const closeBtn = overlay.querySelector('#test-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(overlay);
        });
      }

      // Handle copy
      const copyBtn = overlay.querySelector('#test-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const preview = overlay.querySelector('#test-preview');
          if (preview) {
            try {
              await navigator.clipboard.writeText(preview.textContent);
              // Visual feedback
              const originalText = copyBtn.textContent;
              copyBtn.textContent = 'Copied!';
              copyBtn.disabled = true;
              setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.disabled = false;
              }, 2000);
            } catch (err) {
              console.error('Failed to copy:', err);
              alert('Failed to copy to clipboard');
            }
          }
        });
      }

      // Handle click outside dialog to close
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
        }
      });
    };

    document.body.appendChild(overlay);
    renderDialog();

    // Focus on first input
    requestAnimationFrame(() => {
      const firstInput = overlay.querySelector('.test-var-input');
      if (firstInput) {
        firstInput.focus();
      }
    });
  }

  /**
   * Show copy dialog to select destination file
   */
  showCopyDialog() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const openFiles = window.getOpenFiles ? window.getOpenFiles() : [];

    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">Copy Snippet To</div>
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
          if (newFileIndex >= 0 && window.copySnippetToFile) {
            window.copySnippetToFile(this.snippet, newFileIndex);
          }
        }
      } else {
        // Copy to existing file
        const targetIndex = parseInt(value);
        if (!isNaN(targetIndex) && window.copySnippetToFile) {
          window.copySnippetToFile(this.snippet, targetIndex);
        }
      }

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

customElements.define('snippet-item', SnippetItem);

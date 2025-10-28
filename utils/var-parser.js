// Variable parser for pet snippet commands
window.VarParser = {
  // Color palette for variables (loaded from settings)
  colors: JSON.parse(localStorage.getItem('variable-colors') || 'null') || [
    '#e91e63',
    '#9c27b0',
    '#3f51b5',
    '#2196f3',
    '#009688',
    '#ff9800',
    '#f44336'
  ],

  // Track variable names to color index mapping (reset per parse)
  variableColorMap: new Map(),
  nextColorIndex: 0,

  // Initialize and listen for color changes
  init() {
    window.addEventListener('variable-colors-changed', (e) => {
      this.colors = e.detail.colors;
      // Clear color map when colors change
      this.variableColorMap.clear();
      this.nextColorIndex = 0;
    });
  },

  /**
   * Reset color assignment (call this when parsing a new command)
   */
  resetColorAssignment() {
    this.variableColorMap.clear();
    this.nextColorIndex = 0;
  },

  /**
   * Get color for a variable name (sequential assignment)
   */
  getColor(varName) {
    // Reload colors from localStorage each time to ensure we have latest
    this.colors = JSON.parse(localStorage.getItem('variable-colors') || 'null') || this.colors;

    if (this.variableColorMap.has(varName)) {
      return this.colors[this.variableColorMap.get(varName)];
    }

    // Assign next color in sequence
    const colorIndex = this.nextColorIndex % this.colors.length;
    this.variableColorMap.set(varName, colorIndex);
    this.nextColorIndex++;

    return this.colors[colorIndex];
  },

  /**
   * Extract all variables from a command string
   * Returns array of {name, value, isList, listValues, color}
   */
  parseVariables(command) {
    if (!command) return [];

    // Reset color assignment for this command
    this.resetColorAssignment();

    const varRegex = /<([^>]+)>/g;
    const matches = [];
    const uniqueVars = new Map();
    let match;

    while ((match = varRegex.exec(command)) !== null) {
      const fullMatch = match[1]; // Content between < >
      let varName = fullMatch;
      let value = '';
      let isList = false;
      let listValues = [];

      // Check for value assignment: <var=value>
      if (fullMatch.includes('=')) {
        const parts = fullMatch.split('=');
        varName = parts[0].trim();
        const valueContent = parts.slice(1).join('=');

        // Check for list format: <var=|_val1_||_val2_|>
        if (valueContent.startsWith('|_') && valueContent.endsWith('_|')) {
          isList = true;
          const listContent = valueContent.slice(2, -2); // Remove |_ and _|
          listValues = listContent.split('_||_').filter(v => v.length > 0);
        } else {
          value = valueContent;
        }
      }

      // Only store first occurrence of each variable name
      if (!uniqueVars.has(varName)) {
        uniqueVars.set(varName, {
          name: varName,
          value: value,
          isList: isList,
          listValues: listValues.length > 0 ? listValues : [''],
          color: this.getColor(varName)
        });
      }
    }

    return Array.from(uniqueVars.values());
  },

  /**
   * Format a variable for TOML command
   */
  formatVariable(varObj) {
    if (!varObj.name) return '';

    if (varObj.isList && varObj.listValues.length > 0) {
      // List format: <var=|_val1_||_val2_|>
      const filteredValues = varObj.listValues.filter(v => v.trim().length > 0);
      if (filteredValues.length === 0) {
        return `<${varObj.name}>`;
      }
      const listContent = filteredValues.join('_||_');
      return `<${varObj.name}=|_${listContent}_|>`;
    } else if (varObj.value && varObj.value.trim().length > 0) {
      // Single value format: <var=value>
      return `<${varObj.name}=${varObj.value}>`;
    } else {
      // Plain variable: <var>
      return `<${varObj.name}>`;
    }
  },

  /**
   * Update command string with new variable values
   * Only updates the first occurrence of each variable
   */
  updateCommand(command, variables) {
    if (!command || !variables) return command;

    let updatedCommand = command;
    const varRegex = /<([^>]+)>/g;
    const replacements = new Map();

    // Find first occurrence of each variable
    let match;
    while ((match = varRegex.exec(command)) !== null) {
      const fullMatch = match[0]; // Full <...> match
      const content = match[1];
      let varName = content;

      // Extract variable name from content
      if (content.includes('=')) {
        varName = content.split('=')[0].trim();
      }

      // Store first occurrence position for replacement
      if (!replacements.has(varName)) {
        replacements.set(varName, {
          original: fullMatch,
          index: match.index
        });
      }
    }

    // Apply replacements from end to start (to preserve indices)
    const sortedReplacements = Array.from(replacements.entries())
      .sort((a, b) => b[1].index - a[1].index);

    sortedReplacements.forEach(([varName, info]) => {
      const varObj = variables.find(v => v.name === varName);
      if (varObj) {
        const newFormat = this.formatVariable(varObj);
        updatedCommand = updatedCommand.substring(0, info.index) +
                        newFormat +
                        updatedCommand.substring(info.index + info.original.length);
      }
    });

    return updatedCommand;
  },

  /**
   * Get all variable occurrences in command with positions
   * Used for highlighting in UI
   */
  getVariablePositions(command) {
    if (!command) return [];

    const varRegex = /<([^>]+)>/g;
    const positions = [];
    let match;

    while ((match = varRegex.exec(command)) !== null) {
      const fullMatch = match[1];
      let varName = fullMatch;

      if (fullMatch.includes('=')) {
        varName = fullMatch.split('=')[0].trim();
      }

      positions.push({
        name: varName,
        start: match.index,
        end: match.index + match[0].length,
        fullText: match[0],
        color: this.getColor(varName)
      });
    }

    return positions;
  }
};

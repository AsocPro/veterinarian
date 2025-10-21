// Variable parser for pet snippet commands
window.VarParser = {
  // Color palette for variables
  colors: [
    '#a0c0ff', // Light blue
    '#80a0ff', // Medium blue
    '#ffa0a0', // Light red
    '#ffc080', // Light orange
    '#a0ffa0', // Light green
    '#c0a0ff', // Light purple
    '#ffa0ff', // Light magenta
    '#a0ffff', // Light cyan
    '#ffe0a0', // Light yellow
    '#d0d0d0'  // Light gray
  ],

  /**
   * Hash a string to get a consistent color index
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % this.colors.length;
  },

  /**
   * Get color for a variable name
   */
  getColor(varName) {
    const index = this.hashString(varName);
    return this.colors[index];
  },

  /**
   * Extract all variables from a command string
   * Returns array of {name, value, isList, listValues, color}
   */
  parseVariables(command) {
    if (!command) return [];

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

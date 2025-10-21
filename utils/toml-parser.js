// TOML Parser utility using @ltd/j-toml
window.TomlParser = {
  /**
   * Parse TOML string into JavaScript object
   * @param {string} tomlString - The TOML content to parse
   * @returns {Object} Parsed TOML as JS object with snippets array
   */
  parse(tomlString) {
    if (!window.TOML) {
      throw new Error('TOML library not loaded');
    }

    try {
      const parsed = TOML.parse(tomlString);

      // Handle both "snippets" and "Snippets" (case-insensitive)
      let snippetsArray = parsed.snippets || parsed.Snippets || [];

      // Normalize each snippet to ensure all expected fields exist
      // Handle both lowercase and capitalized field names
      snippetsArray = snippetsArray.map(snippet => ({
        description: snippet.description || snippet.Description || '',
        command: snippet.command || snippet.Command || '',
        tag: snippet.tag || snippet.Tag || [],
        output: snippet.output || snippet.Output || ''
      }));

      return { snippets: snippetsArray };
    } catch (err) {
      throw new Error(`TOML parsing error: ${err.message}`);
    }
  },

  /**
   * Stringify JavaScript object back to TOML format
   * @param {Object} obj - The object to stringify (should have snippets array)
   * @returns {string} TOML formatted string
   */
  stringify(obj) {
    if (!window.TOML) {
      throw new Error('TOML library not loaded');
    }

    try {
      // Use TOML.stringify if available, otherwise manual construction
      if (TOML.stringify) {
        return TOML.stringify(obj);
      }

      // Manual TOML construction for pet snippet format
      let toml = '';

      if (obj.snippets && Array.isArray(obj.snippets)) {
        obj.snippets.forEach(snippet => {
          toml += '[[snippets]]\n';

          if (snippet.description) {
            toml += `  description = ${JSON.stringify(snippet.description)}\n`;
          }

          if (snippet.command) {
            toml += `  command = ${JSON.stringify(snippet.command)}\n`;
          }

          if (snippet.tag && Array.isArray(snippet.tag) && snippet.tag.length > 0) {
            toml += `  tag = [${snippet.tag.map(t => JSON.stringify(t)).join(', ')}]\n`;
          }

          if (snippet.output) {
            toml += `  output = ${JSON.stringify(snippet.output)}\n`;
          }

          toml += '\n';
        });
      }

      return toml;
    } catch (err) {
      throw new Error(`TOML stringify error: ${err.message}`);
    }
  }
};

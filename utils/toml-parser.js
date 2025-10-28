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
      let toml = '';

      if (obj.snippets && Array.isArray(obj.snippets)) {
        obj.snippets.forEach((snippet, index) => {
          toml += '[[Snippets]]\n';

          // Description field (capitalized, always output)
          toml += `  Description = ${JSON.stringify(snippet.description || '')}\n`;

          // Output field (capitalized, always output)
          toml += `  Output = ${JSON.stringify(snippet.output || '')}\n`;

          // Tag field (capitalized, always output as array)
          const tags = snippet.tag && Array.isArray(snippet.tag) ? snippet.tag : [];
          toml += `  Tag = [${tags.map(t => JSON.stringify(t)).join(', ')}]\n`;

          // command field (lowercase, always output)
          toml += `  command = ${JSON.stringify(snippet.command || '')}\n`;

          // Add blank line between snippets (but not after the last one)
          if (index < obj.snippets.length - 1) {
            toml += '\n';
          }
        });
      }

      return toml;
    } catch (err) {
      throw new Error(`TOML stringify error: ${err.message}`);
    }
  }
};

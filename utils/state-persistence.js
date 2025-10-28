// State Persistence Utility
// Handles saving and loading application state to/from localStorage
// Files are stored as JSON in localStorage, but imported/exported as TOML

(function() {
  'use strict';

  const STORAGE_KEY = 'petSnippetEditorState';

  /**
   * Serialize and save application state to localStorage
   * Store the parsed snippets directly as JSON for reliable persistence
   * @param {Object} appState - The application state object
   * @param {Array} appState.openFiles - Array of open file objects
   * @param {number} appState.selectedFileIndex - Index of selected file
   */
  function saveState(appState) {
    try {
      // Store snippets as JSON, not TOML content
      const serializableState = {
        openFiles: appState.openFiles.map(file => ({
          name: file.name,
          snippets: file.parsed?.snippets || [],
          dirty: file.dirty || false
        })),
        selectedFileIndex: appState.selectedFileIndex
      };

      const jsonString = JSON.stringify(serializableState);
      localStorage.setItem(STORAGE_KEY, jsonString);
    } catch (err) {
      console.warn('Failed to save state to localStorage:', err);
      // Don't throw - failing to save shouldn't break the app
    }
  }

  /**
   * Load application state from localStorage
   * Reconstruct file objects with parsed snippets from JSON
   * @returns {Object|null} Restored appState object or null if no saved state
   */
  function loadState() {
    try {
      const jsonString = localStorage.getItem(STORAGE_KEY);
      if (!jsonString) {
        return null; // No saved state
      }

      const savedState = JSON.parse(jsonString);

      // Validate structure
      if (!savedState.openFiles || !Array.isArray(savedState.openFiles)) {
        console.warn('Invalid saved state structure, ignoring');
        return null;
      }

      // Restore files with parsed snippets from localStorage
      const restoredFiles = savedState.openFiles.map(file => {
        const snippets = file.snippets || [];

        const fileObj = {
          name: file.name,
          content: null, // Will be regenerated on export
          dirty: file.dirty || false,
          parsed: { snippets: snippets }
        };

        return fileObj;
      });

      return {
        openFiles: restoredFiles,
        selectedFileIndex: savedState.selectedFileIndex
      };
    } catch (err) {
      console.warn('Failed to load state from localStorage:', err);
      return null; // Fallback to empty state
    }
  }

  /**
   * Clear saved state from localStorage
   * Useful for debugging or user-requested reset
   */
  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('State cleared from localStorage');
    } catch (err) {
      console.warn('Failed to clear state from localStorage:', err);
    }
  }

  // Expose functions to window
  window.StatePersistence = {
    saveState,
    loadState,
    clearState
  };
})();

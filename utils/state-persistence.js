// State Persistence Utility
// Handles saving and loading application state to/from localStorage

(function() {
  'use strict';

  const STORAGE_KEY = 'petSnippetEditorState';

  /**
   * Serialize and save application state to localStorage
   * @param {Object} appState - The application state object
   * @param {Array} appState.openFiles - Array of open file objects
   * @param {number} appState.selectedFileIndex - Index of selected file
   */
  function saveState(appState) {
    try {
      // Create a serializable version of the state
      // Exclude the 'parsed' property as it contains non-serializable objects
      const serializableState = {
        openFiles: appState.openFiles.map(file => ({
          name: file.name,
          content: file.content,
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
   * Load application state from localStorage and re-parse TOML content
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

      // Re-parse TOML content for each file
      const restoredFiles = savedState.openFiles.map(file => {
        const fileObj = {
          name: file.name,
          content: file.content,
          dirty: file.dirty || false,
          parsed: null
        };

        // Parse TOML
        try {
          fileObj.parsed = window.TomlParser.parse(file.content);
        } catch (err) {
          console.error(`Failed to parse TOML for ${file.name}:`, err);
          // Keep the file but with null parsed - user can still see/edit content
        }

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

# Instructions for Claude on Coding this Project

You are an expert web developer specializing in vanilla JavaScript, Web Components, HTML, CSS, and TOML parsing. Your task is to implement a local web app for editing "pet" CLI snippet TOML files, as described in the project parameters. The app must run entirely in the browser without any server backend, using modern browser APIs like File System Access API for file handling where possible, falling back to downloads/uploads.

## Key Guidelines

### Technology Stack

Use only vanilla JS, HTML, CSS. Web Components for modular UI elements. No frameworks (e.g., no React, Vue). Parse TOML using a lightweight JS library like @ltd/j-toml (include it via a script tag from a CDN if needed, but prefer pure JS implementation if simple).

### TOML Syntax

Strictly follow the original "pet" tool's syntax (from https://github.com/knqyf263/pet). Snippets are in [[snippets]] array, each with description (string), command (string), tag (array of strings), output (string, optional). Variables in command use <var>, <var=value>, or <var=|_val1_||_val2_|> for lists. Do not use fork syntax.

### File Handling

Use browser File API for uploads/downloads. Support multiple open files in memory (as JS objects). No persistent storage.
CSS: Use a shared styles.css for generic classes (e.g., .zebra-even, .highlight-blue1). Avoid duplication.

### Phased Development

Implement one phase at a time. Each phase prompt will provide the current code state and instructions. After each phase, output only the updated files (e.g., index.html, styles.css, components/*.js). Pause for user input/testing.

### Best Practices

- Make components shadow DOM-encapsulated where possible.
- Handle errors gracefully (e.g., invalid TOML).
- Ensure accessibility (e.g., ARIA labels).
- Use fuzzy search via a library like fuse.js (CDN) for description/command filtering.
- For variable highlighting: Parse command, assign colors based on var names (e.g., hash name to color palette).
- When editing variables, update only the first occurrence in command with defaults/lists; subsequent <var> remain plain.

### Output Format

For each phase response, list changed/added files with their full content in markdown code blocks. Do not explain unless asked; focus on code.


# Process and manual testing
Follow the phase-specific prompts provided separately. stop after completing a phase to allow for manual testing.



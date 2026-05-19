# .vscode/GEMINI.md

This file provides specific instructions and context for working with this project in Visual Studio Code.

## Purpose

-   To document recommended VS Code extensions.
-   To explain custom workspace settings defined in `settings.json`.
-   To provide guidance on debugging configurations or task runners.

## Current Setup

### Recommended Extensions

This project does not currently enforce any specific VS Code extensions. However, the following are generally useful for Google Apps Script development:

-   **Google Apps Script (clasp) extension**: Provides integration with `clasp` directly from VS Code.
-   **ESLint**: For JavaScript/TypeScript linting.
-   **Prettier**: For code formatting.

### Workspace Settings (`settings.json`)

The `.vscode/settings.json` file contains workspace-specific settings that override user settings. This might include:

-   File associations.
-   Formatter settings.
-   Linter configurations.
-   Exclusions for files or folders.

**Current settings:**

```json
{
    "files.exclude": {
        "**/.clasp.json": true
    }
}
```

This setting excludes the `.clasp.json` file from the VS Code explorer to keep the workspace cleaner, as it often contains sensitive script IDs that are managed by `clasp` directly.

## How to Contribute

-   If you add new extensions that are crucial for development, please list them here.
-   If you modify `settings.json` with project-specific configurations, document their purpose and impact here.

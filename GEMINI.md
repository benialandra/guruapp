# Project GEMINI.md

This file serves as the main entry point for Gemini-specific instructions and context for this project.

## How to Use This File

-   **General Guidelines:** Add any overarching guidelines, architectural decisions, or important notes that apply to the entire project.
-   **Sub-directory GEMINI.md files:** If a sub-directory has specific instructions, create a `GEMINI.md` file within that directory and link to it from here.
-   **Key Information:** Include links to important documentation, setup procedures, or common development workflows.

## Current Sections

-   [Instructions for the Clasp Project](#instructions-for-the-clasp-project)

---

## Instructions for the Clasp Project

This project uses Google Apps Script (GAS) and `clasp` for development.

### Setup

1.  Ensure `clasp` is installed globally: `npm i @google/clasp -g`
2.  Log in to `clasp`: `clasp login`
3.  Clone the project: `clasp clone <Script ID>` (if starting from an existing GAS project)
4.  Push changes: `clasp push`
5.  Pull changes: `clasp pull`

### Development Workflow

-   Code changes are primarily made in `Code.js`, `Index.html`, and `appsscript.json`.
-   Use `clasp push` to deploy changes to the Google Apps Script project.
-   Testing can be done directly in the Google Apps Script editor or by deploying web apps/add-ons.

### Project Structure

-   `Code.js`: Contains server-side Google Apps Script functions.
-   `Index.html`: Contains the HTML for any web app or sidebar UI.
-   `appsscript.json`: Project manifest file, defining scopes, time zone, and web app settings.

---

Remember to keep this file updated as the project evolves!

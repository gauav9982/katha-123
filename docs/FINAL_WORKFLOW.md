# Project Setup & Final Workflow

This document outlines the final, correct development and deployment workflow for the Katha Sales application.

## ✅ Project Setup (Completed)

-   [x] **Step 1: Local Development Setup**
    -   [x] Installed all necessary dependencies (`npm install`).
    -   [x] Configured backend to run on port `4000`.
    -   [x] Configured frontend to connect to the correct local backend port.
    -   [x] Created `npm start` command to run both frontend and backend concurrently.

-   [x] **Step 2: Live Server Setup**
    -   [x] Deployed the application code to `/var/www/katha-sales`.
    -   [x] Installed server-side dependencies.
    -   [x] Configured Nginx to serve the frontend from the `/dist` directory and proxy API requests.
    -   [x] Fixed all MIME type and 403 Forbidden errors.
    -   [x] Set up PM2 to manage the backend process (`katha-sales-backend`).

-   [x] **Step 3: Automated Deployment**
    -   [x] Created a GitHub Actions workflow (`.github/workflows/deploy.yml`).
    -   [x] Configured secrets (`SSH_PRIVATE_KEY`, `SERVER_HOST`, etc.) for secure SSH access.
    -   [x] The workflow now automatically deploys any push to the `main` branch.

-   [x] **Step 4: Database Backup**
    -   [x] Took a backup of the live database and saved it as `kathasales_live_backup.db`.

-   [x] **Step 5: UI/UX Fixes**
    -   [x] Re-enabled the connection status dot on the live server as requested.

## 🚀 Final Day-to-Day Workflow

### 1. Local Development
-   **Purpose:** To build and test new features safely on your local machine.
-   **Command:**
    ```bash
    npm start
    ```

### 2. Live Deployment
-   **Purpose:** To push your new, tested features to the live server (`kathasales.com`).
-   **Commands:**
    1.  `git add .`
    2.  `git commit -m "Your descriptive message"`
    3.  `git push origin main`

The project is now stable and follows standard development and deployment practices. 
# Project Setup & Deployment Checklist

This document tracks the initial setup process and outlines the final, correct development and deployment workflow.

## ✅ Initial Setup (Completed)

- [x] Step 1: Configure frontend to dynamically switch between local and live database URLs.
- [x] Step 2: Configure backend CORS to allow requests from the local development server.
- [x] Step 3: Create `package.json` scripts (`start`, `start:live`, `dev:local`, `dev:live`) for easy mode switching.
- [x] Step 4: Fix backend CJS/ESM module conflicts by renaming `.js` files to `.cjs`.
- [x] Step 5: Fix frontend UI issues by moving Tailwind CSS configs and installing `daisyui`.
- [x] Step 6: Fix live connection issues by configuring the backend to listen on `0.0.0.0` and correcting port mismatches between Nginx and PM2.
- [x] Step 7: Fix the automated deployment by updating the GitHub Actions workflow (`.github/workflows/deploy.yml`) to include `ecosystem.config.cjs` and use it for PM2.

## 🚀 Final Workflow

The setup is complete. Here is the simple, day-to-day workflow for development and deployment.

### Development
There are two ways to run the app during development.

1.  **For Fully Local Development:**
    *   This uses your local backend and local database.
    *   **Command:** `npm run start`

2.  **To Connect Local Frontend to Live Database:**
    *   This is for testing with real, live data.
    *   **Command:** `npm run start:live`

### Deployment (Pushing Changes to Live Server)
Deployment is fully automated. You just need to push your code to GitHub.

1.  **Add your changes:**
    ```bash
    git add .
    ```

2.  **Commit your changes with a message:**
    ```bash
    git commit -m "Your clear message about what you changed"
    ```

3.  **Push to the main branch:**
    ```bash
    git push
    ```

After pushing, GitHub Actions will automatically deploy your changes to the live server. You can monitor the progress in the **Actions** tab of your repository.

# Katha Sales Deployment Checklist

## Local Development Setup
- [x] 1. Check if all dependencies are installed ✅
- [x] 2. Test local database connection ✅
- [x] 3. Start local development server ✅
- [ ] 4. Verify local application works

## Server Deployment
- [ ] 5. Build production version
- [ ] 6. Deploy to server
- [ ] 7. Verify server deployment
- [ ] 8. Test live website

## Option A: Dynamic Database Configuration (IN PROGRESS)
- [x] A1. Fix hardcoded URLs in utils/itemLookup.ts ✅
- [x] A2. Fix hardcoded URLs in components/ItemQuickSearch.tsx ✅
- [x] A3. Fix hardcoded URLs in forms/Item/ItemForm.tsx ✅
- [x] A4. Fix hardcoded URLs in forms/Purchase/PurchaseForm.tsx ✅
- [x] A5. Fix hardcoded URLs in forms/CashSale/CashSaleForm.tsx ✅
- [x] A6. Fix hardcoded URLs in forms/CreditSale/CreditSaleForm.tsx ✅
- [x] A7. Fix hardcoded URLs in forms/DeliveryChalan/DeliveryChalanForm.tsx ✅
- [x] A8. Fix hardcoded URLs in forms/Payment/PaymentForm.tsx ✅
- [x] A9. Fix hardcoded URLs in forms/Group/GroupForm.tsx ✅
- [x] A10. Fix hardcoded URLs in forms/Category/CategoryForm.tsx ✅
- [x] A11. Fix hardcoded URLs in reports/StockReport.tsx ✅
- [x] A12. Fix hardcoded URLs in all List components ✅
- [x] A13. Test local mode (VITE_USE_LOCAL_DB=true) ✅
- [ ] A14. Test live mode (VITE_USE_LOCAL_DB=false)
- [ ] A15. Verify both modes work perfectly

## Status: Local Mode Test Successful!

### Notes:
- Each step will be checked off as completed
- Any errors will be documented here
- Commands will be provided step by step

### Step 1 Results:
- ✅ Dependencies installed successfully
- 📦 1 package added, 1 package changed
- 🔍 569 packages audited
- ⚠️ 2 moderate severity vulnerabilities (not critical for now)
- ⏱️ Installation time: 3 minutes

### Step 2 Results:
- ✅ Local database connection successful
- ✓ Table tbl_items exists (1146 records)
- ✓ Table tbl_purchases exists (15 records)
- ✓ Table tbl_purchase_items exists (316 records)
- ✗ Table tbl_sale_items does not exist
- ✗ Table tbl_customers does not exist
- ✗ Table tbl_sales does not exist
- (Connection and reading data is working fine)

### Step 3 Results:
- ✅ Local development server started
- 🌐 Application running on http://localhost:3001
- 🟢 Green dot showing (local database mode)
- ⚠️ API calls still going to live server (hardcoded URLs issue)
- 🔧 Need to fix hardcoded URLs for proper local mode

### Option A Progress:
- ✅ All hardcoded URLs replaced with dynamic config
- ✅ All components now use API_URL from config
- ✅ Local and live database switching ready
- ✅ Local Mode (VITE_USE_LOCAL_DB=true) is working perfectly on http://localhost:3001.
- 🔄 Ready to test Live Mode.

### Option A Goal:
- 🔄 Dynamic switching between local and live databases
- 🚀 Fast local development
- 🌍 Live website unaffected
- 🔮 Future-proof configuration

- [x] Step 4: Deploy the final backend and frontend configurations.
- [x] Step 5: Test Live Mode (`npm run start:live`) and confirm connection (Green Dot).
- [x] Step 6: Final check of both `npm run start` (Local Mode) and `npm run start:live` (Live Mode).

**Conclusion:** The setup is complete. You can now seamlessly switch between a fully local development environment and a local frontend connected to the live database. 
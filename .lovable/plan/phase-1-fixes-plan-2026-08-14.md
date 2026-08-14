# Phase 1 Fixes Plan

## Overview
Address critical issues from the security audit: Vite build failure, hardcoded Flask secret key, and authentication race condition.

## User Review Required
> [!IMPORTANT]
> - Ensure `FLASK_SECRET_KEY` is set in the production environment for session security.

## Proposed Changes

### 1. Build & Authentication Foundation
- Update all HTML files (`frontend/*.html`) to load `js/auth-check.js` as a module (`type="module"`).
- Refactor `js/auth-check.js` to export a `checkAuth()` function that returns a Promise.
- This resolves the Vite build error and allows pages to wait for auth verification.

### 2. Authentication Race Condition Fix
- Modify all page-specific JS files (`frontend/js/*.js`) to wait for `checkAuth()` before executing their data-loading logic.
- Update `auth-check.js` to handle redirection and UI population synchronously with the auth status.

### 3. Flask Secret Key Hardening
- Modify `backend/app.py` to raise a `RuntimeError` if `FLASK_SECRET_KEY` is not provided in a non-development environment.
- Remove the hardcoded fallback `dev-secret-key-123` for production safety.

### 4. Regression & Audit
- Run `npm run build` to verify exit status 0.
- Verify authentication flow (Login -> Session -> Protected Access -> Logout).
- Ensure existing modules (Dashboard, Students, Marks, etc.) remain functional.

## Technical Details

### Auth Flow Sequence
```text
Page Load
  ↓
Import checkAuth from js/auth-check.js
  ↓
await checkAuth()
  ↓
  ├── Unauthenticated: Redirect to login.html
  └── Authenticated: 
        1. Populate Sidebar User Info
        2. Run Page Init Logic (fetch data, render UI)
```

### Files to Modify
- `backend/app.py`: Harden secret key logic.
- `frontend/*.html`: Add `type="module"` to script tags.
- `frontend/js/auth-check.js`: Convert to module and export `checkAuth`.
- `frontend/js/*.js`: Update to import and await `checkAuth`.

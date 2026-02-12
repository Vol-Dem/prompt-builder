# AIDE-TOOLS

[AIDE-TOOLS](https://aide-tools.com/) is a web application for discovering, organizing, and managing AI models and generated images with variety of tools that simplify the prompt building process.

It combines a modern React frontend with Firebase (Firestore + Cloud Functions) to provide a fast, multi-tab, cost-aware, and highly scalable experience for working with large AI model libraries and image collections.

[aide-tools.com](https://aide-tools.com/)

The system is designed around three core ideas:

- Shared model data (downloaded from Civitai and kept consistent for all users)
- Personalized user workspaces (categories, collections, saved images, presets)
- Strong cost and reliability controls on the backend

https://github.com/user-attachments/assets/e49e211d-b6b3-4f36-834e-869662912060

## What the app does

AIDE-TOOLS lets users:

- Use a powerful prompt editor with presets and tag-based editing
- Browse and import AI models from Civitai
- View model versions and preview images
- Organize models into personal categories and tag sets
- Save generated images into collections
- Manage large image libraries with fast, infinite-scroll carousels
- Work across multiple browser tabs with live synchronization
- Resume work after reloads thanks to session persistence
- The app is optimized for people who work with hundreds or thousands of images and models and need fast, structured workflows.

## High-level architecture

```
Frontend (React + Redux)
        |
        v
Firebase APIs (Firestore, Auth, App Check)
        |
        v
Cloud Functions (Civitai sync, billing protection, data validation)
```

1. Frontend
   - Built with React
   - State managed with Redux Toolkit
   - Uses lazy loading, Suspense, and viewport-based rendering
   - All heavy image and video content is loaded only when needed

2. Firestore

- Firestore is used for:
  - Shared model data
  - User-specific data (categories, collections, saved images, UI state)
  - Application-level configuration (maintenance mode, notifications)

- The data is structured so that:
  - Shared data is read-only for users
  - User data is isolated and synchronized across tabs
  - Expensive data (like images) is stored in a way that minimizes reads

3. Cloud Functions

- Cloud Functions are responsible for:
  - Importing and updating models from Civitai
  - Fetching and storing preview images
  - Enforcing security and validation
  - Protecting the project from unexpected billing spikes

## Multi-tab & session-safe design

AIDE-TOOLS is designed for people who open multiple browser tabs while working.

To make this safe and predictable:

- A live Firestore listener is attached to the user’s main document
- Changes to categories, collections, or presets instantly propagate to all tabs
- Prompt state and UI state are stored in the session so work is not lost on reload and you can work with different prompt in each tab.

This allows workflows like:

`Create a category or collection in one tab → immediately use them to save images in another tab → continue browsing without refreshing.`

## Cost-aware backend

AI image workflows can generate large amounts of data and API traffic.
To prevent accidental or malicious cost explosions, the backend includes a billing protection system.

How it works

- Google Cloud Billing publishes usage events to a Pub/Sub topic
- A Cloud Function listens to those events
- When the budget reaches 100%:
  - Billing is automatically disabled
  - The app is put into maintenance mode
  - A Discord alert is sent to the developer

This guarantees that:

- The project cannot silently run up large bills
- The app shuts itself down safely if something goes wrong
- Alerts are received in real-time instead of by slow email

## Why Firestore is structured this way

The database is organized into three main areas:

- Application data – global configuration (maintenance, notifications)
- Models – shared data imported from Civitai
- Users – everything personal to a user (collections, saved images, tags, UI state)

This separation allows:

- Shared data to be cached and reused by all users
- User data to be synced live across tabs
- Security rules to be simple and safe

It also allows the app to load only what is needed:

- A model page loads the model + one active version’s preview images

## Performance strategy

The frontend is heavily optimized for large media libraries:

- Images and videos are lazy-loaded
- Only visible carousel items are mounted
- Videos start playing only when they enter the viewport
- Heavy UI sections are loaded with React.lazy + Suspense
- App Check is started after login to reduce initial load time

This allows the UI to remain smooth even when browsing thousands of images.

## Tech stack

Frontend

- React
- Redux Toolkit
- React Router
- Headless UI
- Vite

Backend

- Firebase Auth
- Firestore
- Cloud Functions
- Google Cloud Billing API
- Pub/Sub

External

- Civitai API
- Discord Webhooks

## Status

AIDE-TOOLS is actively evolving.

Core systems (models, collections, multi-tab sync, billing protection) are in place, with new features and refinements being added as the platform grows.

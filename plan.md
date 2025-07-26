# Curry Hub Spotify Clone – Implementation Plan

---

## GLOBAL/APP

- Ensure global state (Zustand) is set up and connected to library/search/auth UI where required.
- Integrate backend/local filesystem or API for actual media/library data loading (instead of mocks).

---

## NAVIGATION / LAYOUT / SIDEBAR

- Ensure sidebar links route correctly to Index, Library, Profile, Search, and Settings.
- Sidebar active state must visually update based on current page.
- Add support for highlighting/expanding sections (e.g. playlists, artists) if planned.

---

## INDEX / HOME PAGE

- All play buttons (tracks/playlists) must start playback using a correct audio engine hooked to actual media files.
- Recently Played, Smart Playlists, Top Artists, Newly Added, and Top Tracks sections need to reflect real user/library history and be clickable/navigable.
- Add fallback UI messaging for empty states (no tracks/artists/etc).
- Playlist and artist images/thumbnails should be dynamically loaded from real data or generated as intended.
- Track cards with onClick should enqueue/play the correct track.

---

## LIBRARY PAGE

- Implement folder selection via FolderSelector buttons (should open a native system filepicker, index and scan actual folders).
- “Scan Library” button logic: connect to backend/process for folder/media ingest and update UI accordingly.
- Each card (track/playlist/folder) must navigate to detail views or trigger playing as designed.
- Add proper error and loading states for scanning/library operations.
- Ensure newly added, playlists, and folders sections are tied to real media storage/management.

---

## SEARCH PAGE

- Search input should interface with real search logic (local or remote) for indexed music.
- Implement autocomplete dropdown when typing in search.
- Search result list should link/queue/play actual tracks, not mocks.
- “Recent Searches” should persist (possibly to local storage or user profile).
- Browse categories should reflect actual tag/genre data, and be interactive.
- Search buttons (e.g., clear, search) must work correctly.

---

## PROFILE PAGE

- User statistics, top artists/tracks, activity, achievements—all require real data aggregation/storage.
- “Reset Stats” and similar profile actions must persist and update UI as intended.
- Play/queue buttons in tabs should operate correctly.
- Settings relevant to user account must sync to storage or API.

---

## SETTINGS PAGE

- All settings (bitrate, device, equalizer, themes, language, advanced) must read from and write to real state/backend/storage.
- Sliders, switches, selects must update and reflect persisted settings.
- Integration with FolderSelector must trigger file picker and update media source.
- Export/Import settings: enable file serialization and parsing for settings transfer.
- Equalizer presets and band sliders must modify actual audio output.
- Saving, resetting to defaults, browsing library path—each action needs implementation, not just UI.
- Show meaningful validation/error feedback for bad values.

---

## NOTIFICATION TOASTS

- Connect notification triggers to all major events (playback, error, scan complete, settings save).
- Dismiss/toast logic must work as intended and not be placeholder only.

---

## GENERAL/UNDER-THE-HOOD

- Ensure all async handlers (play, scan, save, search) show appropriate loading and error states.
- Validate all states are connected to Zustand/global state where designed.
- Replace static data/mocks with live data where possible.
- Consider mobile responsiveness for all layouts/components.
- Ensure keyboard navigation/accessibility is fully implemented.
- Implement all TODO-marked or stubbed logic found in code comments.
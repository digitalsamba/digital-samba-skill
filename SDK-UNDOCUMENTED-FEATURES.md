# SDK Undocumented Features

**Purpose**: Features found in the TypeScript definitions (`@digitalsamba/embedded-sdk@0.0.52`) that are not covered in the official documentation at docs.digitalsamba.com.

**Source**: `https://unpkg.com/@digitalsamba/embedded-sdk@0.0.52/dist/types/index.d.ts`

---

## High-Value Undocumented Features

### 1. Custom Tiles
Add custom iframe-based tiles to the video call UI.

```typescript
addCustomTile(options: AddCustomTileOptions): void
removeCustomTile(name: string): void
sendMessageToCustomTile(options: SendMessageToCustomTileOptions): void
```

**Use case**: Embed polls, chat panels, product catalogs, or any custom UI alongside video.

**Questions**:
- What is the `AddCustomTileOptions` interface?
- How does messaging between main app and custom tile work?
- Are there size/position constraints?

---

### 2. Tile Actions
Add custom buttons to user video tiles.

```typescript
addTileAction(name: string, properties: TileActionProperties, listener: AnyFn): void
removeTileAction(name: string): void
```

**Use case**: "Send tip", "View profile", "Private message" buttons on each participant.

**Questions**:
- What is the `TileActionProperties` interface?
- Can actions have icons? Tooltips?
- Which roles can see/use tile actions?

---

### 3. UI Callbacks
Hook into UI interactions programmatically.

```typescript
addUICallback(name: UICallbackName, listener: (...args: any[]) => void): void
removeUICallback(name: UICallbackName, listener: AnyFn): void
```

**Use case**: React to button clicks, menu selections, or other UI events without DOM manipulation.

**Questions**:
- What are the valid `UICallbackName` values?
- What arguments are passed to the listener?

---

### 4. Frame Event Listeners
Listen to events on the iframe's document or window.

```typescript
addFrameEventListener(eventName: string, target: 'document'|'window', listener: (...args: any[]) => void): void
removeFrameEventListener(eventName: string, target: 'document'|'window', listener: (...args: any[]) => void): void
```

**Use case**: Detect focus/blur, keyboard shortcuts, visibility changes within the iframe.

**Questions**:
- Which DOM events are supported?
- Are there security restrictions?

---

### 5. Runtime Branding
Change branding without reloading the frame.

```typescript
changeBrandingOptions(brandingOptionsConfig: Partial<BrandingOptionsConfig>): void
```

**Use case**: Theme switching, white-label customization per customer.

**Questions**:
- What is the `BrandingOptionsConfig` interface?
- Which branding elements can be changed at runtime?

---

### 6. Mobile Screenshare
Mobile-specific screenshare methods.

```typescript
startMobileScreenshare(data: MobileScreenshareOptions): void
stopMobileScreenshare(data: MobileScreenshareOptions): void
```

**Questions**:
- What is `MobileScreenshareOptions`?
- How does this differ from regular `startScreenshare()`?
- Which mobile platforms are supported?

---

### 7. Whiteboard Image Injection

```typescript
addImageToWhiteboard(options: AddImageToWhiteboardOptions): void
```

**Use case**: Pre-load diagrams, import screenshots, add reference images programmatically.

**Questions**:
- What is `AddImageToWhiteboardOptions`?
- Supported image formats/sizes?
- Can position be specified?

---

## Minor Undocumented Methods

| Method | Description |
|--------|-------------|
| `getUser(userId)` | Get single user (only `listUsers()` is documented) |
| `changeToolbarPosition(side)` | Move toolbar: 'left', 'right', 'bottom' |
| `changeLayoutMode(mode)` | Switch layout programmatically |
| `minimizeContent()` | Minimize pinned/maximized content |
| `muteFrame()` / `unmuteFrame()` | Mute all iframe audio output |

---

## Request

Could these features be documented? They would significantly help developers building advanced integrations. Even brief descriptions of the TypeScript interfaces would be valuable.

The Claude Code skill we're building would benefit from including these features to help developers discover and use the full SDK capability.

---

*Generated: 2024-12-06*
*SDK Version: 0.0.52*

# AI Coding Guidelines for AGKeywords Plus Extension

## Project Overview
AGKeywords Plus is a Chrome extension (Manifest V3) that automates title and keyword generation for Adobe Stock contributor uploads using Google Gemini AI. The extension injects UI controls and processes images to generate SEO-optimized content.

## Architecture
- **Background Script** (`background.js`): Handles extension icon clicks, redirects to Adobe Stock uploads page
- **Content Script** (`content.js`): 4376-line script that injects UI and handles AI processing
- **Build System**: Webpack + Babel for bundling ES6+ code to `dist/` directory
- **Dependencies**: Google Gemini AI SDK, Sortable.js library

## Critical Development Patterns

### 1. DOM Manipulation & UI Injection
**Pattern**: Heavy use of `document.createElement()` and `document.querySelector()` for dynamic UI creation
```javascript
// Always use specific Adobe Stock selectors
const inputElement = document.querySelector("._spectrum-Textfield-input_61339");
const titleInput = document.querySelector(".input--full.title-input");
```

**Key Elements**:
- Popup overlays for AI processing status
- Dynamic button injection (Auto, Generate, Settings)
- Settings panels with checkboxes and inputs
- Loading spinners and status messages

### 2. AI Integration & API Management
**Pattern**: Multiple Gemini API key rotation with fallback models
```javascript
// API key rotation pattern
storedKeyss = JSON.parse(localStorage.getItem("gemini_api_keysL") || "[]");
const currentApiKey = storedKeyss[keyIndex];
const ai = new GoogleGenAI({ apiKey: currentApiKey });
```

**Models Used**:
- `gemini-2.0-flash`, `gemini-2.0-flash-lite`
- `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`
- Automatic model selection with shuffling

### 3. Configuration Storage
**Pattern**: Extensive localStorage usage for user preferences
```javascript
// Boolean settings pattern
Category = localStorage.getItem("Category") === "true" || false;
FileType = localStorage.getItem("File Type") === "true" || false;

// Array storage pattern
let storedKeyss = JSON.parse(localStorage.getItem("gemini_api_keysL") || "[]");
```

**Common Settings**:
- `Category`, `File Type`, `Created by AI` (booleans)
- `gemini_api_keysL` (API key array)
- `selectedModel` (current AI model)
- `timeout` (processing delays)

### 4. Async Processing Flow
**Pattern**: Complex async/await chains with error handling
```javascript
async function generateContentFromImage(userInput) {
  // 1. Show loading UI
  // 2. Convert image to base64
  // 3. Try multiple API keys/models with rotation
  // 4. Parse AI response
  // 5. Update Adobe Stock form fields
  // 6. Handle auto-processing continuation
}
```

### 5. Auto-Processing Logic
**Pattern**: State-managed batch processing with user controls
```javascript
let currentIndex = 0;
let isAutoClicking = false;

async function clickNextElement() {
  if (!isAutoClicking || currentIndex >= elements.length) return;
  // Process current image, then increment and continue
}
```

## Build & Development Workflow

### Building
```bash
npm run build  # Runs webpack, outputs to dist/
```

### Development Setup
1. Install dependencies: `npm install`
2. Make changes to `background.js` or `content.js`
3. Run `npm run build`
4. Load `dist/` folder as unpacked extension in Chrome

### Key Files to Reference
- `webpack.config.js`: Entry points are `background` and `content`
- `manifest.json`: Defines content script injection patterns
- `content.js` lines 1304-1450: Core AI processing logic
- `content.js` lines 304-440: UI injection patterns

## Adobe Stock Integration Points
- **Page Pattern**: `https://contributor.stock.adobe.com/*/uploads*`
- **Title Input**: `._spectrum-Textfield-input_61339`
- **Keywords Input**: `.input--full.title-input`
- **Submit Button**: `button[data-t="submit-moderation-button"]`
- **Image Sources**: Dynamically extracted from upload previews

## Error Handling Patterns
- API key rotation on failures
- Model fallback (multiple Gemini models)
- User-friendly status messages
- Timeout handling for long-running requests

## Code Style Notes
- Mixed Thai/English comments (maintain bilingual approach)
- Inline style manipulation for UI elements
- Extensive use of template literals for dynamic content
- Arrow functions with async/await throughout</content>
<parameter name="filePath">e:\Project\agkeywords-plus\.github\copilot-instructions.md
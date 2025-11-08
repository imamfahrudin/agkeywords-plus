# AGKeywords Plus

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

A Chrome extension (Manifest V3) that automates title and keyword generation for Adobe Stock contributor uploads using Google Gemini AI.

## Features

- **AI-Powered Content Generation**: Uses Google Gemini AI models (gemini-2.0-flash, gemini-2.5-flash, etc.) to generate SEO-optimized titles and keywords from uploaded images
- **Batch Processing**: Auto-processing mode for handling multiple uploads sequentially
- **Dynamic UI Injection**: Seamlessly integrates controls into Adobe Stock's upload interface
- **API Key Rotation**: Supports multiple Gemini API keys with automatic fallback and model rotation
- **Customizable Settings**: Extensive configuration options stored locally (categories, file types, AI attribution, etc.)
- **Real-time Status Updates**: Loading indicators and progress feedback during AI processing

## Installation

### Prerequisites
- Node.js and npm
- Google Chrome browser
- Google Gemini AI API key(s)

### Setup Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/imamfahrudin/agkeywords-plus.git
   cd agkeywords-plus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `dist/` folder

## Usage

1. **Navigate to Adobe Stock**: Go to your Adobe Stock contributor uploads page (`https://contributor.stock.adobe.com/*/uploads*`)

2. **Activate Extension**: Click the AGKeywords Plus extension icon in your browser toolbar

3. **Configure Settings** (first time):
   - Add your Google Gemini API key(s) in the settings panel
   - Configure preferences (categories, file types, etc.)

4. **Generate Content**:
   - Upload your images to Adobe Stock as usual
   - Use the injected "Generate" button to create AI-powered titles and keywords
   - Or enable "Auto" mode for automatic batch processing

5. **Monitor Progress**: Watch the status overlay for processing updates and any errors

## Configuration

The extension stores settings locally using localStorage:

- **API Keys**: Array of Gemini API keys for rotation/fallback
- **AI Model**: Selected Gemini model (gemini-2.5-flash, gemini-2.0-flash, etc.)
- **Processing Options**: Category inclusion, file type detection, AI attribution
- **Timeouts**: Processing delays and retry configurations

## Development

### Project Structure
```
├── background.js          # Extension background script (icon clicks, page redirects)
├── content.js             # Main content script (4376 lines - UI injection, AI processing)
├── manifest.json          # Chrome extension manifest (v3)
├── webpack.config.js      # Build configuration
├── sortable.min.js        # Drag-and-drop library
├── package.json           # Dependencies and scripts
└── icons/                 # Extension icons
```

### Build Process
```bash
npm run build  # Webpack bundles ES6+ code to dist/
```

### Key Development Patterns
- **DOM Manipulation**: Heavy use of `document.createElement()` and Adobe Stock-specific selectors
- **Async Processing**: Complex async/await chains with API key rotation
- **State Management**: localStorage for user preferences and processing state
- **Error Handling**: Multi-key/model fallback with user-friendly status messages

## Troubleshooting

### Common Issues

**Extension not loading**:
- Ensure you're loading the `dist/` folder, not the root directory
- Check Chrome developer console for errors
- Verify manifest.json is valid

**AI generation failing**:
- Check your Gemini API key validity and quota
- Ensure internet connection is stable
- Try different AI models in settings

**UI not appearing on Adobe Stock**:
- Confirm you're on the correct upload page URL pattern
- Check content script injection (DevTools → Application → Content Scripts)
- Clear browser cache and reload extension

**Build errors**:
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version compatibility
- Verify webpack.config.js configuration

### Debug Mode
- Open Chrome DevTools on the Adobe Stock page
- Check Console tab for extension-related messages
- Use Application tab to inspect localStorage settings

## API Keys

This extension requires Google Gemini AI API keys. You can obtain them from:
- [Google AI Studio](https://makersuite.google.com/app/apikey)

Multiple keys are recommended for:
- Load balancing across keys
- Automatic fallback when one key hits rate limits
- Improved reliability during high-volume processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Adobe Stock upload pages
5. Submit a pull request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

The ISC License is a permissive free software license that allows you to use, copy, modify, and distribute this software for any purpose, provided that the copyright notice and permission notice appear in all copies.

## Disclaimer

This extension is not officially affiliated with Adobe Stock or Google. Use at your own risk and ensure compliance with Adobe Stock's terms of service.
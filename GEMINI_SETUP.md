# Google Gemini API Setup

## Get Your Free API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use existing one
4. Copy the API key

## Add to Environment Variables

### For Development (.env file)
```bash
GEMINI_API_KEY=your_api_key_here
```

### For Script Execution (PowerShell)
```powershell
$env:GEMINI_API_KEY="your_api_key_here"
npx tsx tools/embed-businesses.ts
```

### For Script Execution (Bash/Linux/Mac)
```bash
export GEMINI_API_KEY="your_api_key_here"
npx tsx tools/embed-businesses.ts
```

## Run Embedding Script

After setting the API key, run:

```bash
npx tsx tools/embed-businesses.ts
```

This will:
- Find all businesses without embeddings
- Generate embeddings using Gemini text-embedding-004 model
- Store embeddings in the database
- Show progress and summary

## Features

- **Free Tier**: Gemini offers generous free tier
- **High Quality**: text-embedding-004 is state-of-the-art
- **Rate Limiting**: Script includes 1-second delays between requests
- **Error Handling**: Continues processing even if some fail
- **Progress Tracking**: Shows real-time progress

## Troubleshooting

### "GEMINI_API_KEY not set"
Make sure you've set the environment variable before running the script.

### Rate limit errors
The script already includes delays. If you still hit limits, increase the timeout in the script.

### Connection errors
Check your internet connection and verify the API key is correct.

# mcp-alpha-vantage

Get stock quotes, historical prices, forex rates, crypto data, and earnings reports.

## Tools

| Tool | Description |
|------|-------------|
| `get_quote` | Get real-time stock quote. |
| `get_daily` | Get daily historical prices. |
| `search_symbol` | Search for ticker symbols. |
| `get_forex` | Get foreign exchange rate. |
| `get_crypto` | Get daily crypto prices. |
| `get_earnings` | Get company earnings data. |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ALPHA_VANTAGE_API_KEY` | Yes | Alpha Vantage API key (free at alphavantage.co) |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-alpha-vantage.git
cd mcp-alpha-vantage
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "alpha-vantage": {
      "command": "node",
      "args": ["/path/to/mcp-alpha-vantage/dist/index.js"],
      "env": {
        "ALPHA_VANTAGE_API_KEY": "your-alpha-vantage-api-key"
      }
    }
  }
}
```

## Usage with npx

```bash
npx mcp-alpha-vantage
```

## License

MIT

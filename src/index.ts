#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://www.alphavantage.co/query";
const RATE_LIMIT_MS = 12500; // free tier: 5 calls/min
let lastRequestTime = 0;

function getKey(): string {
  const k = process.env.ALPHA_VANTAGE_API_KEY;
  if (!k) throw new Error("ALPHA_VANTAGE_API_KEY required. Free at https://www.alphavantage.co/support/#api-key");
  return k;
}

async function avFetch(params: Record<string, string>): Promise<any> {
  const now = Date.now(); const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  lastRequestTime = Date.now();
  const p = new URLSearchParams({ ...params, apikey: getKey() });
  const res = await fetch(`${BASE}?${p}`);
  if (!res.ok) throw new Error(`Alpha Vantage error: ${res.status}`);
  return res.json();
}

const server = new McpServer({ name: "mcp-alpha-vantage", version: "1.0.0" });

server.tool("get_quote", "Get real-time stock quote.", {
  symbol: z.string().describe("Ticker (e.g. AAPL)"),
}, async ({ symbol }) => {
  const d = await avFetch({ function: "GLOBAL_QUOTE", symbol });
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

server.tool("get_daily", "Get daily historical prices.", {
  symbol: z.string(), outputsize: z.enum(["compact", "full"]).default("compact"),
}, async ({ symbol, outputsize }) => {
  const d = await avFetch({ function: "TIME_SERIES_DAILY", symbol, outputsize });
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

server.tool("search_symbol", "Search for ticker symbols.", {
  keywords: z.string(),
}, async ({ keywords }) => {
  const d = await avFetch({ function: "SYMBOL_SEARCH", keywords });
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

server.tool("get_forex", "Get foreign exchange rate.", {
  fromCurrency: z.string().describe("e.g. EUR"), toCurrency: z.string().describe("e.g. USD"),
}, async ({ fromCurrency, toCurrency }) => {
  const d = await avFetch({ function: "CURRENCY_EXCHANGE_RATE", from_currency: fromCurrency, to_currency: toCurrency });
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

server.tool("get_crypto", "Get daily crypto prices.", {
  symbol: z.string().describe("e.g. BTC"), market: z.string().default("USD"),
}, async ({ symbol, market }) => {
  const d = await avFetch({ function: "DIGITAL_CURRENCY_DAILY", symbol, market });
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

server.tool("get_earnings", "Get company earnings data.", {
  symbol: z.string(),
}, async ({ symbol }) => {
  const d = await avFetch({ function: "EARNINGS", symbol });
  return { content: [{ type: "text" as const, text: JSON.stringify(d, null, 2) }] };
});

async function main() { const t = new StdioServerTransport(); await server.connect(t); }
main().catch((e) => { console.error("Fatal:", e); process.exit(1); });

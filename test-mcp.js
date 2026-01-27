#!/usr/bin/env node

// Test script to verify the MCP search_meetings tool works correctly
// This simulates what an MCP client would do

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'index.js');

// Check for required environment variables
if (!process.env.FELLOW_API_KEY || !process.env.FELLOW_SUBDOMAIN) {
  console.error('Error: Missing required environment variables');
  console.error('Please set FELLOW_API_KEY and FELLOW_SUBDOMAIN');
  console.error('\nExample:');
  console.error('  FELLOW_API_KEY=your_key FELLOW_SUBDOMAIN=your_subdomain node test-mcp.js');
  process.exit(1);
}

// Start the MCP server
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
  }
});

let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  console.log('SERVER STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('SERVER STDERR:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Wait a bit for server to start
setTimeout(() => {
  console.log('\n=== Sending initialize request ===');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  setTimeout(() => {
    console.log('\n=== Sending search_meetings request ===');
    const searchRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'search_meetings',
        arguments: {
          title: 'iqt',
          created_at_start: '2026-01-26',
          created_at_end: '2026-01-26',
          limit: 10
        }
      }
    };
    
    server.stdin.write(JSON.stringify(searchRequest) + '\n');
    
    // Wait for response then close
    setTimeout(() => {
      console.log('\n=== Test complete, shutting down ===');
      server.kill();
    }, 3000);
  }, 1000);
}, 500);

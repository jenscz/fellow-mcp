#!/usr/bin/env node

// Simple test script to verify Fellow API connection

const apiKey = process.env.FELLOW_API_KEY;
const subdomain = process.env.FELLOW_SUBDOMAIN;

if (!apiKey || !subdomain) {
  console.error("Missing FELLOW_API_KEY or FELLOW_SUBDOMAIN environment variables");
  process.exit(1);
}

const baseUrl = `https://${subdomain}.fellow.app/api/v1`;

async function test() {
  console.log(`Testing Fellow API connection...`);
  console.log(`Subdomain: ${subdomain}`);
  console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log();

  try {
    // Test listing recordings with date filter
    console.log("1. Testing POST /recordings with created_at_start=2026-01-26...");
    const recordingsRes = await fetch(`${baseUrl}/recordings`, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filters: {
          created_at_start: '2026-01-26'
        },
        pagination: { cursor: null, page_size: 20 },
      }),
    });

    console.log(`   Status: ${recordingsRes.status} ${recordingsRes.statusText}`);
    const recordingsData = await recordingsRes.json();
    console.log(`   Number of recordings: ${recordingsData.recordings?.data?.length || 0}`);
    if (recordingsData.recordings?.data?.length > 0) {
      console.log(`   First 3 recordings:`);
      recordingsData.recordings.data.slice(0, 3).forEach(r => {
        console.log(`     - ${r.title}`);
        console.log(`       created_at: ${r.created_at}`);
        console.log(`       event_start: ${r.event_start}`);
      });
    }
    console.log();

    // Test listing recordings without filter
    console.log("2. Testing POST /recordings without filters...");
    const allRecordingsRes = await fetch(`${baseUrl}/recordings`, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pagination: { cursor: null, page_size: 5 },
      }),
    });

    console.log(`   Status: ${allRecordingsRes.status} ${allRecordingsRes.statusText}`);
    const allRecordingsData = await allRecordingsRes.json();
    console.log(`   Number of recordings: ${allRecordingsData.recordings?.data?.length || 0}`);
    if (allRecordingsData.recordings?.data?.length > 0) {
      console.log(`   First recording:`);
      const r = allRecordingsData.recordings.data[0];
      console.log(`     - ${r.title}`);
      console.log(`       created_at: ${r.created_at}`);
      console.log(`       event_start: ${r.event_start}`);
    }

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

test();

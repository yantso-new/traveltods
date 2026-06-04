#!/usr/bin/env node

/**
 * Batch update script to populate suggestions and neighborhoods for existing destinations
 * 
 * Usage:
 *   node scripts/populate-new-fields.js
 *   node scripts/populate-new-fields.js 20  # Process 20 destinations
 * 
 * This script will:
 * 1. Find all destinations missing suggestions/neighborhoods data
 * 2. Re-gather them in batches to populate the new fields
 * 3. Show progress and results
 */

const { spawn } = require('child_process');

const batchSize = parseInt(process.argv[2]) || 10;

console.log(`\n🚀 Starting batch update (batch size: ${batchSize})\n`);

const convex = spawn('npx', ['convex', 'run', 'update_all:populateNewFields', JSON.stringify({batchSize})], {
    stdio: 'inherit',
    shell: true
});

convex.on('close', (code) => {
    if (code === 0) {
        console.log(`\n✅ Batch complete! Run again to process more destinations.\n`);
    } else {
        console.log(`\n❌ Batch failed with code ${code}\n`);
    }
});

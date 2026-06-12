#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const minimum = Number(process.argv[2] || 12);

function runConvex(args) {
  const result = spawnSync("npx", ["convex", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Convex command failed").trim());
  }

  return result.stdout.trim();
}

function parseJsonFromOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    const firstArray = output.indexOf("[");
    const firstObject = output.indexOf("{");
    const starts = [firstArray, firstObject].filter((value) => value >= 0);
    const start = Math.min(...starts);
    const end = Math.max(output.lastIndexOf("]"), output.lastIndexOf("}"));
    if (!Number.isFinite(start) || end < start) {
      throw new Error(`Could not find JSON in Convex output: ${output.slice(0, 500)}`);
    }
    return JSON.parse(output.slice(start, end + 1));
  }
}

function loadSuggestions() {
  const source = readFileSync(join(process.cwd(), "convex/lib/country_destinations.ts"), "utf8");
  const match = source.match(/COUNTRY_DESTINATION_SUGGESTIONS:\s*Record<string,\s*string\[]>\s*=\s*({[\s\S]*?});/);
  if (!match) {
    throw new Error("Could not parse COUNTRY_DESTINATION_SUGGESTIONS");
  }
  return Function(`"use strict"; return (${match[1]});`)();
}

function normalizeCountry(country) {
  return country.trim().replace(/\s+/g, " ");
}

async function main() {
  const suggestions = loadSuggestions();
  const countries = parseJsonFromOutput(runConvex(["run", "--prod", "destinations:getAllCountries", "{}"]));
  const belowMinimum = countries
    .map((country) => ({
      ...country,
      name: normalizeCountry(country.name),
    }))
    .filter((country) => country.destinationCount < minimum)
    .sort((a, b) => a.destinationCount - b.destinationCount || a.name.localeCompare(b.name));

  console.log(`Found ${countries.length} production countries.`);
  console.log(`${belowMinimum.length} countries are below ${minimum} destinations.`);

  let totalAdded = 0;
  let totalFailed = 0;
  const failures = [];

  for (const country of belowMinimum) {
    if (!suggestions[country.name]) {
      console.error(`No suggestions configured for ${country.name}; current count ${country.destinationCount}`);
      failures.push({ country: country.name, error: "No suggestions configured" });
      totalFailed++;
      continue;
    }

    console.log(`${country.name}: ${country.destinationCount}/${minimum}`);
    const output = runConvex([
      "run",
      "--prod",
      "destinations:backfillCountryDestinations",
      JSON.stringify({ country: country.name, minimum }),
    ]);
    const result = parseJsonFromOutput(output);
    totalAdded += result.added || 0;
    totalFailed += result.failed || 0;

    if (result.failures?.length) {
      failures.push({ country: country.name, failures: result.failures });
    }

    console.log(`${country.name}: added ${result.added || 0}, failed ${result.failed || 0}`);
  }

  const after = parseJsonFromOutput(runConvex(["run", "--prod", "destinations:getAllCountries", "{}"]));
  const stillBelow = after.filter((country) => country.destinationCount < minimum);

  console.log(`Done. Added ${totalAdded}. Failed ${totalFailed}.`);
  console.log(`${stillBelow.length} countries remain below ${minimum}.`);
  if (stillBelow.length) {
    console.log(JSON.stringify(stillBelow, null, 2));
  }
  if (failures.length) {
    console.log(JSON.stringify(failures, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

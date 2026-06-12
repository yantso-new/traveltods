#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const candidates = [
  ["Orlando", "United States"], ["San Diego", "United States"], ["Washington DC", "United States"], ["New York City", "United States"],
  ["Boston", "United States"], ["Chicago", "United States"], ["San Francisco", "United States"], ["Seattle", "United States"],
  ["Portland", "United States"], ["Honolulu", "United States"], ["Maui", "United States"], ["Oahu", "United States"],
  ["Yellowstone National Park", "United States"], ["Grand Canyon National Park", "United States"], ["Yosemite National Park", "United States"],
  ["Anaheim", "United States"], ["San Antonio", "United States"], ["Austin", "United States"], ["Denver", "United States"],
  ["Charleston", "United States"], ["Savannah", "United States"], ["Asheville", "United States"], ["Myrtle Beach", "United States"],
  ["Hilton Head Island", "United States"], ["Outer Banks", "United States"], ["Key West", "United States"], ["Miami", "United States"],
  ["Tampa", "United States"], ["St Petersburg", "United States"], ["Scottsdale", "United States"], ["Sedona", "United States"],
  ["Monterey", "United States"], ["Santa Barbara", "United States"], ["Lake Tahoe", "United States"], ["Vancouver", "Canada"],
  ["Victoria", "Canada"], ["Toronto", "Canada"], ["Montreal", "Canada"], ["Quebec City", "Canada"], ["Ottawa", "Canada"],
  ["Calgary", "Canada"], ["Banff", "Canada"], ["Whistler", "Canada"], ["Niagara Falls", "Canada"], ["Cancun", "Mexico"],
  ["Playa del Carmen", "Mexico"], ["Tulum", "Mexico"], ["Puerto Vallarta", "Mexico"], ["San Miguel de Allende", "Mexico"],
  ["Oaxaca", "Mexico"], ["Merida", "Mexico"], ["Costa Rica", "Costa Rica"], ["San Jose", "Costa Rica"],
  ["La Fortuna", "Costa Rica"], ["Monteverde", "Costa Rica"], ["Manuel Antonio", "Costa Rica"], ["Panama City", "Panama"],
  ["Cartagena", "Colombia"], ["Medellin", "Colombia"], ["Quito", "Ecuador"], ["Galapagos Islands", "Ecuador"],
  ["Lima", "Peru"], ["Cusco", "Peru"], ["Buenos Aires", "Argentina"], ["Bariloche", "Argentina"],
  ["Santiago", "Chile"], ["Valparaiso", "Chile"], ["Rio de Janeiro", "Brazil"], ["Florianopolis", "Brazil"],
  ["London", "United Kingdom"], ["Bath", "United Kingdom"], ["York", "United Kingdom"], ["Cambridge", "United Kingdom"],
  ["Oxford", "United Kingdom"], ["Cornwall", "United Kingdom"], ["Lake District", "United Kingdom"], ["Belfast", "United Kingdom"],
  ["Galway", "Ireland"], ["Cork", "Ireland"], ["Paris", "France"], ["Nice", "France"], ["Lyon", "France"],
  ["Bordeaux", "France"], ["Strasbourg", "France"], ["Annecy", "France"], ["Montpellier", "France"], ["Nantes", "France"],
  ["Barcelona", "Spain"], ["Madrid", "Spain"], ["Valencia", "Spain"], ["Seville", "Spain"], ["Malaga", "Spain"],
  ["Granada", "Spain"], ["San Sebastian", "Spain"], ["Bilbao", "Spain"], ["Mallorca", "Spain"], ["Tenerife", "Spain"],
  ["Lisbon", "Portugal"], ["Porto", "Portugal"], ["Algarve", "Portugal"], ["Madeira", "Portugal"], ["Azores", "Portugal"],
  ["Rome", "Italy"], ["Florence", "Italy"], ["Venice", "Italy"], ["Milan", "Italy"], ["Bologna", "Italy"],
  ["Naples", "Italy"], ["Sorrento", "Italy"], ["Amalfi Coast", "Italy"], ["Sicily", "Italy"], ["Sardinia", "Italy"],
  ["Copenhagen", "Denmark"], ["Aarhus", "Denmark"], ["Billund", "Denmark"], ["Amsterdam", "Netherlands"], ["Rotterdam", "Netherlands"],
  ["The Hague", "Netherlands"], ["Utrecht", "Netherlands"], ["Brussels", "Belgium"], ["Bruges", "Belgium"], ["Ghent", "Belgium"],
  ["Zurich", "Switzerland"], ["Lucerne", "Switzerland"], ["Interlaken", "Switzerland"], ["Geneva", "Switzerland"], ["Basel", "Switzerland"],
  ["Vienna", "Austria"], ["Salzburg", "Austria"], ["Innsbruck", "Austria"], ["Munich", "Germany"], ["Berlin", "Germany"],
  ["Hamburg", "Germany"], ["Cologne", "Germany"], ["Dresden", "Germany"], ["Heidelberg", "Germany"], ["Nuremberg", "Germany"],
  ["Prague", "Czech Republic"], ["Budapest", "Hungary"], ["Krakow", "Poland"], ["Warsaw", "Poland"], ["Gdansk", "Poland"],
  ["Stockholm", "Sweden"], ["Gothenburg", "Sweden"], ["Oslo", "Norway"], ["Bergen", "Norway"], ["Helsinki", "Finland"],
  ["Tallinn", "Estonia"], ["Riga", "Latvia"], ["Vilnius", "Lithuania"], ["Reykjavik", "Iceland"], ["Dubrovnik", "Croatia"],
  ["Split", "Croatia"], ["Zagreb", "Croatia"], ["Ljubljana", "Slovenia"], ["Lake Bled", "Slovenia"], ["Athens", "Greece"],
  ["Crete", "Greece"], ["Rhodes", "Greece"], ["Corfu", "Greece"], ["Istanbul", "Turkey"], ["Antalya", "Turkey"],
  ["Cappadocia", "Turkey"], ["Marrakech", "Morocco"], ["Cape Town", "South Africa"], ["Garden Route", "South Africa"],
  ["Dubai", "United Arab Emirates"], ["Abu Dhabi", "United Arab Emirates"], ["Doha", "Qatar"], ["Muscat", "Oman"],
  ["Tel Aviv", "Israel"], ["Jerusalem", "Israel"], ["Singapore", "Singapore"], ["Tokyo", "Japan"], ["Kyoto", "Japan"],
  ["Osaka", "Japan"], ["Nara", "Japan"], ["Okinawa", "Japan"], ["Seoul", "South Korea"], ["Busan", "South Korea"],
  ["Taipei", "Taiwan"], ["Hong Kong", "Hong Kong"], ["Bangkok", "Thailand"], ["Chiang Mai", "Thailand"], ["Phuket", "Thailand"],
  ["Krabi", "Thailand"], ["Kuala Lumpur", "Malaysia"], ["Penang", "Malaysia"], ["Langkawi", "Malaysia"], ["Bali", "Indonesia"],
  ["Yogyakarta", "Indonesia"], ["Hanoi", "Vietnam"], ["Hoi An", "Vietnam"], ["Da Nang", "Vietnam"], ["Ho Chi Minh City", "Vietnam"],
  ["Siem Reap", "Cambodia"], ["Luang Prabang", "Laos"], ["Colombo", "Sri Lanka"], ["Galle", "Sri Lanka"], ["Jaipur", "India"],
  ["Udaipur", "India"], ["Kerala", "India"], ["Goa", "India"], ["Sydney", "Australia"], ["Melbourne", "Australia"],
  ["Brisbane", "Australia"], ["Gold Coast", "Australia"], ["Cairns", "Australia"], ["Adelaide", "Australia"], ["Perth", "Australia"],
  ["Hobart", "Australia"], ["Auckland", "New Zealand"], ["Wellington", "New Zealand"], ["Queenstown", "New Zealand"], ["Rotorua", "New Zealand"],
];

const targetTotal = Number(process.argv[2] || 150);

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

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
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

async function main() {
  const raw = runConvex(["run", "--prod", "destinations:getDestinationInventory", "{}"]);
  const existing = parseJsonFromOutput(raw);
  const existingNames = new Set(existing.map((d) => normalizeName(d.name)));
  const planned = candidates
    .filter(([city, country]) => !existingNames.has(normalizeName(`${city}, ${country}`)))
    .slice(0, Math.max(0, targetTotal - existing.length));

  console.log(`Production currently has ${existing.length} destinations.`);
  console.log(`Importing ${planned.length} new destinations to reach target ${targetTotal}.`);

  let success = 0;
  let failed = 0;
  const failures = [];

  for (let index = 0; index < planned.length; index++) {
    const [city, country] = planned[index];
    const label = `${city}, ${country}`;
    try {
      console.log(`[${index + 1}/${planned.length}] ${label}`);
      const out = runConvex([
        "run",
        "--prod",
        "destinations:gatherDestination",
        JSON.stringify({ city, country }),
      ]);
      const parsed = parseJsonFromOutput(out);
      if (parsed.success) {
        success++;
      } else {
        failed++;
        failures.push({ label, error: parsed.error || "Unknown action failure" });
        console.error(`Failed ${label}: ${parsed.error || "Unknown action failure"}`);
      }
    } catch (error) {
      failed++;
      failures.push({ label, error: error.message });
      console.error(`Failed ${label}: ${error.message}`);
    }
  }

  const after = parseJsonFromOutput(runConvex(["run", "--prod", "destinations:getDestinationInventory", "{}"]));
  console.log(`Done. Success: ${success}. Failed: ${failed}. Production total: ${after.length}.`);
  if (failures.length) {
    console.log(JSON.stringify(failures, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

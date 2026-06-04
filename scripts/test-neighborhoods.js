const { getNeighborhoods, getFamilySuggestions } = require('../convex/lib/api_clients.ts');

async function test() {
  console.log('Testing neighborhoods for London (51.5074, -0.1277)...\n');
  
  try {
    const neighborhoods = await getNeighborhoods(51.5074, -0.1277, 'London');
    console.log(`Found ${neighborhoods.length} neighborhoods:`);
    neighborhoods.slice(0, 3).forEach(n => {
      console.log(`  - ${n.name}: ${n.tag || 'no tag'}`);
    });
    
    console.log('\nTesting family suggestions...\n');
    const suggestions = await getFamilySuggestions(51.5074, -0.1277);
    console.log(`Free activities: ${suggestions.freeActivities.length}`);
    console.log(`Cafes: ${suggestions.cafes.length}`);
    console.log(`Restaurants: ${suggestions.restaurants.length}`);
    console.log(`Downtime: ${suggestions.downtime.length}`);
    
    if (suggestions.freeActivities.length > 0) {
      console.log('\nSample free activities:');
      suggestions.freeActivities.slice(0, 3).forEach(a => {
        console.log(`  - ${a.name} (${a.type})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

test();

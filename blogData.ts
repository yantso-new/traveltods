export type BlogCategory = 'explore' | 'community';

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: BlogCategory;
    author: {
        name: string;
        avatar: string;
    };
    publishedAt: string;
    readTime: number;
    featured: boolean;
}

export const BLOG_CATEGORIES: { id: BlogCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Posts' },
    { id: 'explore', label: 'Explore' },
    { id: 'community', label: 'Community' },
];

export const BLOG_POSTS: BlogPost[] = [
    // EXPLORE CATEGORY
    {
        slug: 'top-destinations-2026',
        title: 'Top 10 Family Destinations for 2026',
        excerpt: 'Discover the most family-friendly destinations that offer the perfect blend of adventure, relaxation, and kid-approved activities.',
        content: `
# Top 10 Family Destinations for 2026

Planning a family trip can be overwhelming, but we've done the research for you. These destinations stand out for their exceptional family-friendly amenities, safety, and entertainment options.

## 1. Copenhagen, Denmark
With its world-famous Tivoli Gardens and countless playgrounds, Copenhagen is a dream for families with toddlers.

## 2. Tokyo, Japan
Clean, safe, and incredibly organized—Tokyo offers an unforgettable blend of tradition and futuristic fun.

## 3. Barcelona, Spain
Beaches, parks, and Gaudí's magical architecture make Barcelona a feast for curious little eyes.

## 4. Auckland, New Zealand
Nature lovers will adore Auckland's beaches, parks, and wildlife encounters.

## 5. Singapore
This city-state is designed with families in mind, from the Gardens by the Bay to Sentosa Island.

## 6. Lisbon, Portugal
Affordable, sunny, and full of charm—Lisbon's hills are an adventure on their own.

## 7. Vancouver, Canada
Mountains meet ocean in this outdoor paradise perfect for active families.

## 8. Melbourne, Australia
From the zoo to the beach, Melbourne has endless options for family fun.

## 9. Amsterdam, Netherlands
Bike-friendly streets and canal boat rides make Amsterdam magical for kids.

## 10. Reykjavik, Iceland
For families seeking unique adventures, Iceland's geysers and waterfalls deliver.

Start planning your 2026 adventure today!
    `,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        category: 'explore',
        author: { name: 'Sarah Mitchell', avatar: 'https://i.pravatar.cc/150?img=1' },
        publishedAt: '2026-02-05',
        readTime: 8,
        featured: true,
    },
    {
        slug: 'nature-getaways-with-kids',
        title: 'Best Nature Getaways for Families with Toddlers',
        excerpt: 'Escape the city and reconnect with nature at these family-friendly destinations with easy trails and wildlife encounters.',
        content: `
# Best Nature Getaways for Families with Toddlers

Getting your little ones into nature early creates lasting memories and a love for the outdoors.

## Why Nature Matters
Studies show that children who spend time in nature develop better cognitive skills and emotional regulation.

## Top Picks

### Costa Rica
Sloths, monkeys, and beaches—Costa Rica is a nature lover's paradise that's surprisingly toddler-friendly.

### Swiss Alps
Easy walking paths and stunning scenery make Switzerland ideal for families.

### Banff, Canada
Wildlife spotting and gentle hikes await in this Canadian gem.

### New Zealand's South Island
Glaciers, fjords, and friendly wildlife make every day an adventure.

## Tips for Nature Travel with Toddlers
- Pack light but bring essentials
- Plan for nap times
- Keep activities short and flexible
- Embrace the mess!
    `,
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        category: 'explore',
        author: { name: 'James Chen', avatar: 'https://i.pravatar.cc/150?img=3' },
        publishedAt: '2026-01-28',
        readTime: 6,
        featured: false,
    },
    {
        slug: 'beach-holidays-guide',
        title: 'The Ultimate Guide to Beach Holidays with Kids',
        excerpt: 'Sun, sand, and smiles—here\'s everything you need to know about planning the perfect beach vacation with your little ones.',
        content: `
# The Ultimate Guide to Beach Holidays with Kids

Beach holidays are a classic family tradition, but traveling with toddlers requires extra planning.

## Choosing the Right Beach
- Look for calm, shallow waters
- Check for nearby facilities
- Consider shaded areas

## Top Family Beach Destinations

### Maldives
Overwater bungalows and crystal-clear waters—luxury for the whole family.

### Algarve, Portugal
Golden cliffs, warm waters, and family-friendly resorts.

### Phuket, Thailand
Affordable luxury with calm beaches and excellent food.

### Hawaii
Diverse islands offer something for every family.

## Beach Packing Essentials
- SPF 50+ sunscreen
- UV protective clothing
- Beach tent or umbrella
- Sand toys and buckets
- Plenty of snacks and water
    `,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        category: 'explore',
        author: { name: 'Emma Rodriguez', avatar: 'https://i.pravatar.cc/150?img=5' },
        publishedAt: '2026-01-20',
        readTime: 7,
        featured: false,
    },
    {
        slug: 'city-adventures-toddlers',
        title: 'City Adventures: Urban Exploration with Toddlers',
        excerpt: 'Big cities can be intimidating with little ones, but these urban destinations are surprisingly toddler-friendly.',
        content: `
# City Adventures: Urban Exploration with Toddlers

Don't let having a toddler stop you from exploring the world's greatest cities.

## Why Cities Can Be Great for Families
- Excellent public transport
- World-class museums with kids' programs
- Diverse food options
- Parks and playgrounds everywhere

## Best Cities for Toddlers

### Vienna, Austria
Classical music, beautiful parks, and excellent public transport.

### Singapore
Clean, safe, and packed with family attractions.

### Copenhagen, Denmark
The world's playground capital with attractions at every corner.

### Portland, Oregon
Quirky, kid-friendly, and full of green spaces.

## Urban Travel Tips
- Use strollers with good suspension
- Plan around nap schedules
- Take advantage of skip-the-line tickets
- Embrace public transport
    `,
        image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
        category: 'explore',
        author: { name: 'Michael Park', avatar: 'https://i.pravatar.cc/150?img=8' },
        publishedAt: '2026-01-15',
        readTime: 5,
        featured: false,
    },

    // COMMUNITY CATEGORY
    {
        slug: 'parent-guide-first-flight',
        title: 'First Flight with Your Toddler: A Parent\'s Survival Guide',
        excerpt: 'Everything you need to know about flying with your little one for the first time—from booking to landing.',
        content: `
# First Flight with Your Toddler: A Parent's Survival Guide

Flying with a toddler for the first time can feel daunting, but with the right preparation, it can be smooth sailing.

## Before You Book
- Choose flight times wisely (nap times or early morning)
- Consider direct flights to minimize stress
- Book seats strategically

## Packing Essentials
- Extra clothes (for you AND baby)
- Favorite toys and books
- Snacks, snacks, and more snacks
- Noise-canceling headphones
- Download shows/games offline

## At the Airport
- Arrive early but not too early
- Use family security lanes
- Let them burn energy before boarding

## On the Plane
- Bring new toys for distraction
- Nurse or give a bottle during takeoff/landing
- Stay calm—your energy affects them

## Real Parent Tips
"We always book the first flight of the day. Fewer delays, less crowded, and we're home by afternoon." — Sarah, mom of two
    `,
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
        category: 'community',
        author: { name: 'Lisa Thompson', avatar: 'https://i.pravatar.cc/150?img=9' },
        publishedAt: '2026-02-01',
        readTime: 9,
        featured: false,
    },
    {
        slug: 'travel-forum-highlights',
        title: 'Community Spotlight: Best Tips from Our Travel Forum',
        excerpt: 'Our community of traveling parents shares their best-kept secrets for stress-free family adventures.',
        content: `
# Community Spotlight: Best Tips from Our Travel Forum

Our amazing community has shared thousands of tips. Here are the most loved ones.

## Accommodation Hacks

> "Always check if the hotel has a kitchenette. It's a game-changer for toddler meals." — @travelmom_jen

> "Request a room away from elevators and ice machines. Quieter sleep = happier baby." — @dadventures

## Food & Dining

> "We always pack a silicone placemat. Works on any surface and keeps baby's food clean." — @organicfamily

> "Research restaurants with outdoor seating. Toddler meltdowns attract less attention outside." — @honestdad

## Transportation Tips

> "Rent a car seat instead of bringing your own. Most rental companies have clean, safe options." — @minimalistmom

> "Book train travel over flights when possible. More space for wiggly toddlers." — @europeanfamily

## Local Experiences

> "Skip tourist traps. Parks and local markets are usually more fun for kids anyway." — @slowtravel_dad

Join our forum to share your own tips!
    `,
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
        category: 'community',
        author: { name: 'TravelTods Team', avatar: 'https://i.pravatar.cc/150?img=12' },
        publishedAt: '2026-01-25',
        readTime: 6,
        featured: false,
    },
    {
        slug: 'safety-tips-abroad',
        title: 'Essential Safety Tips for Traveling Abroad with Children',
        excerpt: 'Keep your family safe with these expert-backed safety guidelines for international travel.',
        content: `
# Essential Safety Tips for Traveling Abroad with Children

Safety is every parent's top priority. Here's how to stay prepared.

## Before You Go
- Register with your embassy
- Get travel insurance that covers medical evacuation
- Research local emergency numbers
- Ensure vaccinations are up to date

## Document Safety
- Keep digital copies of all passports
- Store copies separately from originals
- Have backup payment methods

## Health & Medical
- Pack a comprehensive first aid kit
- Know the location of the nearest hospital
- Bring prescription medications with documentation
- Stay hydrated and watch for signs of illness

## Street Safety
- Use a visible ID bracelet on your child
- Establish meeting points in crowded areas
- Hold hands in busy streets
- Be aware of local traffic patterns

## Digital Safety
- Use VPNs on public WiFi
- Don't overshare location on social media
- Back up photos regularly

Stay safe and enjoy your adventures!
    `,
        image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80',
        category: 'community',
        author: { name: 'Dr. Amanda Foster', avatar: 'https://i.pravatar.cc/150?img=16' },
        publishedAt: '2026-01-18',
        readTime: 7,
        featured: false,
    },
    {
        slug: 'local-meetups-families',
        title: 'Finding Your Tribe: Local Meetups for Traveling Families',
        excerpt: 'Connect with like-minded families around the world through local meetups and community events.',
        content: `
# Finding Your Tribe: Local Meetups for Traveling Families

One of the best parts of travel is connecting with other families.

## Why Meet Other Traveling Families?
- Share tips and recommendations
- Playdates for your kids
- Adult conversation (finally!)
- Build lasting friendships

## How to Find Meetups

### TravelTods Community Events
We host regular meetups in popular family destinations. Check our events calendar!

### Facebook Groups
Local expat and traveling family groups are gold mines for meetup opportunities.

### Hotel Kids Clubs
Great places to meet families staying at the same property.

### Parks and Playgrounds
Strike up conversations—most parents are happy to chat.

## Upcoming TravelTods Meetups

- **Barcelona** - March 15, 2026
- **Tokyo** - April 2, 2026
- **Copenhagen** - April 20, 2026
- **Sydney** - May 5, 2026

Join our community to get notified about meetups near you!
    `,
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
        category: 'community',
        author: { name: 'Rachel Kim', avatar: 'https://i.pravatar.cc/150?img=20' },
        publishedAt: '2026-01-10',
        readTime: 5,
        featured: false,
    },
];

export const getFeaturedPost = (): BlogPost | undefined =>
    BLOG_POSTS.find(post => post.featured);

export const getPostsByCategory = (category: BlogCategory | 'all'): BlogPost[] =>
    category === 'all'
        ? BLOG_POSTS
        : BLOG_POSTS.filter(post => post.category === category);

export const getPostBySlug = (slug: string): BlogPost | undefined =>
    BLOG_POSTS.find(post => post.slug === slug);

export const getRelatedPosts = (currentSlug: string, limit: number = 3): BlogPost[] =>
    BLOG_POSTS.filter(post => post.slug !== currentSlug).slice(0, limit);

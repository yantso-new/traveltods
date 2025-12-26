export interface Attraction {
    type: string;
    name: string;
    rating?: number;
}

// Extended inputs including new data sources
export interface ScoreInputs {
    // Existing infrastructure data (from Overpass)
    playgroundCount: number;
    parkCount: number;
    averageRating: number;         // 0-5 from Google/OTM
    sidewalkWidth: number;         // 0-1 value (normalized ratio of footways)
    pedestrianZones: number;       // 0-1 value
    attractions: Attraction[];     // From OTM
    healthyRestaurants: number;    // Count from OTM
    totalRestaurants: number;      // Count from OTM
    strollerMentions: number;      // Sentiment/count proxy
    wheelchairAccessible: number;  // Count of accessible nodes

    // NEW: Safety infrastructure data (from OSM)
    lightingCount: number;
    policeCount: number;
    hospitalCount: number;
    fireStationCount: number;
    advisoryLevel: 'none' | 'caution' | 'reconsider' | 'avoid';

    // NEW: Weather data (from Open-Meteo, nullable)
    avgTempSummer: number | null;
    avgTempWinter: number | null;
    avgPrecipitation: number | null;

    // NEW: Cost data (from TravelTables, nullable)
    costIndex: number | null;
}

// Data quality tracking
export interface DataQuality {
    completedMetrics: string[];
    missingMetrics: string[];
    completenessScore: number;
    hasReliableOverallScore: boolean;
}

// Extended scores with new metrics
export interface AllScores {
    safety: number;
    playgrounds: number;
    sidewalks: number;
    kidActivities: number;
    healthyFood: number;
    strollerFriendly: number;
    accessibility: number;
    weatherComfort: number;      // NEW
    costAffordability: number;   // NEW
    familyScore: number | null;  // NULLABLE when data incomplete
}

// Track which metrics used real data vs defaults
type MetricSource = 'real' | 'default';
let metricSources: Record<string, MetricSource> = {};

// Reset metric tracking at start of each calculation
function resetMetricTracking() {
    metricSources = {};
}

function trackMetric(name: string, source: MetricSource) {
    metricSources[name] = source;
}

/**
 * 1. Safety Score (NEW: Uses OSM infrastructure proxy + travel advisories)
 * Based on density of safety-related infrastructure within 5km radius
 */
export function calculateSafetyScore(inputs: ScoreInputs): number {
    const hasInfrastructureData = inputs.lightingCount > 0 || inputs.policeCount > 0 ||
        inputs.hospitalCount > 0 || inputs.fireStationCount > 0;

    if (!hasInfrastructureData) {
        trackMetric('safety', 'default');
        return 70; // Default moderate safety score
    }

    trackMetric('safety', 'real');

    // Normalize counts to 0-1 scale based on expected densities for a 5km radius
    // Street lighting: expect ~500+ for well-lit areas
    const lightingDensity = Math.min(inputs.lightingCount / 500, 1.0);
    // Police stations: expect 2-5 for good coverage
    const policeDensity = Math.min(inputs.policeCount / 3, 1.0);
    // Hospitals/clinics: expect 3-10 for good coverage
    const healthcareDensity = Math.min(inputs.hospitalCount / 5, 1.0);
    // Fire stations: expect 1-3 for good coverage
    const fireDensity = Math.min(inputs.fireStationCount / 2, 1.0);

    // Advisory adjustment (-20 to +10)
    let advisoryBonus = 0;
    switch (inputs.advisoryLevel) {
        case 'none': advisoryBonus = 10; break;
        case 'caution': advisoryBonus = 0; break;
        case 'reconsider': advisoryBonus = -20; break;
        case 'avoid': advisoryBonus = -40; break;
    }

    // Weighted calculation
    const baseScore = (lightingDensity * 0.4) + (policeDensity * 0.2) +
        (healthcareDensity * 0.2) + (fireDensity * 0.1);

    // Convert to 0-100 scale and apply advisory adjustment
    const score = (baseScore * 90) + advisoryBonus + 10; // Base 10 points, max 100

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 2. Playgrounds Score
 */
export function calculatePlaygroundsScore(inputs: ScoreInputs): number {
    const hasData = inputs.playgroundCount > 0 || inputs.parkCount > 0;
    trackMetric('playgrounds', hasData ? 'real' : 'default');

    if (!hasData) {
        return 60; // Default moderate score
    }

    const density = Math.min(inputs.playgroundCount / 20, 1.0) * 0.5;
    const rating = ((inputs.averageRating / 5) * 0.3);
    const variety = (inputs.parkCount > 5 ? 1.0 : inputs.parkCount / 5) * 0.2;
    const score = (density + rating + variety) * 100;
    return Math.min(100, Math.round(score));
}

/**
 * 3. Sidewalk Quality Score
 */
export function calculateSidewalkScore(inputs: ScoreInputs): number {
    const hasData = inputs.sidewalkWidth > 0 || inputs.pedestrianZones > 0;
    trackMetric('sidewalks', hasData ? 'real' : 'default');

    if (!hasData) {
        return 60; // Default moderate score
    }

    const width = inputs.sidewalkWidth * 0.4;
    const pedestrian = inputs.pedestrianZones * 0.3;
    const reviews = 0.8 * 0.3; // Static component
    const score = (width + pedestrian + reviews) * 100;
    return Math.min(100, Math.round(score));
}

/**
 * 4. Kid Activities Score
 */
export function calculateKidActivitiesScore(inputs: ScoreInputs): number {
    const hasData = inputs.attractions.length > 0;
    trackMetric('kidActivities', hasData ? 'real' : 'default');

    if (!hasData) {
        return 60; // Default moderate score
    }

    const kinds = ['museum', 'zoo', 'aquarium', 'amusement_park', 'water_park', 'cinema'];
    const byType = inputs.attractions.filter(a => kinds.some(k => a.type.toLowerCase().includes(k))).length;

    const variety = (byType > 0 ? (byType / 3) : 0) * 0.4;
    const count = Math.min(inputs.attractions.length / 10, 1.0) * 0.3;
    const rating = ((inputs.averageRating / 5) * 0.3);
    const score = (variety + count + rating) * 100;
    return Math.min(100, Math.round(score));
}

/**
 * 5. Healthy Food Score
 */
export function calculateHealthyFoodScore(inputs: ScoreInputs): number {
    const hasData = inputs.totalRestaurants > 0;
    trackMetric('healthyFood', hasData ? 'real' : 'default');

    if (!hasData) {
        return 60; // Default moderate score
    }

    const healthyRatio = inputs.healthyRestaurants / inputs.totalRestaurants;
    const ratioConstrained = Math.min(healthyRatio * 5, 1.0) * 0.5;
    const markets = 0.3; // Static component
    const keywords = 0.2; // Static component
    const score = (ratioConstrained + markets + keywords) * 100;
    return Math.min(100, Math.round(score));
}

/**
 * 6. Stroller Friendly Score
 */
export function calculateStrollerFriendlyScore(inputs: ScoreInputs): number {
    const hasData = inputs.sidewalkWidth > 0 || inputs.wheelchairAccessible > 0;
    trackMetric('strollerFriendly', hasData ? 'real' : 'default');

    if (!hasData) {
        return 60; // Default moderate score
    }

    const terrain = 0.8 * 0.3; // Default terrain score
    const accessibility = inputs.sidewalkWidth * 0.4;
    const transit = 0.8 * 0.3; // Default transit score
    const score = (terrain + accessibility + transit) * 100;
    return Math.min(100, Math.round(score));
}

/**
 * 7. General Accessibility Score
 */
export function calculateAccessibilityScore(inputs: ScoreInputs): number {
    const hasData = inputs.wheelchairAccessible > 0;
    trackMetric('accessibility', hasData ? 'real' : 'default');

    if (!hasData) {
        return 60; // Default moderate score
    }

    const facilities = Math.min(inputs.wheelchairAccessible / 50, 1.0) * 0.4;
    const transit = 0.75 * 0.3; // Default transit score
    const restrooms = 0.7 * 0.3; // Default restrooms score
    const score = (facilities + transit + restrooms) * 100;
    return Math.min(100, Math.round(score));
}

/**
 * 8. Weather Comfort Score (NEW)
 * Based on seasonal temperatures and precipitation
 */
export function calculateWeatherComfortScore(inputs: ScoreInputs): number {
    if (inputs.avgTempSummer === null && inputs.avgTempWinter === null) {
        trackMetric('weatherComfort', 'default');
        return 70; // Default moderate weather score
    }

    trackMetric('weatherComfort', 'real');

    // Summer comfort: 20-28°C is ideal for family outdoor activities
    let summerScore = 70; // Default if no summer data
    if (inputs.avgTempSummer !== null) {
        if (inputs.avgTempSummer >= 20 && inputs.avgTempSummer <= 28) {
            summerScore = 100; // Perfect
        } else if (inputs.avgTempSummer > 28 && inputs.avgTempSummer <= 35) {
            summerScore = 100 - ((inputs.avgTempSummer - 28) * 8); // Penalty for heat
        } else if (inputs.avgTempSummer > 35) {
            summerScore = 40; // Too hot
        } else if (inputs.avgTempSummer < 20 && inputs.avgTempSummer >= 15) {
            summerScore = 80; // Mild summer
        } else if (inputs.avgTempSummer < 15) {
            summerScore = 60; // Cool summer
        }
    }

    // Winter comfort: Above 5°C is preferable for outdoor activities with kids
    let winterScore = 70; // Default if no winter data
    if (inputs.avgTempWinter !== null) {
        if (inputs.avgTempWinter >= 10) {
            winterScore = 95; // Mild winter
        } else if (inputs.avgTempWinter >= 5) {
            winterScore = 85; // Cool but manageable
        } else if (inputs.avgTempWinter >= 0) {
            winterScore = 70; // Cold
        } else if (inputs.avgTempWinter >= -10) {
            winterScore = 50; // Very cold
        } else {
            winterScore = 30; // Extreme cold
        }
    }

    // Precipitation: Below 1000mm/year is comfortable
    let precipScore = 80; // Default if no precip data
    if (inputs.avgPrecipitation !== null) {
        if (inputs.avgPrecipitation <= 500) {
            precipScore = 95; // Dry climate
        } else if (inputs.avgPrecipitation <= 800) {
            precipScore = 90; // Low precipitation
        } else if (inputs.avgPrecipitation <= 1000) {
            precipScore = 85; // Moderate
        } else if (inputs.avgPrecipitation <= 1500) {
            precipScore = 70; // Rainy
        } else if (inputs.avgPrecipitation <= 2000) {
            precipScore = 55; // Very rainy
        } else {
            precipScore = 40; // Extremely wet
        }
    }

    // Weighted: 40% summer, 30% winter, 30% precipitation
    const score = (summerScore * 0.4) + (winterScore * 0.3) + (precipScore * 0.3);
    return Math.round(score);
}

/**
 * 9. Cost Affordability Score (NEW)
 * Based on TravelTables cost index (inverted - lower cost = higher score)
 */
export function calculateCostAffordabilityScore(inputs: ScoreInputs): number {
    if (inputs.costIndex === null) {
        trackMetric('costAffordability', 'default');
        return 60; // Default moderate cost score
    }

    trackMetric('costAffordability', 'real');

    // Cost index: Higher = more expensive (NYC baseline ~100)
    // We invert this: lower cost = higher score for families
    const costIndex = inputs.costIndex;
    let score: number;

    if (costIndex <= 30) {
        score = 100; // Very affordable
    } else if (costIndex <= 50) {
        score = 90; // Affordable
    } else if (costIndex <= 70) {
        score = 75; // Moderate
    } else if (costIndex <= 100) {
        score = 60; // Above average cost
    } else if (costIndex <= 130) {
        score = 45; // Expensive
    } else if (costIndex <= 160) {
        score = 30; // Very expensive
    } else {
        score = 20; // Extremely expensive
    }

    return Math.round(score);
}

/**
 * MAIN: Calculate all scores with data quality tracking
 */
export function calculateAllScores(inputs: ScoreInputs): {
    scores: AllScores;
    dataQuality: DataQuality;
} {
    // Reset tracking for this calculation
    resetMetricTracking();

    // Calculate all individual scores
    const safety = calculateSafetyScore(inputs);
    const playgrounds = calculatePlaygroundsScore(inputs);
    const sidewalks = calculateSidewalkScore(inputs);
    const kidActivities = calculateKidActivitiesScore(inputs);
    const healthyFood = calculateHealthyFoodScore(inputs);
    const strollerFriendly = calculateStrollerFriendlyScore(inputs);
    const accessibility = calculateAccessibilityScore(inputs);
    const weatherComfort = calculateWeatherComfortScore(inputs);
    const costAffordability = calculateCostAffordabilityScore(inputs);

    // Determine data quality
    const allMetrics = [
        'safety', 'playgrounds', 'sidewalks', 'kidActivities',
        'healthyFood', 'strollerFriendly', 'accessibility',
        'weatherComfort', 'costAffordability'
    ];

    const completedMetrics = allMetrics.filter(m => metricSources[m] === 'real');
    const missingMetrics = allMetrics.filter(m => metricSources[m] !== 'real');
    const completenessScore = Math.round((completedMetrics.length / allMetrics.length) * 100);
    const hasReliableOverallScore = completedMetrics.length >= 5; // Need 5+ real metrics

    // Calculate family score only if data is reliable
    let familyScore: number | null = null;

    if (hasReliableOverallScore) {
        // Updated weights for 9 metrics (sum = 1.0)
        const weights = {
            safety: 0.15,
            playgrounds: 0.15,
            sidewalks: 0.08,
            kidActivities: 0.15,
            healthyFood: 0.08,
            strollerFriendly: 0.12,
            accessibility: 0.07,
            weatherComfort: 0.10,
            costAffordability: 0.10,
        };

        const weightedSum =
            (safety * weights.safety) +
            (playgrounds * weights.playgrounds) +
            (sidewalks * weights.sidewalks) +
            (kidActivities * weights.kidActivities) +
            (healthyFood * weights.healthyFood) +
            (strollerFriendly * weights.strollerFriendly) +
            (accessibility * weights.accessibility) +
            (weatherComfort * weights.weatherComfort) +
            (costAffordability * weights.costAffordability);

        familyScore = Math.round(weightedSum);
    }

    return {
        scores: {
            safety,
            playgrounds,
            sidewalks,
            kidActivities,
            healthyFood,
            strollerFriendly,
            accessibility,
            weatherComfort,
            costAffordability,
            familyScore,
        },
        dataQuality: {
            completedMetrics,
            missingMetrics,
            completenessScore,
            hasReliableOverallScore,
        },
    };
}

export interface RadarDataPoint {
    subject: string;
    A: number; // Score
    fullMark: number;
}

/**
 * Generate radar chart data (7 dimensions)
 */
export function getRadarChartData(scores: AllScores): RadarDataPoint[] {
    return [
        { subject: 'Safety', A: scores.safety, fullMark: 100 },
        { subject: 'Play', A: scores.playgrounds, fullMark: 100 },
        { subject: 'Activities', A: scores.kidActivities, fullMark: 100 },
        { subject: 'Weather', A: scores.weatherComfort, fullMark: 100 },
        { subject: 'Cost', A: scores.costAffordability, fullMark: 100 },
        { subject: 'Access', A: scores.accessibility, fullMark: 100 },
        { subject: 'Stroller', A: scores.strollerFriendly, fullMark: 100 },
    ];
}

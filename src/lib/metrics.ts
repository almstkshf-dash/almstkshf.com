interface Metrics {
    reach: number;
    ave: number;
}

// ═══════════════════════════════════════════════════════════════════
// Known Publisher Reach Database (UAE & GCC Focus)
// ═══════════════════════════════════════════════════════════════════
const PUBLISHER_REACH: Record<string, number> = {
    "Gulf News": 5000000,
    "Khaleej Times": 4500000,
    "The National": 3000000,
    "Al Bayan": 2000000,
    "Emarat Al Youm": 1800000,
    "Al Ittihad": 1500000,
    "Arabian Business": 1200000,
    "Gulf Business": 800000,
    "Gulf Today": 700000,
    "Al Roeya": 600000,
    "Al Watan": 500000,
    "Al Arabiya": 8000000,
    "Al Jazeera": 10000000,
    "Sky News Arabia": 3500000,
    "CNN Arabic": 2500000,
    "RT Arabic": 1500000,
    "Asharq Al-Awsat": 2000000,
    "Reuters": 15000000,
    "Bloomberg": 10000000,
    "BBC": 20000000,
};

const DEFAULT_REACH = 50000;

// ═══════════════════════════════════════════════════════════════════
// AVE FORMULA: Reach × Conversion Rate (0.02) × CPM ($5)
// This is the standard formula agreed upon.
// ═══════════════════════════════════════════════════════════════════
const AVE_CONVERSION_RATE = 0.02;
const AVE_CPM = 5; // $5 per thousand impressions

export function calculateMetrics(
    publisherName: string,
    customReach?: number,
    customMultiplier?: number
): Metrics {
    // 1. Determine Reach
    let reach = customReach;

    if (reach === undefined || reach === null || reach === 0) {
        // Normalize name for lookup (case-insensitive)
        const normalizedName = Object.keys(PUBLISHER_REACH).find(
            key => key.toLowerCase() === publisherName.toLowerCase()
        );
        reach = normalizedName ? PUBLISHER_REACH[normalizedName] : DEFAULT_REACH;
    }

    // 2. Calculate AVE
    // Formula: Reach × 0.02 × $5 = Reach × 0.1
    const multiplier = customMultiplier || (AVE_CONVERSION_RATE * AVE_CPM);
    const ave = Math.round(reach * multiplier);

    return { reach, ave };
}

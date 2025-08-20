export const CONFIG = {
    DATABASE: {
        MAX_CONNECTIONS: 10,
        CONNECTION_TIMEOUT: 30000,
        IDLE_TIMEOUT: 10000
    },
    PROCESSING: {
        BATCH_SIZE: 3, // Réduit de 5 à 3 pour moins de connexions
        DELAY_BETWEEN_BATCHES: 500, // Augmenté de 200ms à 500ms
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000, // millisecondes
        PARALLEL_PROCESSING: false // Désactivé pour éviter les connexions multiples
    },
    LOGGING: {
        LEVEL: 'info',
        SHOW_TIMESTAMPS: true,
        SHOW_PROGRESS: true
    },
    VALIDATION: {
        STRICT_MODE: false,
        SKIP_INVALID_ITEMS: true
    }
};

export const NETWORK_ALIASES = {
    // Mappage des noms de réseaux pour normalisation
    'Netflix': 'Netflix',
    'netflix': 'Netflix',
    'NETFLIX': 'Netflix',
    'Amazon Prime': 'Amazon Prime',
    'amazon prime': 'Amazon Prime',
    'AmazonPrime': 'Amazon Prime',
    'HBO Max': 'HBO Max',
    'hbo max': 'HBO Max',
    'HBOMax': 'HBO Max',
    'Disney+': 'Disney+',
    'disney+': 'Disney+',
    'Disney Plus': 'Disney+',
    'Hulu': 'Hulu',
    'hulu': 'Hulu',
    'HULU': 'Hulu'
};

export const COUNTRY_ALIASES = {
    // Mappage des noms de pays pour normalisation
    'USA': 'USA',
    'United States': 'USA',
    'US': 'USA',
    'UK': 'UK',
    'United Kingdom': 'UK',
    'Great Britain': 'UK',
    'South Korea': 'South Korea',
    'Korea': 'South Korea',
    'Poland': 'Poland',
    'Poland/USA': 'Poland/USA'
};

export function getNormalizedNetwork(network) {
    return NETWORK_ALIASES[network] || network;
}

export function getNormalizedCountry(country) {
    return COUNTRY_ALIASES[country] || country;
}

export function isDevelopment() {
    return process.env.NODE_ENV === 'development';
}

export function isProduction() {
    return process.env.NODE_ENV === 'production';
}

// Fonctions utilitaires pour le traitement par lots
export function calculateBatchProgress(currentIndex, totalCount, batchSize) {
    const currentBatch = Math.floor(currentIndex / batchSize) + 1;
    const totalBatches = Math.ceil(totalCount / batchSize);
    const progress = (currentIndex / totalCount) * 100;
    
    return {
        currentBatch,
        totalBatches,
        progress: Math.min(progress, 100),
        itemsProcessed: currentIndex,
        itemsRemaining: totalCount - currentIndex
    };
}

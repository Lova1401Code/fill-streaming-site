export const CONFIG = {
    // Configuration de la base de données
    DATABASE: {
        // Ces valeurs peuvent être surchargées par les variables d'environnement
        URL: process.env.DATABASE_URL || "postgresql://username:password@localhost:5432/your_database_name",
        TIMEOUT: 30000, // 30 secondes
        MAX_CONNECTIONS: 10
    },
    
    // Configuration du traitement par lots
    PROCESSING: {
        BATCH_SIZE: 5, // Taille de chaque lot
        DELAY_BETWEEN_BATCHES: 200, // millisecondes entre les lots
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000, // millisecondes
        PARALLEL_PROCESSING: true // Traitement en parallèle dans chaque lot
    },
    
    // Configuration des logs
    LOGGING: {
        LEVEL: process.env.LOG_LEVEL || 'INFO', // DEBUG, INFO, WARN, ERROR
        SHOW_TIMESTAMPS: true,
        SHOW_PROGRESS: true,
        SHOW_BATCH_PROGRESS: true // Afficher le progrès par lot
    },
    
    // Configuration de validation
    VALIDATION: {
        STRICT_MODE: false, // Si true, arrête le traitement en cas d'erreur
        SKIP_INVALID_ITEMS: true,
        LOG_VALIDATION_ERRORS: true
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

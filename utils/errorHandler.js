export class StreamingDataError extends Error {
    constructor(message, item, type = 'UNKNOWN') {
        super(message);
        this.name = 'StreamingDataError';
        this.item = item;
        this.type = type;
        this.timestamp = new Date();
    }
}

export function logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorInfo = {
        timestamp,
        context,
        message: error.message,
        stack: error.stack,
        type: error.type || 'UNKNOWN',
        item: error.item || null
    };
    
    console.error(`❌ [${timestamp}] Erreur ${context}:`, errorInfo);
    
    // Log plus détaillé pour les erreurs de données
    if (error.item) {
        console.error(`   Item problématique:`, error.item);
    }
    
    return errorInfo;
}

export function validateStreamingItem(item) {
    const errors = [];
    
    if (!item.name_film) {
        errors.push('Champ "name_film" manquant');
    }
    
    if (!item.network) {
        errors.push('Champ "network" manquant');
    }
    
    if (!item.year) {
        errors.push('Champ "year" manquant');
    }
    
    if (!item.country) {
        errors.push('Champ "country" manquant');
    }
    
    if (errors.length > 0) {
        throw new StreamingDataError(
            `Données invalides: ${errors.join(', ')}`,
            item,
            'VALIDATION_ERROR'
        );
    }
    
    return true;
}

export function sanitizeStreamingItem(item) {
    return {
        name_film: String(item.name_film || '').trim(),
        network: Array.isArray(item.network) ? item.network : [item.network],
        runtime: parseInt(item.runtime) || 0,
        year: parseInt(item.year) || 0,
        country: String(item.country || '').trim()
    };
}

// apiClient.js
async function request(url, options = {}) {
    // Configuration par défaut pour toutes les requêtes
    const defaultOptions = {
        credentials: 'include', // Cookie envoyé automatiquement
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options
    };

    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.title || "Erreur serveur");
        error.response = errorData; // On attache le JSON d'erreurs ici !
        throw error;
    }

    // Gestion du corps vide (comme pour le login ou le delete)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
        return null;
    }

    return await response.json();
}

export const client = {
    get: (url) => request(url, { method: 'GET' }),
    post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (url) => request(url, { method: 'DELETE' }),
};

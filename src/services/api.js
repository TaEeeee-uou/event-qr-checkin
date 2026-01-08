export const ApiUtils = {
    /**
     * Generic POST request to GAS
     * @param {string} action - The action name (e.g., 'ping')
     * @param {object} payload - Additional data
     * @param {object} config - Must contain { webappUrl, apiToken }
     */
    call: async (action, payload = {}, config) => {
        if (!config.webappUrl || !config.apiToken) {
            throw new Error("Configuration missing (URL or Token)");
        }

        const body = {
            token: config.apiToken,
            action: action,
            ...payload
        };

        try {
            const response = await fetch(config.webappUrl, {
                method: "POST",
                // GAS often requires avoiding complex CORS preflights, but standard is:
                headers: { "Content-Type": "application/json" },
                // Sometimes GAS redirects, so follow is important
                redirect: "follow",
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const json = await response.json();
            return json;
        } catch (err) {
            console.error(`API Error [${action}]:`, err);
            // Return a structured error to the app
            return { ok: false, error: err.message, isNetworkError: true };
        }
    },

    // Convenience methods
    ping: (config) => ApiUtils.call('ping', {}, config),

    getAttendees: (config) => ApiUtils.call('getAttendees', {}, config),

    upsertAttendees: (rows, config) => ApiUtils.call('upsertAttendees', { rows }, config),

    checkIn: (id, config) => ApiUtils.call('checkIn', { id }, config),

    undoCheckIn: (id, config) => ApiUtils.call('undoCheckIn', { id }, config)
};

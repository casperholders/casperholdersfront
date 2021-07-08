const API_BASE_URL = process.env.VUE_APP_API;

export class Api {
    static async fetch(endpoint, init = {}) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            ...init,
        });

        return response.json();
    }

    static async get(endpoint, init = {}) {
        return Api.fetch(endpoint, init);
    }

    static post(endpoint, data, init = {}) {
        return Api.fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
            ...init,
        });
    }
}
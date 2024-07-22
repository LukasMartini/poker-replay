
const API_URL = process.env.NEXT_PUBLIC_API_URL;


// Helper function to get headers
function getHeaders(token?: string): HeadersInit {
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    return {'Content-Type': 'application/json'};
}

// Function to perform GET request
async function get(endpoint: string, token?: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(token)
    });
    return response;
}

// Function to perform POST request
async function post(endpoint: string, data: object, token?: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data)
    });
    return response;
}

export const fetchHandSummary = (searchTerm: string, token: string) => get(`hand_summary/${searchTerm}`, token);
export const fetchPlayerActions = (searchTerm: string, token: string) => get(`player_actions/${searchTerm}`, token);
export const fetchPlayerCards = (searchTerm: string, token: string) => get(`player_cards/${searchTerm}`, token);
export const fetchHandCount = (token: string) => get(`hand_count`, token);
export const fetchCashFlow = (sessionid: string, limit: number, offset: number, token: string) => get(`cash_flow?sessionid=${sessionid}&limit=${limit}&offset=${offset}`, token);
export const fetchCashFlowByUser = (limit: number, offset: number, token: string) => get(`cash_flow?limit=${limit}&offset=${offset}`, token);
export const loginUser = (credentials: FormData) => post(`login`, Object.fromEntries(credentials));
export const signupUser = (formData: FormData) => post(`signup`, Object.fromEntries(formData));
export const uploadFiles = (files: FormData, token: string) => post(`upload`, files, token);
export const authorizeUser = (token: string) => post(`authorize`, {}, token);
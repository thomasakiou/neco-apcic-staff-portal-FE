import { LoginResponse, StaffProfile, APCData, PostingListResponse, MessageResponse, AssignmentData, AssignmentListResponse } from '../types';

const API_BASE = '/api/staff-portal';


class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let message = 'Request failed';
        try {
            const error = await response.json();
            message = error.detail || error.message || message;
        } catch {
            message = response.statusText;
        }
        throw new ApiError(response.status, message);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
        return {} as T;
    }

    return JSON.parse(text);
}

// Login with staff number and DOB
export async function login(staffNumber: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>(`${API_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify({
            staff_number: staffNumber,
            password: password,
        }),
    });
}

// Get current staff profile (SDL data)
export async function getProfile(token: string): Promise<StaffProfile> {
    return request<StaffProfile>(`${API_BASE}/me`, {}, token);
}

// Update contact information
export async function updateContact(
    token: string,
    phone: string,
    email: string
): Promise<MessageResponse> {
    return request<MessageResponse>(
        `${API_BASE}/me/contact`,
        {
            method: 'PUT',
            body: JSON.stringify({ phone, email }),
        },
        token
    );
}

// Staff type for APC/Posting endpoints
export type StaffType = 'regular' | 'hod' | 'drivers' | 'typesetting';

// Get APC data based on staff type
export async function getAPC(token: string, staffType: StaffType = 'regular'): Promise<APCData | null> {
    try {
        const endpointMap: Record<StaffType, string> = {
            'regular': `${API_BASE}/me/apc`,
            'hod': `${API_BASE}/me/hod-apc`,
            'drivers': `${API_BASE}/me/drivers-apc`,
            'typesetting': `${API_BASE}/me/typesetting-apc`,
        };
        const endpoint = endpointMap[staffType];
        return await request<APCData>(endpoint, {}, token);
    } catch (error) {
        // Return null if no APC data exists
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
}

// Get posting history based on staff type
export async function getPostings(token: string, staffType: StaffType = 'regular'): Promise<PostingListResponse> {
    const endpointMap: Record<StaffType, string> = {
        'regular': `${API_BASE}/me/posting`,
        'hod': `${API_BASE}/me/hod-posting`,
        'drivers': `${API_BASE}/me/drivers-posting`,
        'typesetting': `${API_BASE}/me/typesetting-posting`,
    };
    const endpoint = endpointMap[staffType];
    return request<PostingListResponse>(endpoint, {}, token);
}

// Get all assignments (for mapping codes to names)
export async function getAssignments(token: string): Promise<AssignmentData[]> {
    try {
        const response = await request<AssignmentListResponse>(`${API_BASE}/assignments`, {}, token);
        return response.items || [];
    } catch {
        return [];
    }
}

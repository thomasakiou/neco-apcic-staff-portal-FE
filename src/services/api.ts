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

// Get APC data (regular or HOD based on isHod flag)
export async function getAPC(token: string, isHod: boolean = false): Promise<APCData | null> {
    try {
        const endpoint = isHod ? `${API_BASE}/me/hod-apc` : `${API_BASE}/me/apc`;
        return await request<APCData>(endpoint, {}, token);
    } catch (error) {
        // Return null if no APC data exists
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
}

// Get posting history (regular or HOD based on isHod flag)
export async function getPostings(token: string, isHod: boolean = false): Promise<PostingListResponse> {
    const endpoint = isHod ? `${API_BASE}/me/hod-posting` : `${API_BASE}/me/posting`;
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

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StaffProfile, APCData, PostingData } from '../types';
import * as api from '../services/api';

interface User {
    token: string;
    fileno: string;
}

interface AuthContextType {
    user: User | null;
    profile: StaffProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (staffNumber: string, password: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
    updateContact: (phone: string, email: string) => Promise<void>;
    getAPC: () => Promise<APCData | null>;
    getPostings: () => Promise<PostingData[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'neco-staff-portal-token';
const FILENO_KEY = 'neco-staff-portal-fileno';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        const fileno = localStorage.getItem(FILENO_KEY);
        if (token && fileno) {
            return { token, fileno };
        }
        return null;
    });
    const [profile, setProfile] = useState<StaffProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load profile on mount if we have a token
    useEffect(() => {
        const loadProfile = async () => {
            if (user?.token) {
                try {
                    const profileData = await api.getProfile(user.token);
                    setProfile(profileData);
                } catch (error) {
                    console.error('Failed to load profile:', error);
                    // Token might be expired, clear it
                    logout();
                }
            }
            setIsLoading(false);
        };
        loadProfile();
    }, [user?.token]);

    const login = async (staffNumber: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.login(staffNumber, password);
            const newUser = { token: response.access_token, fileno: staffNumber };

            localStorage.setItem(TOKEN_KEY, response.access_token);
            localStorage.setItem(FILENO_KEY, staffNumber);
            setUser(newUser);

            // Fetch profile after login
            const profileData = await api.getProfile(response.access_token);
            setProfile(profileData);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(FILENO_KEY);
        setUser(null);
        setProfile(null);
    };

    const refreshProfile = async () => {
        if (!user?.token) return;
        const profileData = await api.getProfile(user.token);
        setProfile(profileData);
    };

    const updateContact = async (phone: string, email: string) => {
        if (!user?.token) throw new Error('Not authenticated');
        await api.updateContact(user.token, phone, email);
        await refreshProfile();
    };

    const getAPC = async (): Promise<APCData | null> => {
        if (!user?.token) throw new Error('Not authenticated');
        return api.getAPC(user.token, profile?.is_hod || false);
    };

    const getPostings = async (): Promise<PostingData[]> => {
        if (!user?.token) throw new Error('Not authenticated');
        const response = await api.getPostings(user.token, profile?.is_hod || false);
        return response.items || [];
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshProfile,
                updateContact,
                getAPC,
                getPostings,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

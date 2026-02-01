import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { StaffProfile, APCData, PostingData, AssignmentData } from '../types';
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
    getAssignments: () => Promise<AssignmentData[]>;
    refreshData: () => void; // allow manual refresh
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

    // Data Caches (undefined = not fetched, null = fetched but empty/404)
    const [apcCache, setApcCache] = useState<APCData | null | undefined>(undefined);
    const [postingsCache, setPostingsCache] = useState<PostingData[] | undefined>(undefined);
    const [assignmentsCache, setAssignmentsCache] = useState<AssignmentData[] | undefined>(undefined);

    // In-flight promises to deduplicate simultaneous requests
    const apcPromise = useRef<Promise<APCData | null> | null>(null);
    const postingsPromise = useRef<Promise<PostingData[]> | null>(null);
    const assignmentsPromise = useRef<Promise<AssignmentData[]> | null>(null);

    // Load profile on mount if we have a token
    useEffect(() => {
        const loadProfile = async () => {
            if (user?.token) {
                try {
                    const profileData = await api.getProfile(user.token);
                    refreshData();
                    setProfile(profileData);

                    // Pre-fetch data in background to speed up UI
                    // We don't await this here to avoid blocking initial auth check
                    // But we allow slightly later execution to ensure isHod is correct 
                    // (profileData is passed to state, but for fetch we need 'profile' state or use the data directly)
                    // We can't use the state 'profile' yet as it updates next render.
                    // We also can't easily prefetch here without duplicating logic.
                    // Easiest is to let components request it, but cache it.
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
        const response = await api.login(staffNumber, password);
        const newUser = { token: response.access_token, fileno: staffNumber };

        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(FILENO_KEY, staffNumber);
        setUser(newUser);

        // Fetch profile after login
        const profileData = await api.getProfile(response.access_token);
        refreshData();
        setProfile(profileData);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(FILENO_KEY);
        setUser(null);
        setProfile(null);

        // Clear caches
        setApcCache(undefined);
        setPostingsCache(undefined);
        setAssignmentsCache(undefined);
        apcPromise.current = null;
        postingsPromise.current = null;
        assignmentsPromise.current = null;
    };

    const refreshProfile = async () => {
        if (!user?.token) return;
        const profileData = await api.getProfile(user.token);
        refreshData();
        setProfile(profileData);
    };

    const updateContact = async (phone: string, email: string) => {
        if (!user?.token) throw new Error('Not authenticated');
        await api.updateContact(user.token, phone, email);
        await refreshProfile();
    };

    const refreshData = () => {
        setApcCache(undefined);
        setPostingsCache(undefined);
        setAssignmentsCache(undefined);
        apcPromise.current = null;
        postingsPromise.current = null;
        assignmentsPromise.current = null;
    };

    const getAPC = async (): Promise<APCData | null> => {
        if (!user?.token) throw new Error('Not authenticated');

        if (apcCache !== undefined) return apcCache;
        if (apcPromise.current) return apcPromise.current;

        const promise = (async () => {
            try {
                // Determine staff type: HOD > Drivers > Typesetting > Regular
                let staffType: api.StaffType = 'regular';
                if (profile?.is_hod) {
                    staffType = 'hod';
                } else if (profile?.is_driver) {
                    staffType = 'drivers';
                } else if (profile?.is_typesetting) {
                    staffType = 'typesetting';
                }
                const data = await api.getAPC(user.token, staffType);
                setApcCache(data);
                return data;
            } catch (e) {
                // If error, do not cache invalid state (unless 404 which returns null via api)
                apcPromise.current = null;
                throw e;
            }
        })();

        apcPromise.current = promise;
        return promise;
    };

    const getPostings = async (): Promise<PostingData[]> => {
        if (!user?.token) throw new Error('Not authenticated');

        if (postingsCache !== undefined) return postingsCache;
        if (postingsPromise.current) return postingsPromise.current;

        const promise = (async () => {
            try {
                // Determine staff type: HOD > Drivers > Typesetting > Regular
                let staffType: api.StaffType = 'regular';
                if (profile?.is_hod) {
                    staffType = 'hod';
                } else if (profile?.is_driver) {
                    staffType = 'drivers';
                } else if (profile?.is_typesetting) {
                    staffType = 'typesetting';
                }
                const response = await api.getPostings(user.token, staffType);
                const items = response.items || [];
                setPostingsCache(items);
                return items;
            } catch (e) {
                postingsPromise.current = null;
                throw e;
            }
        })();

        postingsPromise.current = promise;
        return promise;
    };

    const getAssignments = async (): Promise<AssignmentData[]> => {
        if (!user?.token) throw new Error('Not authenticated');

        if (assignmentsCache !== undefined) return assignmentsCache;
        if (assignmentsPromise.current) return assignmentsPromise.current;

        const promise = (async () => {
            try {
                const data = await api.getAssignments(user.token);
                setAssignmentsCache(data);
                return data;
            } catch (e) {
                assignmentsPromise.current = null;
                throw e;
            }
        })();

        assignmentsPromise.current = promise;
        return promise;
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
                getAssignments,
                refreshData,
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

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchUserProfile } from '../lib/auth';
import type { AuthContextType, Profile } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAndSetUser = useCallback(async (userId: string, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            const profile = await fetchUserProfile(userId);
            if (profile) {
                setUser(profile);
                return;
            }
            // Wait before retrying
            await new Promise(res => setTimeout(res, 1000 * (i + 1)));
        }
        console.error("Failed to fetch user profile after multiple retries.");
        // Potentially sign out the user if profile is critical
        await supabase.auth.signOut();
    }, []);

    useEffect(() => {
        setLoading(true);
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await fetchAndSetUser(session.user.id);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchAndSetUser]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const switchToSeller = useCallback(() => {
        if (user) {
            setUser({ ...user, role: 'seller' });
        }
    }, [user]);

    const switchToBuyer = useCallback(() => {
        if (user) {
            setUser({ ...user, role: 'buyer' });
        }
    }, [user]);

    const value = useMemo(() => ({
        isAuthenticated: !!user,
        user,
        loading,
        signOut,
        switchToSeller,
        switchToBuyer,
    }), [user, loading, switchToSeller, switchToBuyer]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

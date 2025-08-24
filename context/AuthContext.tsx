import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchUserProfile } from '../lib/auth';
import type { AuthContextType, Profile } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true); // Only for the initial session check

    useEffect(() => {
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id);
                setUser(profile);
            }
            setLoading(false);
        };

        checkInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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
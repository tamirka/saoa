import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { AuthContextType, User } from '../types';
import { supabase } from '../lib/supabaseClient';
import { fetchUserProfile } from '../lib/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await fetchUserProfile(session.user.id, session.user.email!);
                setUser(profile);
            }
            setIsLoading(false);
        };
        
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                 const profile = await fetchUserProfile(session.user.id, session.user.email!);
                 setUser(profile);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        supabase.auth.signOut();
        setUser(null);
    };

    const switchRole = () => {
        // In a real app, this might involve more complex logic or a DB update.
        // For now, we'll just toggle the state for the UI.
        setUser(currentUser => {
            if (!currentUser) return null;
            return {
                ...currentUser,
                role: currentUser.role === 'buyer' ? 'seller' : 'buyer',
            };
        });
    };

    const value = useMemo(() => ({
        isAuthenticated: !!user,
        user,
        login,
        logout,
        switchRole,
    }), [user]);

    // Don't render children until session is checked
    if (isLoading) {
        return null; // Or a global loading spinner
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

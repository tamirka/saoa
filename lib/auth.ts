import { supabase } from './supabaseClient';
import type { User } from '../types';

/**
 * Signs up a new user with Supabase Auth and creates a corresponding profile.
 * @param name - The user's full name.
 * @param email - The user's email.
 * @param password - The user's password.
 * @param role - The user's selected role ('buyer' or 'seller').
 * @returns An object with the user data or an error.
 */
export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string,
  role: 'buyer' | 'seller'
): Promise<{ user: User | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, error: new Error("Backend service is not available.") };
  }

  // The profile creation is handled by a database trigger,
  // so we pass the extra data here.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: role,
      },
    },
  });

  if (error) {
    return { user: null, error: new Error(error.message) };
  }
  if (!data.user) {
    return { user: null, error: new Error("Signup failed, no user returned.") };
  }

  // The trigger `on_auth_user_created` will create the profile.
  // We can assume the profile is created and return the user object.
  const user: User = {
    id: data.user.id,
    name: name,
    email: data.user.email!,
    role: role,
  };

  return { user, error: null };
};


/**
 * Signs in a user with email and password. The user profile is fetched
 * separately by the AuthContext listener.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns An object with an error if one occurred.
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ error: Error | null }> => {
    if (!supabase) {
        return { error: new Error("Backend service is not available.") };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: new Error(error.message) };
    }
    
    return { error: null };
};

/**
 * Signs out the current user.
 * @returns An object with an error if one occurred.
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
    if (!supabase) {
        return { error: new Error("Backend service is not available.") };
    }
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
};

/**
 * Fetches the current user's profile from the database.
 * @param userId - The ID of the user.
 * @returns The user object or null.
 */
export const fetchUserProfile = async (userId: string, email: string): Promise<User | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', userId)
        .maybeSingle();
    
    if (error) {
        console.error("Error fetching profile on auth change:", error);
        return null;
    }

    if (!data) {
        // Profile not found, not necessarily an error. AuthContext will handle retries.
        return null;
    }

    return {
        id: userId,
        name: data.full_name,
        email: email,
        role: data.role as 'buyer' | 'seller'
    };
};
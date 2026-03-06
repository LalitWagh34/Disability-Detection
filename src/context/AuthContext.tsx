'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, User, Assessment } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string) => Promise<boolean>;
    signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    addXp: (amount: number) => Promise<void>;
    loseHeart: () => Promise<void>;
    refillHearts: () => Promise<void>;
    completeUnit: (unitId: string) => Promise<void>;
    buyPowerUp: (powerUpId: string, cost: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false, // Default value for isLoading
    login: async () => false, // Default dummy function
    signup: async () => false, // Default dummy function
    logout: () => { }, // Default dummy function
    updateProfile: async () => { }, // Default dummy function
    addXp: async () => { }, // Default dummy function
    loseHeart: async () => { }, // Default dummy function
    refillHearts: async () => { }, // Default dummy function
    completeUnit: async () => { }, // Default dummy function
    buyPowerUp: async () => false, // Default dummy function
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Retrieve active user from DB when userId changes
    const user = useLiveQuery(
        () => (userId ? db.users.get(userId) : undefined),
        [userId]
    ) ?? null; // Default to null if undefined

    // On mount, check localStorage for existing session
    useEffect(() => {
        const storedId = localStorage.getItem('learnable_user_id');
        if (storedId) {
            setUserId(parseInt(storedId, 10));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        setIsLoading(true);
        try {
            // Simple lookup for prototype (no password check for now)
            const foundUser = await db.users.where('email').equals(email).first();
            if (foundUser) {
                setUserId(foundUser.id);
                localStorage.setItem('learnable_user_id', foundUser.id.toString());
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (userData: Omit<User, 'id' | 'createdAt' | 'xp' | 'level' | 'streak' | 'hearts' | 'gems' | 'completedUnits' | 'lastLogin'>) => {
        setIsLoading(true);
        try {
            const existing = await db.users.where('email').equals(userData.email).first();
            if (existing) {
                alert("Email already exists!"); // Kept alert as per original, but the provided snippet removed it. Reverting to original behavior for this line.
                return false;
            }

            const id = await db.users.add({
                ...userData,
                createdAt: new Date().toISOString(),
                // Initialize Gamification Stats
                xp: 0,
                level: 1,
                streak: 0,
                hearts: 5,
                gems: 0,
                completedUnits: [],
                lastLogin: new Date().toISOString()
            });

            setUserId(id);
            localStorage.setItem('learnable_user_id', id.toString());
            return true;
        } catch (error) {
            console.error("Signup error:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUserId(null);
        localStorage.removeItem('learnable_user_id');
        // Optional: Redirect to home or login logic handled by components
    };

    const updateProfile = async (data: Partial<User>) => { // Changed parameter name from updates to data
        if (!userId) return;
        await db.users.update(userId, data); // Used userId instead of user.id for consistency with existing logic
    };

    // Gamification Helpers
    const addXp = async (amount: number) => {
        if (!user || !user.id) return;
        const newXp = (user.xp || 0) + amount;
        const newLevel = Math.floor(newXp / 100) + 1; // Simple level curve
        await db.users.update(user.id, { xp: newXp, level: newLevel, gems: (user.gems || 0) + Math.floor(amount / 10) });
    };

    const loseHeart = async () => {
        if (!user || !user.id) return;
        const currentHearts = user.hearts ?? 5;
        if (currentHearts > 0) {
            await db.users.update(user.id, { hearts: currentHearts - 1 });
        }
    };

    const refillHearts = async () => {
        if (!user || !user.id) return;
        // Cost 50 gems to refill
        if ((user.gems ?? 0) >= 50) {
            await db.users.update(user.id, { hearts: 5, gems: (user.gems ?? 0) - 50 });
        } else {
            alert("Not enough gems to refill hearts!");
        }
    };

    const completeUnit = async (unitId: string) => {
        if (!user || !user.id) return;
        const currentUnits = user.completedUnits || [];
        if (!currentUnits.includes(unitId)) {
            await db.users.update(user.id, { completedUnits: [...currentUnits, unitId] });
        }
    };

    const buyPowerUp = async (powerUpId: string, cost: number) => {
        if (!user || !user.id) return false;
        if ((user.gems ?? 0) >= cost) {
            // In a real app, you'd add the power-up to the user's inventory
            // For now, just deduct gems
            await db.users.update(user.id, { gems: (user.gems ?? 0) - cost });
            console.log(`User ${user.id} bought power-up ${powerUpId} for ${cost} gems.`);
            return true;
        } else {
            alert("Not enough gems to buy this power-up!");
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile, addXp, loseHeart, refillHearts, completeUnit, buyPowerUp }}>
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

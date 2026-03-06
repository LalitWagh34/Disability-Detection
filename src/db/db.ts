import Dexie, { type EntityTable } from 'dexie';

interface User {
    id: number;
    email: string;
    password?: string; // In a real app, this would be hashed. For this prototype, it's plain text (client-side only).
    name: string;
    age: number;
    profileImage?: string; // Base64 or URL
    createdAt: string;

    // Gamification
    xp?: number;
    level?: number;
    streak?: number;
    hearts?: number;
    gems?: number;
    lastLogin?: string;
    completedUnits?: string[]; // Array of Unit IDs
}

interface Assessment {
    id: number;
    userId: number;
    type: 'dyslexia' | 'dysgraphia' | 'dyscalculia';
    score?: number;
    total?: number;
    risk: 'Low' | 'Moderate' | 'High';
    details?: any; // Flexible JSON for specific test details
    date: string;
}

const db = new Dexie('LearnAbleDB') as Dexie & {
    users: EntityTable<User, 'id'>;
    assessments: EntityTable<Assessment, 'id'>;
};

// Schema declaration:
db.version(1).stores({
    users: '++id, email, name, age', // Primary key and indexed props
    assessments: '++id, userId, type, date'
});

export type { User, Assessment };
export { db };

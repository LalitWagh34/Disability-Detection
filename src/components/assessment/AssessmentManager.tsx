'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DyslexiaTest } from './DyslexiaTest';
import { DysgraphiaTest } from './DysgraphiaTest';
import { DyscalculiaTest } from './DyscalculiaTest';
import { useAuth } from '@/context/AuthContext';

type AssessmentType = 'dyslexia' | 'dysgraphia' | 'dyscalculia';

interface AssessmentManagerProps {
    initialType: AssessmentType;
}

export function AssessmentManager({ initialType }: AssessmentManagerProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [currentType, setCurrentType] = React.useState<AssessmentType>(initialType);

    // If user is not logged in, we might want to redirect or show a warning
    // But for now, we'll let them proceed (results just won't be saved effectively without user ID)

    const handleComplete = (nextType: AssessmentType | 'report') => {
        if (nextType === 'report') {
            router.push('/report');
        } else {
            setCurrentType(nextType);
            // Optional: Update URL without full reload to reflect current step
            window.history.pushState({}, '', `/assessment/${nextType}`);
        }
    };

    if (currentType === 'dyslexia') {
        return <DyslexiaTest onComplete={() => handleComplete('dysgraphia')} />;
    }

    if (currentType === 'dysgraphia') {
        // Pass age from user profile if available, otherwise component might fallback or ask (but plan says dont ask)
        return <DysgraphiaTest onComplete={() => handleComplete('dyscalculia')} />;
    }

    if (currentType === 'dyscalculia') {
        return <DyscalculiaTest onComplete={() => handleComplete('report')} />;
    }

    return null;
}

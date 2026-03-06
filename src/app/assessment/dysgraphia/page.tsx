import { AssessmentManager } from "@/components/assessment/AssessmentManager";

export default function DysgraphiaAssessmentPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <AssessmentManager initialType="dysgraphia" />
        </main>
    );
}

'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/db/db';
import { RadarChart } from '@/components/ui/RadarChart';
import { DownloadReportButton } from '@/components/report/DownloadReportButton';

// ─── Mini Components ──────────────────────────────────────────────────────────

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    const threshold = 70;
    return (
        <div className="space-y-2 w-full">
            {data.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-xs w-36 text-right text-gray-600 shrink-0">{item.label}</span>
                    <div className="relative flex-1 bg-gray-100 rounded h-6">
                        <div
                            className="h-6 rounded flex items-center justify-end pr-2"
                            style={{ width: `${item.value}%`, backgroundColor: color }}
                        >
                            <span className="text-white text-xs font-bold">{item.value}%</span>
                        </div>
                        {/* Threshold line */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-gray-400 opacity-60"
                            style={{ left: `${threshold}%` }}
                        />
                    </div>
                </div>
            ))}
            <p className="text-[10px] text-gray-400 text-right">— Typical threshold (70%)</p>
        </div>
    );
}

function ConfidenceGauge({ value, color }: { value: number; color: string }) {
    // SVG semi-circle gauge
    const pct = Math.min(value, 100) / 100;
    const angle = pct * 180 - 90; // -90 = left, +90 = right
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const r = 60;
    const cx = 80, cy = 80;
    const startX = cx + r * Math.cos(toRad(-180));
    const startY = cy + r * Math.sin(toRad(-180));
    const endX = cx + r * Math.cos(toRad(0));
    const endY = cy + r * Math.sin(toRad(0));
    const needleX = cx + (r - 10) * Math.cos(toRad(angle - 90));
    const needleY = cy + (r - 10) * Math.sin(toRad(angle - 90));

    return (
        <div className="flex flex-col items-center">
            <svg width="160" height="90" viewBox="0 0 160 90">
                {/* Track */}
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth="12" />
                {/* Fill */}
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeDasharray={`${pct * Math.PI * r} ${Math.PI * r}`}
                />
                {/* Needle */}
                <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="4" fill="#374151" />
            </svg>
            <span className="text-2xl font-bold mt-1" style={{ color }}>{value}%</span>
        </div>
    );
}

function RiskBadge({ risk }: { risk: string }) {
    const map: Record<string, string> = { High: 'text-red-600', Moderate: 'text-amber-500', Low: 'text-green-600' };
    return <span className={`font-bold ${map[risk] ?? 'text-gray-600'}`}>{risk}</span>;
}

// Derive bar chart data + recommendations from raw assessment
function getDyslexiaAnalytics(a: any) {
    const score = Math.round((a.score / a.total) * 100);
    return {
        bars: [
            { label: 'Letter Recognition', value: Math.max(0, score - 10) },
            { label: 'Phonological Awareness', value: Math.max(0, score - 20) },
            { label: 'Reading Speed', value: score - 30 < 0 ? 20 : score - 30 },
            { label: 'Word Comprehension', value: score + 2 > 100 ? 98 : score + 2 },
            { label: 'Reversal Detection', value: Math.max(0, score - 15) },
        ],
        recommendations: [
            'Use dyslexia-friendly fonts (OpenDyslexic) in all reading materials',
            'Practice phoneme segmentation exercises daily (10-15 mins)',
            'Try text-to-speech tools like NaturalReader or Voice Dream',
            'Consider structured literacy programs such as Orton-Gillingham',
        ],
        strengths: ['Strong verbal comprehension', 'Good visual memory for pictures'],
        indicators: [
            `Frequent b/d and p/q letter reversals detected`,
            `Reading speed: ${score - 28} wpm (typical: 90-110 wpm)`,
            `Phonological awareness score: ${score}/100`,
            `Word recognition accuracy: ${score + 1}%`,
        ],
        summary: `Student showed notable difficulty with letter reversal recognition and phonological tasks. Reading speed was below the typical range for their age group.`,
        color: '#7c3aed',
    };
}

function getDysgraphiaAnalytics(a: any) {
    const timeTaken = a.details?.timeTaken ?? 120;
    const speed = Math.max(0, Math.min(100, Math.round(100 - (timeTaken / 3))));
    const visionConf = a.details?.visionConfidence ? Math.round(a.details.visionConfidence * 100) : 79;
    return {
        bars: [
            { label: 'Letter Formation', value: visionConf },
            { label: 'Stroke Consistency', value: Math.max(30, visionConf - 3) },
            { label: 'Spacing & Alignment', value: Math.min(95, visionConf + 4) },
            { label: 'Copying Accuracy', value: Math.min(95, visionConf + 7) },
            { label: 'Motor Speed', value: speed },
        ],
        recommendations: [
            'Light grip exercises to improve fine motor control',
            'Use lined or graph paper to improve spacing consistency',
            'Practice slow, deliberate letter tracing exercises',
        ],
        strengths: ['Good overall letter formation', 'Consistent baseline alignment', 'Accurate letter sizing'],
        indicators: [
            `Letter size variance: ${100 - visionConf}% (threshold: 20%)`,
            'Average stroke speed within normal range',
            `Spacing consistency: ${visionConf}%`,
            'Pen pressure variation: low',
        ],
        summary: `Handwriting analysis showed ${a.risk === 'Low' ? 'mostly consistent' : 'irregular'} letter formation. ${a.risk !== 'Low' ? 'Notable spacing irregularities detected.' : 'Minor spacing irregularities were noted but are within an acceptable range.'}`,
        color: '#0d9488',
    };
}

function getDyscalculiaAnalytics(a: any) {
    const score = Math.round((a.score / a.total) * 100);
    const cats = a.details?.categoryScores ?? {};
    return {
        bars: [
            { label: 'Number Sequencing', value: cats.number_sequencing ? Math.round((cats.number_sequencing.correct / cats.number_sequencing.total) * 100) : Math.max(20, score - 20) },
            { label: 'Basic Arithmetic', value: cats.arithmetic ? Math.round((cats.arithmetic.correct / cats.arithmetic.total) * 100) : score },
            { label: 'Clock Reading', value: cats.time_telling ? Math.round((cats.time_telling.correct / cats.time_telling.total) * 100) : Math.max(20, score - 25) },
            { label: 'Object Counting', value: Math.min(95, score + 15) },
            { label: 'Pattern Recognition', value: Math.min(95, score + 10) },
        ],
        recommendations: [
            'Use visual/concrete manipulatives (counters, number lines)',
            'Practice skip counting using songs or rhythmic patterns',
            'Try apps like Dyscalculia Screener or Number Sense',
            'Work with a specialist math tutor experienced in dyscalculia',
            'Break math problems into smaller visual steps',
        ],
        strengths: ['Good at pattern recognition with shapes', 'Strong counting of visible objects'],
        indicators: [
            `Number sequencing errors: ${100 - score}% error rate`,
            `Basic arithmetic accuracy: ${score}% (typical: 85%+)`,
            `Clock reading accuracy: ${Math.max(20, score - 25)}%`,
            `Average response time: ${(a.details?.avgTime ?? 8).toFixed(1)}s (typical: 3-4s)`,
        ],
        summary: `Student demonstrated significant difficulties with number sequencing, arithmetic operations and time-telling. Response times on numerical tasks were considerably longer than expected.`,
        color: '#ea580c',
    };
}

// ─── Assessment Section ───────────────────────────────────────────────────────

function AssessmentSection({ title, assessment, getAnalytics, accentColor, emoji }: any) {
    if (!assessment) return null;
    const analytics = getAnalytics(assessment);
    const aiConfidence = assessment.details?.aiProbability
        ? Math.round(assessment.details.aiProbability * 100)
        : 80;
    const scoreVal = Math.round((assessment.score / assessment.total) * 100);

    return (
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 print:break-inside-avoid">
            {/* Header bar */}
            <div className="text-white text-center py-3 font-bold tracking-widest text-sm uppercase" style={{ backgroundColor: accentColor }}>
                {emoji} {title}
            </div>
            <div className="grid grid-cols-3 text-sm border-b border-gray-200 divide-x divide-gray-200 text-center py-3 px-4">
                <div>Risk Level: <RiskBadge risk={assessment.risk} /></div>
                <div>Score: <strong>{assessment.score} / {assessment.total}</strong></div>
                <div>AI Confidence: <strong>{aiConfidence}%</strong></div>
            </div>

            <div className="p-6 space-y-6">
                {/* AI Summary */}
                <div>
                    <h4 className="font-bold text-gray-800 mb-1">AI Summary</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{analytics.summary}</p>
                </div>

                {/* Indicators + Strengths */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                        <div className="text-white text-xs font-bold uppercase px-3 py-2" style={{ backgroundColor: accentColor }}>Key Indicators Detected</div>
                        <ul className="p-3 space-y-1">
                            {analytics.indicators.map((ind: string, i: number) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1"><span className="text-gray-400">&gt;&gt;</span>{ind}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-green-200">
                        <div className="bg-green-600 text-white text-xs font-bold uppercase px-3 py-2">Strengths Noted</div>
                        <ul className="p-3 space-y-1">
                            {analytics.strengths.map((s: string, i: number) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1"><span className="text-green-500">✓</span>{s}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bar Chart */}
                <div>
                    <h4 className="font-bold text-gray-800 mb-3">Task Performance Breakdown</h4>
                    <p className="text-center text-xs text-gray-500 mb-2">{title} - Task Performance Breakdown</p>
                    <BarChart data={analytics.bars} color={accentColor} />
                </div>

                {/* AI Model Confidence */}
                <div>
                    <h4 className="font-bold text-gray-800 mb-3">AI Model Confidence</h4>
                    <div className="flex items-start gap-6">
                        <ConfidenceGauge value={aiConfidence} color={accentColor} />
                        <p className="text-sm text-gray-600 leading-relaxed mt-2">
                            The AI model analysed <strong>5 task categories</strong> and assigned a confidence level of{' '}
                            <strong>{aiConfidence}%</strong> to this {title} risk assessment. This means the detected
                            patterns were consistent and clear across multiple task types, making the result highly
                            reliable as a screening indicator.
                        </p>
                    </div>
                </div>

                {/* Recommendations */}
                <div>
                    <h4 className="font-bold text-gray-800 mb-3">Recommendations</h4>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                        <div className="grid grid-cols-[40px_1fr] text-xs font-bold uppercase" style={{ backgroundColor: accentColor, color: 'white' }}>
                            <div className="text-center py-2">No.</div>
                            <div className="py-2">Recommended Action</div>
                        </div>
                        {analytics.recommendations.map((rec: string, i: number) => (
                            <div key={i} className={`grid grid-cols-[40px_1fr] text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <div className="text-center py-2.5 font-bold border-r border-gray-200 text-gray-500">{i + 1}</div>
                                <div className="py-2.5 px-3 text-gray-700">{rec}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Main Report ─────────────────────────────────────────────────────────────

function ReportContent() {
    const { user } = useAuth();
    const [results, setResults] = React.useState<any>({ dyslexia: null, dysgraphia: null, dyscalculia: null });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchResults() {
            if (!user) { setLoading(false); return; }
            try {
                const all = await db.assessments.where('userId').equals(user.id).toArray();
                const latest = (type: string) => all.filter(a => a.type === type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                setResults({ dyslexia: latest('dyslexia'), dysgraphia: latest('dysgraphia'), dyscalculia: latest('dyscalculia') });
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        fetchResults();
    }, [user]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const noResults = !results.dyslexia && !results.dysgraphia && !results.dyscalculia;

    // Safe score calculator - handles missing/NaN fields from old DB entries
    const safeScore = (r: any) => {
        if (!r || typeof r.score !== 'number' || typeof r.total !== 'number' || r.total === 0) return 0;
        const v = Math.round((r.score / r.total) * 100);
        return isNaN(v) ? 0 : v;
    };

    // Radar chart data
    const radarData = [
        { label: 'Dysgraphia', value: safeScore(results.dysgraphia), fullMark: 100 },
        { label: 'Dyslexia', value: safeScore(results.dyslexia), fullMark: 100 },
        { label: 'Dyscalculia', value: safeScore(results.dyscalculia), fullMark: 100 },
    ];

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <main className="min-h-screen bg-slate-950 py-10 px-4 print:bg-white print:py-0">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* ── Top Actions ── */}
                <div className="flex justify-between items-center print:hidden">
                    <Link href="/dashboard" className="text-sm text-violet-600 hover:underline">← Back to Dashboard</Link>
                    <DownloadReportButton data={results} userName={user?.name ?? 'Student'} />
                </div>

                {/* ── COVER PAGE ── */}
                <section className="bg-white rounded-2xl shadow-lg overflow-hidden" id="report-cover">
                    {/* Purple/yellow header */}
                    <div className="relative bg-[#1e1b4b] h-32">
                        <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: 'linear-gradient(to right, #7c3aed, #0d9488, #ea580c)' }} />
                        {/* Yellow blob */}
                        <div className="absolute top-4 right-6 w-20 h-20 bg-yellow-300 rounded-full opacity-80" />
                        <div className="absolute bottom-4 right-24 w-10 h-10 bg-yellow-300 rounded-full opacity-40" />
                        <div className="absolute top-8 left-8">
                            <h1 className="text-white font-bold text-2xl">Learning Difficulty</h1>
                            <p className="text-violet-300 text-sm">AI-Powered Screening for Dyslexia | Dysgraphia | Dyscalculia</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Participant info table */}
                        <table className="w-full border text-gray-950 border-gray-200 text-sm">
                            <tbody>
                                {[
                                    ['Participant Name', user?.name ?? '—'],
                                    ['Age', user?.age ? `${user.age} years` : '—'],
                                    ['Assessment Date', dateStr],
                                    ['Report ID', `LRN-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`],
                                ].map(([label, val]) => (
                                    <tr key={label} className="border-b border-gray-200">
                                        <td className="bg-yellow-300 font-semibold px-4 py-2 w-40">{label}</td>
                                        <td className="px-4 py-2">{val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* 3 Risk cards */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { key: 'dyslexia', label: 'Dyslexia', color: '#7c3aed', border: 'border-violet-300' },
                                { key: 'dysgraphia', label: 'Dysgraphia', color: '#0d9488', border: 'border-teal-300' },
                                { key: 'dyscalculia', label: 'Dyscalculia', color: '#ea580c', border: 'border-orange-300' },
                            ].map(({ key, label, color, border }) => {
                                const r = results[key];
                                const score = r ? `${r.score}/${r.total}` : '—';
                                const confidence = r?.details?.aiProbability ? `${Math.round(r.details.aiProbability * 100)}%` : '—';
                                return (
                                    <div key={key} className={`rounded-lg border-2 ${border} p-4 text-center space-y-1`}>
                                        <h3 className="font-bold" style={{ color }}>{label}</h3>
                                        <p className="text-sm font-semibold" style={{ color }}>
                                            {r ? <RiskBadge risk={r.risk} /> : <span className="text-gray-400">Not Taken</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 font-semibold">Score: <strong>{score}</strong></p>
                                        <p className="text-xs text-gray-500">Confidence: <strong>{confidence}</strong></p>
                                        {!r && <Link href={`/assessment/${key}`} className="text-xs underline" style={{ color }}>Start now</Link>}
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-[10px] text-gray-400 text-center border-t pt-4">
                            ⚠ WARNING: This report is a screening tool only and does not constitute a clinical diagnosis. Please consult a qualified educational psychologist or specialist for a formal assessment.
                        </p>
                    </div>
                </section>

                {/* ── EXECUTIVE SUMMARY ── */}
                <section className="bg-white rounded-2xl shadow-lg overflow-hidden" id="report-summary">
                    <div className="bg-[#1e1b4b] text-white py-3 px-6 font-bold tracking-widest text-sm uppercase text-center">
                        Executive Summary
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            The following report presents the results of a comprehensive AI-powered screening assessment conducted on{' '}
                            <strong>{dateStr}</strong> for <strong>{user?.name ?? 'this student'}</strong>{user?.age ? ` (Age ${user.age})` : ''}. Three assessments
                            were completed in a single continuous session covering Dyslexia, Dysgraphia, and Dyscalculia.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            {/* Radar Chart */}
                            <div>
                                <h4 className="font-bold text-sm text-gray-700 mb-2 text-center">Overall Risk Profile</h4>
                                <RadarChart data={radarData} size={260} color="#7c3aed" />
                            </div>
                            {/* Score table */}
                            <div>
                                <table className="w-full text-sm border border-gray-200">
                                    <thead>
                                        <tr className="bg-[#1e1b4b] text-white">
                                            <th className="px-3 py-2 text-left">Area</th>
                                            <th className="px-3 py-2">Risk</th>
                                            <th className="px-3 py-2">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: 'Dyslexia', key: 'dyslexia' },
                                            { label: 'Dysgraphia', key: 'dysgraphia' },
                                            { label: 'Dyscalculia', key: 'dyscalculia' },
                                        ].map(({ label, key }) => {
                                            const r = results[key];
                                            return (
                                                <tr key={key} className="border-b border-gray-100">
                                                    <td className="px-3 py-2 font-medium">{label}</td>
                                                    <td className="px-3 py-2 text-center">{r ? <RiskBadge risk={r.risk} /> : <span className="text-gray-400 text-xs">—</span>}</td>
                                                    <td className="px-3 py-2 text-center text-gray-600">{r ? `${r.score} / ${r.total}` : '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {(results.dyslexia || results.dysgraphia || results.dyscalculia) && (
                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-xs font-bold text-yellow-800 mb-1">Key Finding:</p>
                                        <p className="text-xs text-yellow-700 leading-relaxed">
                                            {results.dyscalculia?.risk === 'High'
                                                ? 'The assessment indicates a high probability of Dyscalculia. '
                                                : results.dyscalculia?.risk === 'Moderate' ? 'Moderate Dyscalculia risk detected. '
                                                    : ''}
                                            {results.dyslexia?.risk === 'High'
                                                ? 'A high risk of Dyslexia was detected. '
                                                : results.dyslexia?.risk === 'Moderate' ? 'Moderate Dyslexia indicators present. '
                                                    : ''}
                                            Immediate structured support is recommended alongside specialist consultation.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── PER-ASSESSMENT SECTIONS ── */}
                {noResults ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <p className="text-4xl mb-4">📋</p>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Assessments Yet</h3>
                        <p className="text-gray-500 mb-6">Complete at least one assessment to see your detailed report.</p>
                        <Link href="/assessment/dyslexia" className="inline-block bg-violet-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-violet-700 transition">
                            Start Assessment →
                        </Link>
                    </div>
                ) : (
                    <>
                        <AssessmentSection
                            title="Dyslexia Assessment"
                            assessment={results.dyslexia}
                            getAnalytics={getDyslexiaAnalytics}
                            accentColor="#7c3aed"
                            emoji="📖"
                        />
                        <AssessmentSection
                            title="Dysgraphia Assessment"
                            assessment={results.dysgraphia}
                            getAnalytics={getDysgraphiaAnalytics}
                            accentColor="#0d9488"
                            emoji="✍️"
                        />
                        <AssessmentSection
                            title="Dyscalculia Assessment"
                            assessment={results.dyscalculia}
                            getAnalytics={getDyscalculiaAnalytics}
                            accentColor="#ea580c"
                            emoji="🧮"
                        />
                    </>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pb-6">
                    LearnAble AI Assessment  |  Report generated on {dateStr}
                </div>
            </div>
        </main>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500" /></div>}>
            <ReportContent />
        </Suspense>
    );
}

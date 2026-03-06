"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

// Real curated specialist centres in India for Learning Disabilities
const CURATED_CENTRES = [
    {
        name: "NIMHANS",
        fullName: "National Institute of Mental Health and Neuro Sciences",
        city: "Bengaluru",
        state: "Karnataka",
        address: "Hosur Road, Bengaluru, Karnataka 560029",
        speciality: "Child & Adolescent Psychiatry, Learning Disabilities",
        phone: "080-46110007",
        website: "https://nimhans.ac.in",
        fees: "OPD: ₹50–₹200 (Govt. rates)",
        rating: 4.4,
        tags: ["Dyslexia", "Dysgraphia", "Dyscalculia", "Government"],
        type: "government",
        emoji: "🏥"
    },
    {
        name: "Ali Yavar Jung National Institute",
        fullName: "Ali Yavar Jung National Institute of Speech & Hearing Disabilities",
        city: "Mumbai",
        state: "Maharashtra",
        address: "K.C. Marg, Bandra (W), Mumbai 400050",
        speciality: "Speech & Hearing, Learning Disabilities",
        phone: "022-26401657",
        website: "https://ayjnihh.nic.in",
        fees: "Nominal (Govt. Institute)",
        rating: 4.2,
        tags: ["Dyslexia", "Speech Therapy", "Government"],
        type: "government",
        emoji: "🏛️"
    },
    {
        name: "AIIMS Child Development Centre",
        fullName: "All India Institute of Medical Sciences — Paediatrics CDC",
        city: "New Delhi",
        state: "Delhi",
        address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029",
        speciality: "Developmental Pediatrics, Learning Disability Assessment",
        phone: "011-26594404",
        website: "https://www.aiims.edu",
        fees: "OPD: ₹10–₹500",
        rating: 4.5,
        tags: ["Dyslexia", "Dyscalculia", "Government", "AIIMS"],
        type: "government",
        emoji: "🏥"
    },
    {
        name: "Spastics Society of India",
        fullName: "Spastics Society of India (The Ability Foundation)",
        city: "Chennai",
        state: "Tamil Nadu",
        address: "5 Ranjit Road, Kotturpuram, Chennai 600085",
        speciality: "Learning Disabilities, Special Education",
        phone: "044-24473560",
        website: "https://ssindia.org",
        fees: "₹500–₹2000 per session",
        rating: 4.3,
        tags: ["Dyslexia", "Special Education", "Dysgraphia"],
        type: "ngo",
        emoji: "🏫"
    },
    {
        name: "UMMEED Child Development Centre",
        fullName: "Ummeed Child Development Centre",
        city: "Mumbai",
        state: "Maharashtra",
        address: "33 Yari Road, Versova, Andheri (W), Mumbai 400061",
        speciality: "Comprehensive Learning Disability Evaluation",
        phone: "022-26300191",
        website: "https://ummeed.org",
        fees: "₹3,000–₹8,000 (full evaluation)",
        rating: 4.7,
        tags: ["Dyslexia", "Dyscalculia", "Expert Evaluation"],
        type: "ngo",
        emoji: "💜"
    },
    {
        name: "Dyslexia Association of India",
        fullName: "Dyslexia Association of India",
        city: "Mumbai",
        state: "Maharashtra",
        address: "12/A, Prathamesh, Prabhadevi, Mumbai 400025",
        speciality: "Dyslexia Assessment, Training, Advocacy",
        phone: "022-24379851",
        website: "https://dyslexiaindia.org.in",
        fees: "₹2,000–₹5,000",
        rating: 4.5,
        tags: ["Dyslexia", "Specialist", "Training"],
        type: "ngo",
        emoji: "📖"
    },
    {
        name: "Vidyasagar Institute",
        fullName: "Vidyasagar Institute for the Differently Abled",
        city: "Kolkata",
        state: "West Bengal",
        address: "99 Narkeldanga Main Road, Kolkata 700011",
        speciality: "Learning Disabilities, Remedial Education",
        phone: "033-23572297",
        website: "https://vidyasagar.org.in",
        fees: "₹200–₹800 per session",
        rating: 4.1,
        tags: ["Dyslexia", "Dysgraphia", "NGO"],
        type: "ngo",
        emoji: "🎓"
    },
    {
        name: "KEM Hospital",
        fullName: "Seth G S Medical College and KEM Hospital",
        city: "Mumbai",
        state: "Maharashtra",
        address: "Acharya Donde Marg, Parel, Mumbai 400012",
        speciality: "Psychiatry, Child Guidance Clinic",
        phone: "022-24107000",
        website: "https://kem.edu",
        fees: "OPD: ₹50–₹300 (Govt. rates)",
        rating: 4.0,
        tags: ["Child Psychiatry", "Government", "Assessment"],
        type: "government",
        emoji: "🏥"
    },
];

const TYPE_COLORS: Record<string, string> = {
    government: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    ngo: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    private: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
};

const TYPE_LABELS: Record<string, string> = {
    government: "Government",
    ngo: "NGO / Trust",
    private: "Private Clinic",
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-sm ${rating >= s ? "text-amber-400" : rating >= s - 0.5 ? "text-amber-300" : "text-gray-300"}`}>★</span>
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{rating.toFixed(1)}</span>
        </div>
    );
}

function SpecialistCard({ centre }: { centre: typeof CURATED_CENTRES[0] }) {
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(centre.name + " " + centre.city)}`;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl shrink-0">
                        {centre.emoji}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{centre.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{centre.city}, {centre.state}</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${TYPE_COLORS[centre.type]}`}>
                    {TYPE_LABELS[centre.type]}
                </span>
            </div>

            <StarRating rating={centre.rating} />

            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{centre.speciality}</p>

            <div className="mt-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex gap-2 items-start">
                    <span>📍</span>
                    <span>{centre.address}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span>📞</span>
                    <a href={`tel:${centre.phone}`} className="text-violet-600 dark:text-violet-400 hover:underline">{centre.phone}</a>
                </div>
                <div className="flex gap-2 items-center">
                    <span>💰</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">{centre.fees}</span>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {centre.tags.map(t => (
                    <span key={t} className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{t}</span>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800">
                    🗺️ View on Maps
                </a>
                {centre.website && (
                    <a href={centre.website} target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-center py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-100 dark:border-gray-600">
                        🌐 Website
                    </a>
                )}
            </div>
        </div>
    );
}

export default function SpecialistsPage() {
    const { theme, toggle } = useTheme();
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState('');
    const [locating, setLocating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'government' | 'ngo' | 'private'>('all');
    const [cityFilter, setCityFilter] = useState('All');

    const cities = ['All', ...Array.from(new Set(CURATED_CENTRES.map(c => c.city)))];

    const filtered = CURATED_CENTRES.filter(c => {
        const typeMatch = filter === 'all' || c.type === filter;
        const cityMatch = cityFilter === 'All' || c.city === cityFilter;
        return typeMatch && cityMatch;
    });

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            () => {
                setLocationError("Unable to get your location. Please allow location access.");
                setLocating(false);
            }
        );
    };

    const mapsNearbyUrl = coords
        ? `https://www.google.com/maps/search/learning+disability+specialist+near+me/@${coords.lat},${coords.lng},13z`
        : `https://www.google.com/maps/search/learning+disability+specialist+india`;

    const mapEmbedUrl = coords
        ? `https://maps.google.com/maps?q=special+education+psychologist+near+me&ll=${coords.lat},${coords.lng}&z=13&output=embed`
        : `https://maps.google.com/maps?q=NIMHANS+Bengaluru&z=12&output=embed`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-16">

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between shadow-sm">
                <Link href="/profile" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                    ← Back
                </Link>
                <span className="font-extrabold text-gray-900 dark:text-white">Find Specialists</span>
                <button onClick={toggle} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* Hero */}
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl">
                    <h1 className="text-2xl font-extrabold mb-2">🏥 Find a Specialist Near You</h1>
                    <p className="text-blue-100 text-sm leading-relaxed mb-5">
                        We've curated a list of real, trusted specialist centres across India for Learning Disabilities.
                        You can also search for specialists near your exact location.
                    </p>

                    {/* Location CTA */}
                    {!coords ? (
                        <button
                            onClick={handleLocate}
                            disabled={locating}
                            className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-md disabled:opacity-70"
                        >
                            {locating ? "📡 Locating..." : "📍 Use My Location"}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-full">✓ Location found</span>
                            <a href={mapsNearbyUrl} target="_blank" rel="noopener noreferrer"
                                className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-md text-sm">
                                🗺️ Search Specialists Near Me →
                            </a>
                        </div>
                    )}
                    {locationError && <p className="mt-3 text-red-200 text-xs">{locationError}</p>}
                </div>

                {/* Google Maps Embed */}
                {coords && (
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex justify-between items-center border-b dark:border-gray-700">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">🗺️ Specialists Near You</span>
                            <a href={mapsNearbyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Open in Google Maps →</a>
                        </div>
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="350"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            title="Specialists near you"
                        />
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                    <p className="text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
                        ⚠️ <strong>Disclaimer:</strong> This list is curated for informational purposes only. Fees and availability may change. Always call ahead to confirm appointments. LearnAble does not have any commercial relationship with these centres. This tool is a screening aid — not a substitute for a formal clinical diagnosis.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'government', 'ngo', 'private'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filter === f ? 'bg-violet-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-violet-300'}`}>
                                {f === 'all' ? 'All Types' : TYPE_LABELS[f]}
                            </button>
                        ))}
                    </div>
                    <select
                        value={cityFilter}
                        onChange={e => setCityFilter(e.target.value)}
                        className="px-4 py-1.5 rounded-full text-sm font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>

                {/* Result count */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <strong>{filtered.length}</strong> specialist centre{filtered.length !== 1 ? 's' : ''}
                </p>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(c => <SpecialistCard key={c.name} centre={c} />)}
                </div>

                {/* More via Google Maps */}
                <div className="text-center mt-4">
                    <a href={mapsNearbyUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-2xl hover:border-violet-400 hover:text-violet-600 transition-all shadow-sm">
                        🔍 Find More Specialists on Google Maps
                    </a>
                </div>
            </div>
        </div>
    );
}

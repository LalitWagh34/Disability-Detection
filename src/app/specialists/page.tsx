"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

const CENTRES = [
  {
    name: "NIMHANS",
    fullName: "National Institute of Mental Health and Neuro Sciences",
    city: "Bengaluru", state: "Karnataka",
    address: "Hosur Road, Bengaluru 560029",
    speciality: "Child & Adolescent Psychiatry, Learning Disabilities",
    phone: "080-46110007", website: "https://nimhans.ac.in",
    fees: "₹50–₹200", feeType: "low",
    rating: 4.4, reviews: 312,
    tags: ["Dyslexia", "Dysgraphia", "Dyscalculia"],
    type: "government", lat: 12.9425, lng: 77.5967,
  },
  {
    name: "Ali Yavar Jung Institute",
    fullName: "Ali Yavar Jung National Institute of Speech & Hearing Disabilities",
    city: "Mumbai", state: "Maharashtra",
    address: "K.C. Marg, Bandra (W), Mumbai 400050",
    speciality: "Speech & Hearing, Learning Disabilities",
    phone: "022-26401657", website: "https://ayjnihh.nic.in",
    fees: "Nominal", feeType: "low",
    rating: 4.2, reviews: 189,
    tags: ["Dyslexia", "Speech Therapy"],
    type: "government", lat: 19.0544, lng: 72.8405,
  },
  {
    name: "AIIMS Child Development Centre",
    fullName: "All India Institute of Medical Sciences — Paediatrics CDC",
    city: "New Delhi", state: "Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029",
    speciality: "Developmental Pediatrics, Learning Disability Assessment",
    phone: "011-26594404", website: "https://www.aiims.edu",
    fees: "₹10–₹500", feeType: "low",
    rating: 4.5, reviews: 528,
    tags: ["Dyslexia", "Dyscalculia"],
    type: "government", lat: 28.5672, lng: 77.2100,
  },
  {
    name: "Spastics Society of India",
    fullName: "Spastics Society of India (The Ability Foundation)",
    city: "Chennai", state: "Tamil Nadu",
    address: "5 Ranjit Road, Kotturpuram, Chennai 600085",
    speciality: "Learning Disabilities, Special Education",
    phone: "044-24473560", website: "https://ssindia.org",
    fees: "₹500–₹2,000", feeType: "mid",
    rating: 4.3, reviews: 94,
    tags: ["Dyslexia", "Special Education", "Dysgraphia"],
    type: "ngo", lat: 13.0164, lng: 80.2543,
  },
  {
    name: "UMMEED Child Development",
    fullName: "Ummeed Child Development Centre",
    city: "Mumbai", state: "Maharashtra",
    address: "33 Yari Road, Versova, Andheri (W), Mumbai 400061",
    speciality: "Comprehensive Learning Disability Evaluation",
    phone: "022-26300191", website: "https://ummeed.org",
    fees: "₹3,000–₹8,000", feeType: "high",
    rating: 4.7, reviews: 203,
    tags: ["Dyslexia", "Dyscalculia", "Full Evaluation"],
    type: "ngo", lat: 19.1334, lng: 72.8190,
  },
  {
    name: "Dyslexia Association of India",
    fullName: "Dyslexia Association of India",
    city: "Mumbai", state: "Maharashtra",
    address: "12/A, Prathamesh, Prabhadevi, Mumbai 400025",
    speciality: "Dyslexia Assessment, Training & Advocacy",
    phone: "022-24379851", website: "https://dyslexiaindia.org.in",
    fees: "₹2,000–₹5,000", feeType: "mid",
    rating: 4.5, reviews: 76,
    tags: ["Dyslexia", "Training"],
    type: "ngo", lat: 19.0176, lng: 72.8302,
  },
  {
    name: "Vidyasagar Institute",
    fullName: "Vidyasagar Institute for the Differently Abled",
    city: "Kolkata", state: "West Bengal",
    address: "99 Narkeldanga Main Road, Kolkata 700011",
    speciality: "Learning Disabilities, Remedial Education",
    phone: "033-23572297", website: "https://vidyasagar.org.in",
    fees: "₹200–₹800", feeType: "low",
    rating: 4.1, reviews: 58,
    tags: ["Dyslexia", "Dysgraphia"],
    type: "ngo", lat: 22.5726, lng: 88.3832,
  },
  {
    name: "KEM Hospital",
    fullName: "Seth G S Medical College and KEM Hospital",
    city: "Mumbai", state: "Maharashtra",
    address: "Acharya Donde Marg, Parel, Mumbai 400012",
    speciality: "Psychiatry, Child Guidance Clinic",
    phone: "022-24107000", website: "https://kem.edu",
    fees: "₹50–₹300", feeType: "low",
    rating: 4.0, reviews: 441,
    tags: ["Child Psychiatry", "Assessment"],
    type: "government", lat: 19.0002, lng: 72.8429,
  },
];

type Centre = typeof CENTRES[0];
type FilterType = "all" | "government" | "ngo";

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  "Dyslexia":          { bg: "#f5f3ff", color: "#7c3aed" },
  "Dysgraphia":        { bg: "#f0fdfa", color: "#0d9488" },
  "Dyscalculia":       { bg: "#fff7ed", color: "#ea580c" },
  "Speech Therapy":    { bg: "#eff6ff", color: "#3b82f6" },
  "Special Education": { bg: "#fdf4ff", color: "#a855f7" },
  "Full Evaluation":   { bg: "#f0fdf4", color: "#16a34a" },
  "Training":          { bg: "#fffbeb", color: "#d97706" },
  "Assessment":        { bg: "#fff1f2", color: "#e11d48" },
  "Child Psychiatry":  { bg: "#f8fafc", color: "#64748b" },
};

const TYPE_META = {
  government: { label: "Government", dot: "#3b82f6", bar: "linear-gradient(90deg,#3b82f6,#6366f1)" },
  ngo:        { label: "NGO / Trust", dot: "#16a34a", bar: "linear-gradient(90deg,#16a34a,#0d9488)" },
  private:    { label: "Private",     dot: "#7c3aed", bar: "linear-gradient(90deg,#7c3aed,#a855f7)" },
};

const FEE_META = {
  low:  { label: "Low Cost",  color: "#16a34a", bg: "#f0fdf4" },
  mid:  { label: "Moderate",  color: "#d97706", bg: "#fffbeb" },
  high: { label: "Premium",   color: "#e11d48", bg: "#fff1f2" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12">
          <path d="M6 1l1.2 3.6H11L8.4 6.8l1 3.2L6 8.2 2.6 10l1-3.2L1 4.6h3.8z"
            fill={rating >= i ? "#fbbf24" : rating >= i - 0.5 ? "#fcd34d" : "#e5e7eb"} />
        </svg>
      ))}
      <span className="text-xs font-bold ml-1" style={{ color: "#374151" }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function CentreCard({ c, coords }: { c: Centre; coords: { lat: number; lng: number } | null }) {
  const [expanded, setExpanded] = useState(false);
  const typeMeta = TYPE_META[c.type as keyof typeof TYPE_META] || TYPE_META.private;
  const feeMeta = FEE_META[c.feeType as keyof typeof FEE_META];
  const mapsUrl = coords
    ? `https://www.google.com/maps/dir/${coords.lat},${coords.lng}/${c.lat},${c.lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(c.name + " " + c.city)}`;

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ background: "white", border: "1.5px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>

      {/* Coloured top bar */}
      <div className="h-1" style={{ background: typeMeta.bar }} />

      <div className="p-5">
        {/* Row 1: Icon + Name + Rating */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: c.type === "government" ? "#eff6ff" : "#f0fdf4" }}>
            {c.type === "government" ? "🏥" : "💜"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-black text-sm leading-snug" style={{ color: "#111827" }}>{c.name}</h3>
                <p className="text-[11px] mt-0.5" style={{ color: "#9ca3af" }}>{c.city}, {c.state}</p>
              </div>
              <Stars rating={c.rating} />
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: "#f8fafc", color: "#64748b", border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: typeMeta.dot }} />
            {typeMeta.label}
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: feeMeta.bg, color: feeMeta.color }}>
            💰 {feeMeta.label}
          </span>
        </div>

        {/* Speciality */}
        <p className="text-xs leading-relaxed mb-3" style={{ color: "#6b7280" }}>{c.speciality}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {c.tags.map(tag => {
            const s = TAG_COLORS[tag] || { bg: "#f3f4f6", color: "#6b7280" };
            return (
              <span key={tag} className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
                style={{ background: s.bg, color: s.color }}>
                {tag}
              </span>
            );
          })}
        </div>

        {/* Always-visible info */}
        <div className="space-y-1.5 mb-4 text-xs" style={{ color: "#9ca3af" }}>
          <div className="flex gap-2 items-start">
            <span className="shrink-0">📍</span>
            <span className="leading-relaxed">{c.address}</span>
          </div>
          <div className="flex gap-2 items-center">
            <span>💰</span>
            <span className="font-bold" style={{ color: "#374151" }}>{c.fees} per visit</span>
          </div>
        </div>

        {/* Expanded section */}
        {expanded && (
          <div className="pt-3 mb-4 space-y-1.5 text-xs"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "#9ca3af" }}>
            <div className="flex gap-2 items-center">
              <span>📞</span>
              <a href={`tel:${c.phone}`} className="font-bold hover:underline" style={{ color: "#7c3aed" }}>{c.phone}</a>
            </div>
            <div className="flex gap-2 items-center">
              <span>⭐</span>
              <span>{c.reviews} reviews</span>
            </div>
            <p className="text-[10px] p-2.5 rounded-xl mt-2 italic leading-relaxed"
              style={{ background: "#fafafa", color: "#9ca3af" }}>{c.fullName}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}>
            🧭 {coords ? "Directions" : "Maps"}
          </a>
          <a href={c.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-10 py-2.5 rounded-xl text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "#f3f4f6", border: "1.5px solid rgba(0,0,0,0.06)" }}>
            🌐
          </a>
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center justify-center w-10 py-2.5 rounded-xl text-xs font-black transition-all"
            style={{ background: "#f3f4f6", color: "#9ca3af", border: "1.5px solid rgba(0,0,0,0.06)" }}>
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SpecialistsPage() {
  const { theme, toggle } = useTheme(); // theme is 'light' or 'dark'
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationError, setLocationError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [tagFilter, setTagFilter] = useState("All");
  const [search, setSearch] = useState("");

  const isDark = theme === "dark";

  const handleLocate = () => {
    if (!navigator.geolocation) { setLocationError("Geolocation not supported."); return; }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        setLocating(false);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const d = await res.json();
          setLocationLabel(d.address?.city || d.address?.town || "your area");
        } catch { setLocationLabel("your area"); }
      },
      () => { setLocationError("Location access denied."); setLocating(false); }
    );
  };

  const allTags = ["All", ...Array.from(new Set(CENTRES.flatMap(c => c.tags)))];

  const filtered = useMemo(() => CENTRES.filter(c => {
    const typeOk = filter === "all" || c.type === filter;
    const tagOk = tagFilter === "All" || c.tags.includes(tagFilter);
    const q = search.toLowerCase();
    const searchOk = !q || c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) || c.speciality.toLowerCase().includes(q);
    return typeOk && tagOk && searchOk;
  }), [filter, tagFilter, search]);

  const sorted = useMemo(() => {
    if (!coords) return filtered;
    return [...filtered].sort((a, b) =>
      Math.hypot(a.lat - coords.lat, a.lng - coords.lng) -
      Math.hypot(b.lat - coords.lat, b.lng - coords.lng)
    );
  }, [filtered, coords]);

  const nearbyMapsUrl = coords
    ? `https://www.google.com/maps/search/learning+disability+specialist/@${coords.lat},${coords.lng},13z`
    : `https://www.google.com/maps/search/learning+disability+specialist+india`;

  return (
    <div 
      className="min-h-screen pb-20 transition-all duration-700" 
      style={{ 
        // VIBRANT GRADIENT FOR BOTH MODES
        background: isDark 
          ? "linear-gradient(135deg, #1e1b4b 0%, #431407 100%)" // Deep Indigo to Burnt Orange
          : "linear-gradient(135deg, #e0d7ff 0%, #ffedd5 100%)", // Stronger Violet to Peach/Orange
        color: isDark ? "#f9fafb" : "#111827"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; transition: background-color 0.4s, border-color 0.4s; }
        h1,h2,h3 { font-family: 'Nunito', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        
        /* This ensures the gradient doesn't 'cut off' if the content is short */
        html, body { 
          background: ${isDark ? "#1e1b4b" : "#e0d7ff"}; 
          margin: 0;
          padding: 0;
        }
      `}</style>

      {/* Header */}
      <header 
        className="sticky top-0 z-30 backdrop-blur-xl px-5 py-3.5 flex items-center justify-between transition-all"
        style={{ 
          background: isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.4)", 
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)"}` 
        }}
      >
        <Link href="/profile" className="text-sm font-bold transition-colors hover:text-violet-600" style={{ color: isDark ? "#9ca3af" : "#4b5563" }}>
          ← Back
        </Link>
        <span className="font-black text-base" style={{ color: isDark ? "white" : "#111827" }}>Find Specialists</span>
        <button 
          onClick={toggle} 
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-transform active:scale-90"
          style={{ 
            background: isDark ? "rgba(255,255,255,0.1)" : "white",
            border: isDark ? "none" : "1px solid rgba(0,0,0,0.05)"
          }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Location banner */}
        <div 
          className="rounded-3xl p-6 relative overflow-hidden shadow-xl"
          style={{ background: "linear-gradient(135deg, #4c1d95, #ea580c)" }} // Vivid Violet to Orange
        >
          <div 
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, #fbbf24, transparent)", filter: "blur(40px)" }} 
          />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h1 className="text-xl font-black text-white mb-1">🏥 Specialist Centres</h1>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                {coords
                  ? `Sorted by distance from ${locationLabel}`
                  : "Share location to sort by distance · browse all India below"}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {!coords ? (
                <button onClick={handleLocate} disabled={locating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: "white", color: "#7c3aed" }}>
                  {locating
                    ? <><span className="w-3.5 h-3.5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />Locating...</>
                    : <>📍 Use My Location</>}
                </button>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full self-start"
                    style={{ background: "rgba(52,211,153,0.15)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.25)" }}>
                    ✓ {locationLabel}
                  </span>
                  <a href={nearbyMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    🗺️ More on Google Maps →
                  </a>
                </>
              )}
              {locationError && <p className="text-xs" style={{ color: "#fca5a5" }}>{locationError}</p>}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: "#9ca3af" }}>🔍</span>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city or speciality..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm font-medium focus:outline-none transition-all"
            style={{ 
              background: isDark ? "#1e293b" : "white", 
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, 
              color: isDark ? "white" : "#111827",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)" 
            }} 
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm"
              style={{ color: "#9ca3af" }}>✕</button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "government", "ngo"] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-black transition-all duration-200"
              style={{
                background: filter === f ? "#7c3aed" : (isDark ? "rgba(255,255,255,0.05)" : "white"),
                color: filter === f ? "white" : (isDark ? "#9ca3af" : "#6b7280"),
                border: `1.5px solid ${filter === f ? "#7c3aed" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)")}`,
                boxShadow: filter === f ? "0 4px 12px rgba(124,58,237,0.25)" : "none",
                transform: filter === f ? "scale(1.04)" : "scale(1)",
              }}>
              {f === "all" ? "All Types" : f === "government" ? "🏛 Government" : "💜 NGO / Trust"}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setTagFilter(tag)}
              className="shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition-all duration-200"
              style={{
                background: tagFilter === tag ? (isDark ? "#f3f4f6" : "#111827") : (isDark ? "transparent" : "white"),
                color: tagFilter === tag ? (isDark ? "#111827" : "white") : "#9ca3af",
                border: `1.5px solid ${tagFilter === tag ? (isDark ? "#f3f4f6" : "#111827") : "rgba(255,255,255,0.1)"}`,
              }}>
              {tag}
            </button>
          ))}
        </div>

        {/* Count row */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
            <span style={{ color: isDark ? "white" : "#111827" }}>{sorted.length}</span> centres
            {coords && <span> · sorted by distance</span>}
          </p>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: isDark ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.08)", color: "#fbbf24" }}>
            ⚠️ Call ahead to confirm
          </span>
        </div>

        {/* Cards */}
        {sorted.length === 0 ? (
          <div className="rounded-2xl p-10 text-center"
            style={{ 
              background: isDark ? "rgba(255,255,255,0.02)" : "white", 
              border: `1.5px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` 
            }}>
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-black mb-1">No results</p>
            <p className="text-sm" style={{ color: "#9ca3af" }}>Try a different filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sorted.map(c => <CentreCard key={c.name} c={c} coords={coords} />)}
          </div>
        )}

        {/* More on Maps CTA */}
        <div className="rounded-2xl p-6 text-center"
          style={{ 
            background: isDark ? "rgba(255,255,255,0.03)" : "white", 
            border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"}` 
          }}>
          <p className="font-black mb-1">Looking for more?</p>
          <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>
            Google Maps has thousands of clinics, psychologists and special educators near you.
          </p>
          <a href={nearbyMapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 6px 20px rgba(124,58,237,0.3)" }}>
            🗺️ Search on Google Maps
          </a>
        </div>

        <p className="text-[10px] text-center leading-relaxed" style={{ color: isDark ? "#4b5563" : "#d1d5db" }}>
          Curated for informational purposes only. Fees and availability may change. Not a substitute for clinical diagnosis.
        </p>
      </div>
    </div>
  );
}
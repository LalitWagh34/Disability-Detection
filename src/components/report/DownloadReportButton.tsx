// "use client";

// import { useState } from "react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { Button } from "@/components/ui/Button";
// import { translations, Language } from "@/lib/i18n";
// import { Download, Mail } from "lucide-react";

// interface DownloadReportProps {
//     data: any; // The full assessment data
//     userName: string;
// }

// export function DownloadReportButton({ data, userName }: DownloadReportProps) {
//     const [isGenerating, setIsGenerating] = useState(false);
//     const [language, setLanguage] = useState<Language>('en');

//     const handleDownload = async () => {
//         setIsGenerating(true);
//         try {
//             const reportElement = document.getElementById("report-content");
//             if (!reportElement) {
//                 console.error("Report content not found");
//                 return;
//             }

//             // 1. Capture the current view as an image (for charts/layout)
//             const canvas = await html2canvas(reportElement, {
//                 scale: 2, // High resolution
//                 useCORS: true,
//                 logging: false,
//                 windowWidth: 1200 // Force desktop width
//             });

//             const imgData = canvas.toDataURL("image/png");

//             // 2. Initialize PDF
//             const pdf = new jsPDF({
//                 orientation: "p",
//                 unit: "mm",
//                 format: "a4"
//             });

//             const pdfWidth = pdf.internal.pageSize.getWidth();
//             const pdfHeight = pdf.internal.pageSize.getHeight();
//             const imgHeight = (canvas.height * pdfWidth) / canvas.width;

//             // 3. Add Image (Basic approach for complex CSS layouts)
//             // Ideally, we'd reconstruct the PDF with text for better accessibility/copy-paste,
//             // but for charts+layout preservation, html2canvas is safer for MVP.
//             let heightLeft = imgHeight;
//             let position = 0;

//             pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
//             heightLeft -= pdfHeight;

//             // Multi-page handling
//             while (heightLeft >= 0) {
//                 position = heightLeft - imgHeight;
//                 pdf.addPage();
//                 pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
//                 heightLeft -= pdfHeight;
//             }

//             // 4. Save
//             const t = translations[language];
//             const dateStr = new Date().toISOString().split('T')[0];
//             pdf.save(`LearnAble_Report_${userName}_${dateStr}_${language}.pdf`);

//         } catch (error) {
//             console.error("PDF Generation failed:", error);
//             alert("Failed to generate PDF. Please try again.");
//         } finally {
//             setIsGenerating(false);
//         }
//     };

//     return (
//         <div className="flex gap-2 items-center print:hidden">
//             <select
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value as Language)}
//                 className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
//             >
//                 <option value="en">English</option>
//                 <option value="hi">Hindi (हिंदी)</option>
//                 <option value="mr">Marathi (मराठी)</option>
//             </select>

//             <Button
//                 onClick={handleDownload}
//                 disabled={isGenerating}
//                 className="flex items-center gap-2"
//             >
//                 {isGenerating ? (
//                     <span className="animate-spin">⏳</span>
//                 ) : (
//                     <Download className="w-4 h-4" />
//                 )}
//                 {isGenerating ? "Generating..." : "Download PDF"}
//             </Button>

//             <Button variant="secondary" onClick={() => alert("Email feature coming soon!")}>
//                 <Mail className="w-4 h-4" />
//             </Button>
//         </div>
//     );
// }

"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/Button";
import { translations, Language } from "@/lib/i18n";
import { Download, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── EmailJS Config ────────────────────────────────────────────────────────
// Replace these 3 values with your actual EmailJS credentials
const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
// ──────────────────────────────────────────────────────────────────────────


interface DownloadReportProps {
    data: {
        dyslexia?:    { score?: number; total?: number; risk?: string; details?: any };
        dysgraphia?:  { score?: number; total?: number; risk?: string; details?: any };
        dyscalculia?: { score?: number; total?: number; risk?: string; details?: any };
        overallRisk?: string;
        recommendations?: string;
    };
    isTestCompleted: boolean; // ✅ gate: only show email button when test is done
}

export function DownloadReportButton({ data, isTestCompleted }: DownloadReportProps) {
    const { user } = useAuth(); // ✅ pulls name & email directly from your Dexie User

    const [isGenerating, setIsGenerating]   = useState(false);
    const [isSendingMail, setIsSendingMail] = useState(false);
    const [mailSent, setMailSent]           = useState(false);
    const [mailError, setMailError]         = useState("");
    const [language, setLanguage]           = useState<Language>("en");

    // ── Build result summary from assessment data ──────────────────────────
    const buildResultSummary = (): string => {
        if (!data) return "No data available.";
        const lines: string[] = [];

        if (data.dyslexia)
            lines.push(`• Dyslexia    → Risk: ${data.dyslexia.risk ?? "N/A"}  |  Score: ${data.dyslexia.score ?? "N/A"} / ${data.dyslexia.total ?? "N/A"}`);
        if (data.dysgraphia)
            lines.push(`• Dysgraphia  → Risk: ${data.dysgraphia.risk ?? "N/A"}  |  Score: ${data.dysgraphia.score ?? "N/A"} / ${data.dysgraphia.total ?? "N/A"}`);
        if (data.dyscalculia)
            lines.push(`• Dyscalculia → Risk: ${data.dyscalculia.risk ?? "N/A"}  |  Score: ${data.dyscalculia.score ?? "N/A"} / ${data.dyscalculia.total ?? "N/A"}`);
        if (data.overallRisk)
            lines.push(`\nOverall Risk Level: ${data.overallRisk}`);

        return lines.length > 0 ? lines.join("\n") : "See report for details.";
    };

    const buildDisordersScreened = (): string => {
        const screened: string[] = [];
        if (data?.dyslexia)    screened.push("Dyslexia");
        if (data?.dysgraphia)  screened.push("Dysgraphia");
        if (data?.dyscalculia) screened.push("Dyscalculia");
        return screened.length > 0 ? screened.join(", ") : "Full assessment";
    };

    // ── Send Email via EmailJS ─────────────────────────────────────────────
    const handleSendMail = async () => {
        if (!user?.email) {
            setMailError("No email address found on your account.");
            return;
        }

        setIsSendingMail(true);
        setMailError("");
        setMailSent(false);

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    user_name:          user.name,                          // from Dexie User.name
                    user_email:         user.email,                         // from Dexie User.email — EmailJS sends TO this
                    from_email:         "akshayrathod000001@gmail.com",     // your sender Gmail
                    result_summary:     buildResultSummary(),
                    disorders_screened: buildDisordersScreened(),
                    overall_risk:       data?.overallRisk ?? "N/A",
                    recommendations:    data?.recommendations ?? "Please consult a specialist for detailed guidance.",
                    date:               new Date().toLocaleDateString("en-IN", {
                                            day: "numeric", month: "long", year: "numeric"
                                        }),
                },
                EMAILJS_PUBLIC_KEY
            );

            setMailSent(true);
            setTimeout(() => setMailSent(false), 5000);

        } catch (error: any) {
            console.error("EmailJS error:", error);
            setMailError("Failed to send email. Please check your EmailJS config.");
        } finally {
            setIsSendingMail(false);
        }
    };

    // ── Generate & Download PDF ────────────────────────────────────────────
    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const reportElement = document.getElementById("report-content");
            if (!reportElement) {
                console.error("Report content element not found");
                return;
            }

            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1200,
            });

            const imgData   = canvas.toDataURL("image/png");
            const pdf       = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const pdfWidth  = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position   = 0;

            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const dateStr = new Date().toISOString().split("T")[0];
            pdf.save(`LearnAble_Report_${user?.name ?? "User"}_${dateStr}_${language}.pdf`);

        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Don't render at all until test is completed ────────────────────────
    if (!isTestCompleted) return null;

    return (
        <div className="flex flex-col gap-3 print:hidden">

            {/* ── Controls Row ── */}
            <div className="flex gap-2 items-center flex-wrap">

                {/* Language selector */}
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="mr">Marathi (मराठी)</option>
                </select>

                {/* Download PDF */}
                <Button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                >
                    {isGenerating
                        ? <span className="animate-spin">⏳</span>
                        : <Download className="w-4 h-4" />
                    }
                    {isGenerating ? "Generating..." : "Download PDF"}
                </Button>

                {/* Send Email — only shown when test is completed */}
                <Button
                    variant="secondary"
                    onClick={handleSendMail}
                    disabled={isSendingMail || mailSent}
                    className="flex items-center gap-2"
                >
                    {isSendingMail
                        ? <span className="animate-spin">⏳</span>
                        : mailSent
                            ? <span>✅</span>
                            : <Mail className="w-4 h-4" />
                    }
                    {isSendingMail
                        ? "Sending..."
                        : mailSent
                            ? "Email Sent!"
                            : "Send Report via Email"
                    }
                </Button>
            </div>

            {/* ── Recipient hint ── */}
            {user?.email && !mailSent && (
                <p className="text-xs text-slate-400">
                    📧 Report will be sent to <strong>{user.email}</strong>
                </p>
            )}

            {/* ── Success ── */}
            {mailSent && (
                <p className="text-sm text-green-500 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                    ✅ Report successfully sent to <strong>{user?.email}</strong>
                </p>
            )}

            {/* ── Error ── */}
            {mailError && (
                <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                    ⚠️ {mailError}
                </p>
            )}
        </div>
    );
}
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/Button";
import { translations, Language } from "@/lib/i18n";
import { Download, Mail } from "lucide-react";

interface DownloadReportProps {
    data: any; // The full assessment data
    userName: string;
}

export function DownloadReportButton({ data, userName }: DownloadReportProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [language, setLanguage] = useState<Language>('en');

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const reportElement = document.getElementById("report-content");
            if (!reportElement) {
                console.error("Report content not found");
                return;
            }

            // 1. Capture the current view as an image (for charts/layout)
            const canvas = await html2canvas(reportElement, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                windowWidth: 1200 // Force desktop width
            });

            const imgData = canvas.toDataURL("image/png");

            // 2. Initialize PDF
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4"
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            // 3. Add Image (Basic approach for complex CSS layouts)
            // Ideally, we'd reconstruct the PDF with text for better accessibility/copy-paste,
            // but for charts+layout preservation, html2canvas is safer for MVP.
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Multi-page handling
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            // 4. Save
            const t = translations[language];
            const dateStr = new Date().toISOString().split('T')[0];
            pdf.save(`LearnAble_Report_${userName}_${dateStr}_${language}.pdf`);

        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex gap-2 items-center print:hidden">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="mr">Marathi (मराठी)</option>
            </select>

            <Button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2"
            >
                {isGenerating ? (
                    <span className="animate-spin">⏳</span>
                ) : (
                    <Download className="w-4 h-4" />
                )}
                {isGenerating ? "Generating..." : "Download PDF"}
            </Button>

            <Button variant="secondary" onClick={() => alert("Email feature coming soon!")}>
                <Mail className="w-4 h-4" />
            </Button>
        </div>
    );
}

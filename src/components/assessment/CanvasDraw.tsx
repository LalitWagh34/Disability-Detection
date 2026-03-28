// "use client";

// import { useRef, useState, useEffect } from "react";
// import { Button } from "@/components/ui/Button";

// interface CanvasDrawProps {
//     onCapture?: (dataUrl: string, imageData: ImageData) => void;
//     label?: string;
// }

// export function CanvasDraw({ onCapture, label }: CanvasDrawProps) {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const [isDrawing, setIsDrawing] = useState(false);
//     const contextRef = useRef<CanvasRenderingContext2D | null>(null);

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         // Support for high DPI displays
//         const dpr = window.devicePixelRatio || 1;
//         const rect = canvas.getBoundingClientRect();

//         canvas.width = rect.width * dpr;
//         canvas.height = rect.height * dpr;

//         const context = canvas.getContext("2d", { willReadFrequently: true });
//         if (context) {
//             // context.scale(dpr, dpr); // Scale causes issues with getImageData coordinates if not careful.
//             // Simplified: Handled by canvas width/height.
//             context.scale(dpr, dpr);
//             context.lineCap = "round";
//             context.strokeStyle = "black";
//             context.lineWidth = 3;
//             contextRef.current = context;
//         }
//     }, []);

//     const startDrawing = ({ nativeEvent }: any) => {
//         const { offsetX, offsetY } = getCoordinates(nativeEvent);
//         contextRef.current?.beginPath();
//         contextRef.current?.moveTo(offsetX, offsetY);
//         setIsDrawing(true);
//     };

//     const draw = ({ nativeEvent }: any) => {
//         if (!isDrawing) return;
//         const { offsetX, offsetY } = getCoordinates(nativeEvent);
//         contextRef.current?.lineTo(offsetX, offsetY);
//         contextRef.current?.stroke();
//     };

//     const stopDrawing = () => {
//         contextRef.current?.closePath();
//         setIsDrawing(false);
//         if (onCapture && canvasRef.current && contextRef.current) {
//             // capture raw data for AI
//             const rawData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
//             onCapture(canvasRef.current.toDataURL(), rawData);
//         }
//     };

//     const getCoordinates = (event: MouseEvent | TouchEvent) => {
//         if (window.TouchEvent && event instanceof TouchEvent) {
//             const rect = canvasRef.current!.getBoundingClientRect();
//             const touch = event.touches[0];
//             return {
//                 offsetX: touch.clientX - rect.left,
//                 offsetY: touch.clientY - rect.top
//             }
//         }
//         return {
//             offsetX: (event as MouseEvent).offsetX,
//             offsetY: (event as MouseEvent).offsetY
//         };
//     };

//     const clearCanvas = () => {
//         const canvas = canvasRef.current;
//         if (canvas && contextRef.current) {
//             contextRef.current.clearRect(0, 0, canvas.width, canvas.height); // Clear scaled canvas
//         }
//     };

//     return (
//         <div className="flex flex-col gap-4 w-full">
//             {label && <p className="text-slate-600 dark:text-slate-300 font-medium">{label}</p>}
//             <div className="border-2 border-slate-300 dark:border-slate-600 rounded-2xl overflow-hidden touch-none bg-white">
//                 <canvas
//                     ref={canvasRef}
//                     className="w-full h-64 bg-white cursor-crosshair block"
//                     onMouseDown={startDrawing}
//                     onMouseMove={draw}
//                     onMouseUp={stopDrawing}
//                     onMouseLeave={stopDrawing}
//                     onTouchStart={startDrawing}
//                     onTouchMove={draw}
//                     onTouchEnd={stopDrawing}
//                 />
//             </div>
//             <Button variant="secondary" onClick={clearCanvas} className="self-end">
//                 Clear Pad
//             </Button>
//         </div>
//     );
// }


"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

export interface StrokeMetrics {
    penLifts: number;
    totalPathLength: number;
    drawingTimeMs: number;
    strokeSpeedVariance: number;
    drawingComplete: boolean;
}

interface CanvasDrawProps {
    onCapture?: (dataUrl: string, imageData: ImageData, metrics: StrokeMetrics) => void;
    label?: string;
}

export function CanvasDraw({ onCapture, label }: CanvasDrawProps) {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const contextRef   = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // ── Stroke tracking ───────────────────────────────────────────────────────
    const penLiftsRef        = useRef(0);
    const totalLengthRef     = useRef(0);
    const drawStartRef       = useRef<number | null>(null);
    const drawEndRef         = useRef<number>(0);
    const lastPointRef       = useRef<{x:number;y:number;t:number} | null>(null);
    const strokeSpeedsRef    = useRef<number[]>([]);
    const hasDrawnRef        = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width  = rect.width  * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineCap  = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = "#1e1b4b"; // dark ink colour
            ctx.lineWidth = 2.5;
            contextRef.current = ctx;
        }
    }, []);

    const getCoordinates = (event: MouseEvent | TouchEvent) => {
        if (window.TouchEvent && event instanceof TouchEvent) {
            const rect = canvasRef.current!.getBoundingClientRect();
            const touch = event.touches[0];
            return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
        }
        return { offsetX: (event as MouseEvent).offsetX, offsetY: (event as MouseEvent).offsetY };
    };

    const startDrawing = ({ nativeEvent }: any) => {
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        penLiftsRef.current++;
        const now = Date.now();
        if (!drawStartRef.current) drawStartRef.current = now;
        lastPointRef.current = { x: offsetX, y: offsetY, t: now };
        hasDrawnRef.current = true;
    };

    const draw = ({ nativeEvent }: any) => {
        if (!isDrawing || !contextRef.current) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();

        // Track path length and speed
        const now = Date.now();
        if (lastPointRef.current) {
            const dx = offsetX - lastPointRef.current.x;
            const dy = offsetY - lastPointRef.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const dt = Math.max(1, now - lastPointRef.current.t);
            totalLengthRef.current += dist;
            strokeSpeedsRef.current.push(dist / dt); // px/ms
        }
        lastPointRef.current = { x: offsetX, y: offsetY, t: now };
    };

    const stopDrawing = useCallback(() => {
        if (!isDrawing) return;
        contextRef.current?.closePath();
        setIsDrawing(false);
        drawEndRef.current = Date.now();

        if (onCapture && canvasRef.current && contextRef.current) {
            const rawData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Compute stroke speed variance
            const speeds = strokeSpeedsRef.current;
            let speedVariance = 0;
            if (speeds.length > 1) {
                const mean = speeds.reduce((a,b) => a+b, 0) / speeds.length;
                speedVariance = Math.sqrt(speeds.reduce((s,v) => s + (v - mean)**2, 0) / speeds.length);
            }

            const metrics: StrokeMetrics = {
                penLifts:           penLiftsRef.current,
                totalPathLength:    totalLengthRef.current,
                drawingTimeMs:      drawStartRef.current ? drawEndRef.current - drawStartRef.current : 0,
                strokeSpeedVariance: speedVariance,
                drawingComplete:    hasDrawnRef.current && totalLengthRef.current > 50,
            };

            onCapture(canvasRef.current.toDataURL(), rawData, metrics);
        }
    }, [isDrawing, onCapture]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && contextRef.current) {
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
            // Reset metrics
            penLiftsRef.current        = 0;
            totalLengthRef.current     = 0;
            drawStartRef.current       = null;
            strokeSpeedsRef.current    = [];
            hasDrawnRef.current        = false;
            lastPointRef.current       = null;
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {label && <p className="text-slate-600 dark:text-slate-300 font-medium">{label}</p>}
            {/* Lined writing area */}
            <div className="relative border-2 border-slate-300 dark:border-slate-600 rounded-2xl overflow-hidden touch-none bg-white"
                 style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #ddd6fe 31px, #ddd6fe 32px)", backgroundPositionY: "28px" }}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-40 bg-transparent cursor-crosshair block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <Button variant="secondary" onClick={clearCanvas} className="self-end">
                Clear Pad
            </Button>
        </div>
    );
}
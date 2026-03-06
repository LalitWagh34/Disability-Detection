"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface CanvasDrawProps {
    onCapture?: (dataUrl: string, imageData: ImageData) => void;
    label?: string;
}

export function CanvasDraw({ onCapture, label }: CanvasDrawProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Support for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (context) {
            // context.scale(dpr, dpr); // Scale causes issues with getImageData coordinates if not careful.
            // Simplified: Handled by canvas width/height.
            context.scale(dpr, dpr);
            context.lineCap = "round";
            context.strokeStyle = "black";
            context.lineWidth = 3;
            contextRef.current = context;
        }
    }, []);

    const startDrawing = ({ nativeEvent }: any) => {
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }: any) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current?.lineTo(offsetX, offsetY);
        contextRef.current?.stroke();
    };

    const stopDrawing = () => {
        contextRef.current?.closePath();
        setIsDrawing(false);
        if (onCapture && canvasRef.current && contextRef.current) {
            // capture raw data for AI
            const rawData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            onCapture(canvasRef.current.toDataURL(), rawData);
        }
    };

    const getCoordinates = (event: MouseEvent | TouchEvent) => {
        if (window.TouchEvent && event instanceof TouchEvent) {
            const rect = canvasRef.current!.getBoundingClientRect();
            const touch = event.touches[0];
            return {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            }
        }
        return {
            offsetX: (event as MouseEvent).offsetX,
            offsetY: (event as MouseEvent).offsetY
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && contextRef.current) {
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height); // Clear scaled canvas
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {label && <p className="text-slate-600 dark:text-slate-300 font-medium">{label}</p>}
            <div className="border-2 border-slate-300 dark:border-slate-600 rounded-2xl overflow-hidden touch-none bg-white">
                <canvas
                    ref={canvasRef}
                    className="w-full h-64 bg-white cursor-crosshair block"
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

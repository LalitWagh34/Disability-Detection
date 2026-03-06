"use client";

import { useEffect, useRef, useState } from "react";
import { ModuleShell } from "../ModuleShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function MazeMaster() {
    const { addXp, loseHeart } = useAuth();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [failed, setFailed] = useState(false);

    // Maze configuration
    // 0 = path, 1 = wall, 2 = start, 3 = end
    const MAZE_GRID = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    const CELL_SIZE = 40;

    useEffect(() => {
        drawMaze();
    }, []);

    const drawMaze = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        MAZE_GRID.forEach((row, r) => {
            row.forEach((cell, c) => {
                const x = c * CELL_SIZE;
                const y = r * CELL_SIZE;

                if (cell === 1) {
                    ctx.fillStyle = '#475569'; // Wall color
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    // Aesthetic borders
                    ctx.strokeStyle = '#334155';
                    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                } else if (cell === 2) {
                    ctx.fillStyle = '#22c55e'; // Start (Green)
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    ctx.fillStyle = 'white';
                    ctx.font = '12px sans-serif';
                    ctx.fillText('START', x + 5, y + 25);
                } else if (cell === 3) {
                    ctx.fillStyle = '#ef4444'; // End (Red)
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    ctx.fillStyle = 'white';
                    ctx.font = '12px sans-serif';
                    ctx.fillText('FINISH', x + 2, y + 25);
                } else {
                    ctx.fillStyle = '#f1f5f9'; // Path (Light Slate)
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                }
            });
        });
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (isComplete || failed) return;

        const { x, y } = getMousePos(e);
        const c = Math.floor(x / CELL_SIZE);
        const r = Math.floor(y / CELL_SIZE);

        if (MAZE_GRID[r] && MAZE_GRID[r][c] === 2) {
            setIsDrawing(true);
            setFailed(false);
            drawMaze(); // Reset canvas visual if needed
        }
    };

    const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || isComplete || failed) return;

        const { x, y } = getMousePos(e);
        const c = Math.floor(x / CELL_SIZE);
        const r = Math.floor(y / CELL_SIZE);

        // Draw the path trail
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#a855f7'; // Purple path
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Check Collision with walls
        if (MAZE_GRID[r] && MAZE_GRID[r][c] === 1) {
            failGame();
        }

        // Check Win
        if (MAZE_GRID[r] && MAZE_GRID[r][c] === 3) {
            winGame();
        }
    };

    const handleEnd = () => {
        setIsDrawing(false);
    };

    const failGame = () => {
        setIsDrawing(false);
        setFailed(true);
        loseHeart();

        // Visual Feedback
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; // Red overlay
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const winGame = async () => {
        setIsDrawing(false);
        setIsComplete(true);
        await addXp(50);
    };

    const resetGame = () => {
        setFailed(false);
        drawMaze();
    };

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 text-white p-8 text-center animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">🌀</div>
                <h1 className="text-4xl font-bold mb-4">Maze Conquered!</h1>
                <p className="text-xl opacity-90 mb-8">+50 XP Earned</p>
                <Button onClick={() => router.push("/dashboard")} className="bg-white text-purple-600 hover:bg-purple-50 text-xl px-8 py-4 rounded-full shadow-xl">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <ModuleShell
            title="Maze Master"
            totalSteps={1}
            currentStep={0}
            onExit={() => router.push("/dashboard")}
        >
            <div className="flex flex-col items-center gap-6">
                <p className="text-slate-600 dark:text-slate-300 text-center">
                    Drag from <span className="text-green-600 font-bold">START</span> to <span className="text-red-600 font-bold">FINISH</span> without touching the walls!
                </p>

                <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-300 dark:border-slate-600 touch-none">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        onMouseDown={handleStart}
                        onMouseMove={handleMove}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={handleStart}
                        onTouchMove={handleMove}
                        onTouchEnd={handleEnd}
                        className="bg-white cursor-crosshair"
                    />
                    {failed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
                                <h3 className="text-xl font-bold text-red-600 mb-2">Ouch! Wall Hit!</h3>
                                <Button onClick={resetGame} variant="secondary">Try Again</Button>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-xs text-slate-400">Pro tip: Move slowly and steadily.</p>
            </div>
        </ModuleShell>
    );
}

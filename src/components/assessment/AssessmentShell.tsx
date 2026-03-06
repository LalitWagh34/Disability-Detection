"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button"; // Assuming Button component exists

interface AssessmentShellProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
}

export function AssessmentShell({
  title,
  currentStep,
  totalSteps,
  children,
  onNext,
  onBack,
  isNextDisabled = false,
}: AssessmentShellProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header / Progress */}
      <div className="w-full max-w-3xl mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-3xl flex-1 flex flex-col">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 min-h-[400px] flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={currentStep === 0}
            className={`text-slate-600 dark:text-slate-300 ${currentStep === 0 ? "opacity-0 pointer-events-none" : ""
              }`}
          >
            ← Back
          </Button>

          {onNext && (
            <Button
              onClick={onNext}
              disabled={isNextDisabled}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8"
            >
              {currentStep === totalSteps - 1 ? "Finish" : "Next →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Loader2, Terminal, Sparkles, Code2, Rocket, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  { text: "Analyzing prompt & requirements...", icon: Terminal },
  { text: "Booting up E2B Sandbox...", icon: Rocket },
  { text: "Generating Tailwind CSS & Layout...", icon: Paintbrush },
  { text: "Writing React components...", icon: Code2 },
  { text: "Wiring up interactive logic...", icon: Sparkles },
  { text: "Finalizing preview...", icon: Loader2 },
];

export const CodeGenerationLoader = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    // Cycle through phases every 8 seconds (slower so they have time to read what the agent is doing)
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev < PHASES.length - 1 ? prev + 1 : prev));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = PHASES[phaseIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background/50 backdrop-blur-sm p-6 relative overflow-hidden">
      {/* Background glowing orb effect for premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Pulsing Icon Container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 animate-ping rounded-full" />
          <div className="bg-background border shadow-lg p-4 rounded-2xl relative z-10">
            <CurrentIcon className="size-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Text Container */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Building your application
          </h3>
          
          <div className="h-6 flex items-center justify-center overflow-hidden">
            <p 
              key={phaseIndex} // Key forces re-render/animation on phase change
              className="text-sm text-muted-foreground animate-in slide-in-from-bottom-4 fade-in duration-500"
            >
              {PHASES[phaseIndex].text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

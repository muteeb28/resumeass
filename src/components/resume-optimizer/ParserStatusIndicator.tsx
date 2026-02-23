import { cn } from "@/lib/utils";

interface ParserStatusIndicatorProps {
    status?: 'success' | 'partial' | 'failed';
    confidence?: number;
    className?: string;
    isExtracting?: boolean;
}

export function ParserStatusIndicator({
    status,
    confidence,
    className,
    isExtracting
}: ParserStatusIndicatorProps) {

    if (isExtracting) {
        return (
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50", className)}>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-300">Analyzing structure...</span>
            </div>
        );
    }

    if (!status) return null;

    const config = {
        success: {
            color: "bg-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
            text: "text-green-400",
            label: "Excellent Read"
        },
        partial: {
            color: "bg-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            text: "text-yellow-400",
            label: "Partial Read"
        },
        failed: {
            color: "bg-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            text: "text-red-400",
            label: "Parsing Issue"
        }
    }[status];

    const percentage = Math.round((confidence || 0) * 100);

    return (
        <div className={cn(
            "inline-flex items-center gap-3 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all duration-300",
            config.bg,
            config.border,
            className
        )}>
            <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", config.color)} />

            <div className="flex flex-col leading-none">
                <span className={cn("text-xs font-bold uppercase tracking-wider", config.text)}>
                    {config.label}
                </span>
            </div>

            {confidence !== undefined && (
                <div className={cn("text-xs font-medium px-1.5 py-0.5 rounded bg-black/20", config.text)}>
                    {percentage}% Confidence
                </div>
            )}
        </div>
    );
}

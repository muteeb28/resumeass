import { cn } from "@/lib/utils";

interface LoaderProps {
    text?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function LoaderFive({ text = "Loading...", className, size = "md" }: LoaderProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-14 h-14"
    };

    const dotSizeClasses = {
        sm: "w-1.5 h-1.5",
        md: "w-2.5 h-2.5",
        lg: "w-3.5 h-3.5"
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
            <div className={cn("relative", sizeClasses[size])}>
                {/* Spinning circle */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>

                {/* Center dot */}
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse",
                    dotSizeClasses[size]
                )}></div>
            </div>

            {text && (
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}

export function LoaderOne({ text = "Loading...", className }: LoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
                        style={{
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: "0.6s"
                        }}
                    ></div>
                ))}
            </div>
            {text && (
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {text}
                </p>
            )}
        </div>
    );
}

export function LoaderTwo({ text = "Loading...", className }: LoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
            {text && (
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {text}
                </p>
            )}
        </div>
    );
}

export function LoaderThree({ text = "Loading...", className }: LoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-blue-500/30 dark:border-blue-400/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 dark:border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }}></div>
            </div>
            {text && (
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {text}
                </p>
            )}
        </div>
    );
}

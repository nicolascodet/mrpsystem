import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center h-[200px]">
      <Loader2 className={cn("h-8 w-8 animate-spin text-indigo-600", className)} />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner className="h-12 w-12 text-indigo-600" />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-50">
      <LoadingSpinner className="h-8 w-8 text-indigo-600" />
    </div>
  )
}

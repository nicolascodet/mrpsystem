import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  )
}

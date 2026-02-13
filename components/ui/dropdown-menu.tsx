import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
})

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<HTMLDivElement, { asChild?: boolean, children: React.ReactNode }>(
  ({ children, asChild, ...props }, ref) => {
    const { setOpen, open } = React.useContext(DropdownMenuContext)
    return (
      <div 
        ref={ref} 
        {...props} 
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = ({ align = "end", className, children }: { align?: "start" | "end" | "center", className?: string, children: React.ReactNode }) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  
  if (!open) return null

  return (
    <div 
      className={cn(
        "absolute mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-zinc-100 bg-white p-1.5 text-zinc-950 shadow-2xl animate-in fade-in-80 zoom-in-95 z-50",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      onClick={() => setOpen(false)}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext)
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-600 outline-none transition-all hover:bg-violet-50 hover:text-violet-600 focus:bg-violet-50 focus:text-violet-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 active:scale-95",
          className
        )}
        onClick={(e) => {
          onClick?.(e)
          setOpen(false)
        }}
        {...props}
      />
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }

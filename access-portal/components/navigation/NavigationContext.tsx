"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Section = 
  | "dashboard" 
  | "nfc-tags" 
  | "verification-logs" 
  | "user-management" 
  | "blockchain-status" 
  | "settings"

interface NavigationContextType {
  currentSection: Section
  setCurrentSection: (section: Section) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState<Section>("dashboard")

  return (
    <NavigationContext.Provider value={{ currentSection, setCurrentSection }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}

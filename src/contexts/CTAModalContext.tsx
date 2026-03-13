import { createContext, useContext, useState, ReactNode } from "react";

interface CTAModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CTAModalContext = createContext<CTAModalContextType | undefined>(undefined);

export const CTAModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <CTAModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </CTAModalContext.Provider>
  );
};

export const useCTAModal = () => {
  const context = useContext(CTAModalContext);
  if (!context) {
    throw new Error("useCTAModal must be used within a CTAModalProvider");
  }
  return context;
};

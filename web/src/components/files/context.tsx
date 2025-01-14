import React, { useState } from "react";

export interface SelectedFileType {
  url: string | null;
  setURL: (name: string) => void;
}

export const SelectedFileContext = React.createContext<
  SelectedFileType | undefined
>(undefined);

interface Props {
  children: React.ReactNode;
}

const SelectedFile: React.FC<Props> = ({ children }) => {
  const [url, setURL] = useState<string | null>(null);

  return (
    <SelectedFileContext.Provider value={{ url, setURL }}>
      {children}
    </SelectedFileContext.Provider>
  );
};

export default SelectedFile;

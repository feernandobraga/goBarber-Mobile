import React from "react";

// we import all context/hooks providers we need and we create a component that contains all of them.
// this works as a global provider that provides hooks/contexts to the entire application (if added to App.tsx)
import { AuthProvider } from "./auth";

const AppProvider: React.FC = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProvider;

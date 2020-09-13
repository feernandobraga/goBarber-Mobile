import React from "react";

// importing protected and non-protected routes
import AuthRoutes from "./auth.routes";
import AppRoutes from "./app.routes";

// import the hook/context that checks if users are authenticated or not
import { useAuth } from "../hooks/auth";

// importing loading element
import { ActivityIndicator, View } from "react-native";

const Routes: React.FC = () => {
  // retrieve the user
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  // return correct routes based on user existence
  return user ? <AppRoutes /> : <AuthRoutes />;
};

export default Routes;

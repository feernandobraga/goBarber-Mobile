import React from "react";

// used to create the stack style navigation
import { createStackNavigator } from "@react-navigation/stack";

// importing the pages
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

// having access to the stack navigation
const Auth = createStackNavigator();

const AuthRoutes: React.FC = () => {
  return (
    <Auth.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#312e38" },
      }}
      // initialRouteName="SignUp"
    >
      <Auth.Screen name="SignIn" component={SignIn} />
      <Auth.Screen name="SignUp" component={SignUp} />
    </Auth.Navigator>
  );
};

export default AuthRoutes;

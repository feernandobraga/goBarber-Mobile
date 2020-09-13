import React from "react";

// used to create the stack style navigation
import { createStackNavigator } from "@react-navigation/stack";

// importing the pages
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import CreateAppointment from "../pages/CreateAppointment";
import AppointmentCreated from "../pages/AppointmentCreated";

// having access to the stack navigation
const App = createStackNavigator();

const AuthRoutes: React.FC = () => {
  return (
    <App.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#312e38" },
      }}
    >
      <App.Screen name="Dashboard" component={Dashboard} />
      <App.Screen name="CreateAppointment" component={CreateAppointment} />
      <App.Screen name="AppointmentCreated" component={AppointmentCreated} />

      <App.Screen name="Profile" component={Profile} />
    </App.Navigator>
  );
};

export default AuthRoutes;

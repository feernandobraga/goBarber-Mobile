import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useEffect,
} from "react";

// importing the API
import api from "../services/api";

// importing the local storage lib
import AsyncStorage from "@react-native-community/async-storage";

// interface to handle credentials
interface SignInCredentials {
  email: string;
  password: string;
}

// interface to handle the user information from api calls
interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

// the information we will store about a certain API call
// this information is going to be accessible by other components/pages
interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>; //signIn method
  signOut(): void; // signOut method
  loading: boolean;
  updateUser(user: User): Promise<void>; // called when the user update his profile
}

// interface to store user information into localStorage
interface AuthState {
  token: string;
  user: User;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// this function create a hook that we use to simplify the way we call the context from other pages.
// from other pages they only need to import useAuth() from this context file
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider> element");
  }

  return context;
}

/**
 * The strategy here is to create a component that work as a wrapper for other components that need to access the Context API
 * Hence why we use children props (so we can just return/bypass it back).
 * The component then returns AuthContext.Provider (which makes the data from the API call available)
 * and passes a method, in this case signIn() to any component wrapped by AuthProvider
 * <AuthProvider> can be found in the App.tsx wrapping the pages that need information from the user Authenticated
 */
export const AuthProvider: React.FC = ({ children }) => {
  // instead of pre-setting the value of this state manually, we call a function that sets the initial value to either
  // the stored token and user, or null
  const [data, setData] = useState<AuthState>({} as AuthState);

  // state to check if the application is loading
  const [loading, setLoading] = useState(true);

  // useEffect to get information from storage
  useEffect(() => {
    async function loadStorageData(): Promise<void> {
      const [token, user] = await AsyncStorage.multiGet([
        "@GoBarber:token",
        "@GoBarber:user",
      ]);

      // the key is stored in the value [0], and the value in the position [1]
      if (token[1] && user[1]) {
        api.defaults.headers.authorization = `Bearer ${token[1]}`; // to send the authorization request with every API call

        setData({ token: token[1], user: JSON.parse(user[1]) });
      }

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }

    loadStorageData();
  }, []);

  // a call back function that receives email and password from the caller, and sends the request to the API
  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post("/sessions", {
      email,
      password,
    });

    const { token, user } = response.data;

    // storing the JWT and the user into local storage
    // await AsyncStorage.setItem("@GoBarber:token", token);
    // await AsyncStorage.setItem("@GoBarber:user", JSON.stringify(user));

    await AsyncStorage.multiSet([
      ["@GoBarber:token", token],
      ["@GoBarber:user", JSON.stringify(user)],
    ]);

    api.defaults.headers.authorization = `Bearer ${token}`; // to send the authorization request with every API call

    setData({ token, user });
  }, []);

  // function/callback for logout - delete the user from local storage and from the context
  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(["@GoBarber:token", "@GoBarber:user"]);
    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      await AsyncStorage.setItem("@GoBarber:user", JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [setData, data.token]
  );

  return (
    /* AuthContext.Provider is what makes the context available by other components wrapped by it */
    <AuthContext.Provider
      value={{ user: data.user, loading, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

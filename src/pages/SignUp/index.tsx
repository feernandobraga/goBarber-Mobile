import React, { useRef, useCallback } from "react";

import Icon from "react-native-vector-icons/Feather";

// logo image
import logoImg from "../../assets/logo.png";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

// shared components
import Input from "../../components/Input";
import Button from "../../components/Button";

// navigation for routing
import { useNavigation } from "@react-navigation/native";

// importing unform
import { Form } from "@unform/mobile";
import { FormHandles } from "@unform/core";

// importing Yup for form validation
import * as Yup from "yup";

// import Error validation auxiliary
import getValidationErrors from "../../utils/getValidationErrors";

// importing the API
import api from "../../services/api";

// styled components
import { Container, Title, BackToSignInText, BackToSignIn } from "./styles";

// interface used to strongly type the data coming from the form
interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const navigation = useNavigation();

  // creating reference for email and password so from name we target email, and from email we target password
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // function that handles when the submit button is pressed
  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        // we create a validation schema and pass the data from the from to it
        const schema = Yup.object().shape({
          name: Yup.string().required("You must enter a name"),
          email: Yup.string()
            .required("You must enter an email")
            .email("Please enter a valid email address"),
          password: Yup.string().min(6, "At least 6 characters"),
        });

        // abortEarly: false is used so Yub doesn't stop at the first validation error and keeps going
        await schema.validate(data, {
          abortEarly: false,
        });

        // sending the user data to the server
        await api.post("/users", data);

        Alert.alert("Success!", "Please sign in with your new credentials");

        navigation.navigate("SignIn");
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          // this function attributes error messages based on what input field triggered the validation error
          formRef.current?.setErrors(errors);

          // to return before running the toast
          return;
        }

        Alert.alert(
          "Error during authentication...",
          "username and password don't match"
        );
      }
    },
    [navigation]
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <Image source={logoImg} />

            <View>
              <Title>Create a new account</Title>
            </View>

            <Form style={{ width: "100%" }} ref={formRef} onSubmit={handleSignUp}>
              <Input
                name="name"
                icon="user"
                placeholder="Name"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />
              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="Email"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Password"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />
              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Sign up
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <BackToSignIn onPress={() => navigation.navigate("SignIn")}>
        <Icon name="arrow-left" size={20} color="#fff" />
        <BackToSignInText>Back to sign in</BackToSignInText>
      </BackToSignIn>
    </>
  );
};

export default SignUp;

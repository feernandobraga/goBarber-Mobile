import React, { useCallback, useRef } from "react";

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

// Form component from unform
import { Form } from "@unform/mobile";

// handles to strongly type the useRef
import { FormHandles } from "@unform/core";

// Yup is used for formValidation
import * as Yup from "yup";

// auxiliary function to handle the error validation
import getValidationErrors from "../../utils/getValidationErrors";

import { useAuth } from "../../hooks/auth";

// styled components
import {
  Container,
  Title,
  ForgotPassword,
  ForgotPasswordText,
  CreateAccountButton,
  CreateAccountButtonText,
} from "./styles";

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const navigation = useNavigation();

  const formRef = useRef<FormHandles>(null);

  // ref used to give focus to the password input
  const passwordInputRef = useRef<TextInput>(null);

  // instantiating the hook provider to get the methods signIn and signOut
  const { signIn, user } = useAuth();

  // callback function when the form is submitted
  const handleSignIn = useCallback(
    async (data: SignInFormData) => {
      try {
        formRef.current?.setErrors({});

        // we create a validation schema and pass the data from the form to it
        const schema = Yup.object().shape({
          email: Yup.string()
            .required("You must enter an email")
            .email("Please enter a valid email address"),
          password: Yup.string().required("Please enter a password"),
        });

        // abortEarly: false is used so Yub doesn't stop at the first validation error and keeps going
        await schema.validate(data, {
          abortEarly: false,
        });

        // call the method signIn from the custom hook provider
        await signIn({
          email: data.email,
          password: data.password,
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          // this function attributes error messages based on what input field triggered the validation error
          formRef.current?.setErrors(errors);

          // to return before running the alert message
          return;
        }

        Alert.alert(
          "Error during authentication...",
          "username and password don't match"
        );
      }
    },
    [signIn]
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
              <Title>SIGN IN</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignIn} style={{ width: "100%" }}>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="Email"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Password"
                secureTextEntry
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
                Sign in
              </Button>
            </Form>

            <ForgotPassword onPress={() => {}}>
              <ForgotPasswordText>I forgot my password</ForgotPasswordText>
            </ForgotPassword>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <CreateAccountButton onPress={() => navigation.navigate("SignUp")}>
        <Icon name="log-in" size={20} color="#ff9000" />
        <CreateAccountButtonText>Create a new account</CreateAccountButtonText>
      </CreateAccountButton>
    </>
  );
};

export default SignIn;

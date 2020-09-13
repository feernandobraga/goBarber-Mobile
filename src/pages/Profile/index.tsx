import React, { useRef, useCallback } from "react";

import Icon from "react-native-vector-icons/Feather";

import ImagePicker from "react-native-image-picker";

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
import { useAuth } from "../../hooks/auth";

import { Container, Title, UserAvatar, UserAvatarButton, BackButton } from "./styles";

// interface used to strongly type the data coming from the form
interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  old_password: string;
  password_confirmation: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const navigation = useNavigation();

  const { user, updateUser, signOut } = useAuth();

  // creating reference for the form components so we can grab values and do cool stuff with it like moving the cursor to the next field
  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // function that handles when the submit button is pressed
  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        // we create a validation schema and pass the data from the from to it
        const schema = Yup.object().shape({
          name: Yup.string().required("You must enter a name"),
          email: Yup.string()
            .required("You must enter an email")
            .email("Please enter a valid email address"),
          old_password: Yup.string(),
          password: Yup.string().when("old_password", {
            is: (val) => !!val.length,
            then: Yup.string().required("this field is mandatory"),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when("old_password", {
              is: (val) => !!val.length,
              then: Yup.string().required("this field is mandatory"),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref("password"), undefined], "new password don't match"),
        });

        // abortEarly: false is used so Yub doesn't stop at the first validation error and keeps going
        await schema.validate(data, {
          abortEarly: false,
        });

        const { name, email, old_password, password, password_confirmation } = data;

        const formData = {
          name,
          email,
          ...(old_password ? { old_password, password, password_confirmation } : {}),
        };

        // sending the user data to the server
        const response = await api.put("/profile", formData);
        updateUser(response.data);

        Alert.alert("Success!", "Your profile has been updated");

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          // this function attributes error messages based on what input field triggered the validation error
          formRef.current?.setErrors(errors);

          // to return before running the toast
          return;
        }

        Alert.alert(
          "Error, you profile was not updated",
          "something went wrong, please try again later."
        );
      }
    },
    [navigation, updateUser]
  );

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: "Please select an image",
        cancelButtonTitle: "Cancel",
        takePhotoButtonTitle: "From camera",
        chooseFromLibraryButtonTitle: "From library",
      },
      async (response) => {
        // response is the result of the action that the user can take
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert("Could not complete the operation. Please try again");
          return;
        }

        const data = new FormData();

        // console.log(response.uri);

        data.append("avatar", {
          type: "image/jpeg",
          name: `${user.id}.jpg`,
          uri: response.uri, //the path to the image from the response
        });

        console.log("idk");

        console.log(data);

        setTimeout(async () => {
          const res = await api.patch("users/avatar", data);
        }, 5000);
      }
    );
  }, [updateUser, user.id]);

  const handleGoBack = useCallback(() => {
    // when the user press the back button
    navigation.goBack();
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

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
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>My Profile</Title>
            </View>

            <Form
              initialData={{ name: user.name, email: user.email }}
              style={{ width: "100%" }}
              ref={formRef}
              onSubmit={handleSignUp}
            >
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
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                name="old_password"
                icon="lock"
                placeholder="Current password"
                secureTextEntry
                containerStyle={{ marginTop: 16 }} //prop user to create the separation. This is passed to the container of the input element
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="New password"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordInputRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirm new password"
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
                Update Profile
              </Button>

              <Button onPress={handleSignOut}>Sign out</Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignUp;

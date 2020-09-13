import React from "react";
import { render } from "react-native-testing-library";
import SignIn from "../../pages/SignIn";

jest.mock("@react-navigation/native", () => {
  // mock this lib and its useNavigation() function
  return {
    useNavigation: jest.fn(), // mock the function to do nothing
  };
});

describe("SignIn Page", () => {
  it("should contain email/password inputs", () => {
    const { getByPlaceholder } = render(<SignIn />); // retrieve a component from the page signIn based on a given placeholder

    expect(getByPlaceholder("Email")).toBeTruthy();
    expect(getByPlaceholder("Password")).toBeTruthy();
  });
});

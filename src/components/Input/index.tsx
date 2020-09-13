import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";

// importing default properties from a text
import { TextInputProps } from "react-native";

// import to register/handle the inputs and the data the user entered
import { useField } from "@unform/core";

// import custom styles
import { Container, TextInput, Icon } from "./styles";

interface InputProps extends TextInputProps {
  name: string;
  icon: string;
  containerStyle?: {};
}

interface InputValueReference {
  value: string;
}

interface InputRef {
  focus(): void;
}

const Input: React.RefForwardingComponent<InputRef, InputProps> = (
  { name, icon, containerStyle = {}, ...rest },
  ref
) => {
  // ref to target the inputElement
  const inputElementRef = useRef<any>(null);

  // state to manage if the element has focus or not and make the styling validation
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  // callBack functions to handle when the input gets/loses focus
  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    // if the input has some text in it when it loses focus, set true or false accordingly
    // could have been written like setIfFilled(!!inputValueRef.current.value)
    if (inputValueRef.current.value) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  }, []);

  // registering the input component with unForm
  const { registerField, defaultValue = "", fieldName, error } = useField(name);

  // we store a reference to the input, so we can manipulate it directly
  const inputValueRef = useRef<InputValueReference>({ value: defaultValue });

  /**
   * hook to pass parameters from a children to a parent element.
   * it will take the reference as first argument and a function with the properties we want to pass to the ref from the first argument
   * here it takes the method focus, which gets the reference for the input and set a focus to it.
   */
  useImperativeHandle(ref, () => ({
    focus() {
      inputElementRef.current.focus();
    },
  }));

  useEffect(() => {
    registerField<string>({
      name: fieldName,
      ref: inputValueRef.current,
      path: "value",
      setValue(ref: any, value) {
        inputValueRef.current.value = value;
        inputElementRef.current.setNativeProps({ text: value });
      },
      clearValue() {
        inputValueRef.current.value = "";
        inputElementRef.current.clear();
      },
    });
  }, [fieldName, registerField]);

  return (
    <Container style={containerStyle} isFocused={isFocused} isErrored={!!error}>
      <Icon name={icon} size={20} color={isFocused || isFilled ? "#ff9000" : "#666360"} />
      <TextInput
        ref={inputElementRef}
        keyboardAppearance="dark"
        placeholderTextColor="#666360"
        defaultValue={defaultValue}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChangeText={(value) => {
          inputValueRef.current.value = value;
        }}
        {...rest}
      />
    </Container>
  );
};

export default forwardRef(Input);

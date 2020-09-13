import React from "react";

// importing the default properties of a RectButton, so we can use the method on press
import { RectButtonProperties } from "react-native-gesture-handler";

// import styles components
import { Container, ButtonText } from "./styles";

interface ButtonProps extends RectButtonProperties {
  children: string;
}

/**
 * children will get anything that the component i.e.
 * <Button> I'm a children element </Button>
 * so the value of children will be I'm a children element
 */
const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <Container {...rest}>
      <ButtonText>{children}</ButtonText>
    </Container>
  );
};

export default Button;

import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Container, Title, Description, OkButton, OkButtonText } from "./styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { format } from "date-fns";
import enAu from "date-fns/locale/en-AU";

interface RouteParams {
  // to get the date passed through params in the route
  date: number;
}

const AppointmentCreated: React.FC = () => {
  const { reset } = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  const handleOkPressed = useCallback(() => {
    //when the user presses the OK button
    reset({
      routes: [
        {
          name: "Dashboard", // the name of the route being reset
        },
      ],
      index: 0, // the index for the route being reset
    });
  }, [reset]);

  const formattedDate = useMemo(() => {
    return format(routeParams.date, "EEEE',' MMMM' 'dd 'at' HH:mm'h'", {
      //Thursday, August 27 at 10:00h
      locale: enAu,
    });
  }, [routeParams.date]);

  return (
    <>
      <Container>
        <Icon name="check" size={80} color="#04d361" />

        <Title>Your Booking is confirmed!</Title>
        <Description>{formattedDate}</Description>
        <OkButton onPress={handleOkPressed}>
          <OkButtonText>Ok</OkButtonText>
        </OkButton>
      </Container>
    </>
  );
};

export default AppointmentCreated;

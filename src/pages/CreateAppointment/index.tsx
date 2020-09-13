import React, { useCallback, useEffect, useState, useMemo } from "react";
import { View, Platform, Alert } from "react-native";

import { useRoute, useNavigation } from "@react-navigation/native";

import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../../hooks/auth";

import DateTimePicker from "@react-native-community/datetimepicker"; // date time picker

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  ProvidersList,
  ProvidersListContainer,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  Content,
  CreateAppointmentButtonText,
  CreateAppointmentButton,
} from "./styles";

import { format } from "date-fns";

import api from "../../services/api";

// to retrieve the params passed in the route
interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface AvailabilityItem {
  // used by the state "availability" to store the availability from API call
  // every time a state stores an object or array, we create an interface
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const route = useRoute();
  const routeParams = route.params as RouteParams; // strongly typing so we can retrieve the providerID from the params
  const { user } = useAuth(); // to handle the user authenticated
  const { goBack, navigate } = useNavigation(); // handles the back button navigation
  const [providers, setProviders] = useState<Provider[]>([]); // state that holds all providers from api call
  const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId); //handles the clicked user
  const [showDatePicker, setShowDatePicker] = useState(false); // handles the calendar for Android users
  const [selectedDate, setSelectedDate] = useState(new Date()); // store the date selected via picker
  const [selectedHour, setSelectedHour] = useState(0); // store the hour selected
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]); // every time a state stores an object or array, we create an interface - stores the provider availability

  useEffect(() => {
    // retrieve providers list from API
    api.get("providers").then((response) => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    // fetch the availability every time the date changes
    api
      .get(`providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then((response) => {
        setAvailability(response.data);
      });
  }, [selectedDate, selectedProvider]);

  const navigateBack = useCallback(() => {
    //sends the user back to the previous page
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    // when a new provider is clicked/selected
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    // toggle the date picker

    setShowDatePicker(!showDatePicker);
  }, [showDatePicker]);

  const handleDateChanged = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === "android") {
      // resets the toggle on Android devices
      setShowDatePicker(false);
    }

    if (date) {
      // date is passed to the method
      setSelectedDate(date);
    }
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    // when the button Book is clicked

    try {
      const date = new Date(selectedDate);
      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post("appointments", {
        provider_id: selectedProvider,
        date,
      });

      navigate("AppointmentCreated", { date: date.getTime() }); // we convert the booking date to a string so we can re-create the Date object from the other side
    } catch (err) {
      Alert.alert(
        "Your booking was not created",
        "Something went wrong and your booking was not created. Please try again."
      );
    }
  }, [navigate, selectedDate, selectedHour, selectedProvider]);

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const morningAvailability = useMemo(() => {
    // hook that fetches the morning availability every time the state availability changes
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), "HH:00"),
        };
      });
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    // hook that fetches the afternoon availability every time the state availability changes
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), "HH:00"),
        };
      });
  }, [availability]);

  return (
    <>
      <Container>
        <Header>
          <BackButton onPress={navigateBack}>
            <Icon name="chevron-left" size={24} color="#999591" />
          </BackButton>

          <HeaderTitle>Barbers</HeaderTitle>

          <UserAvatar source={{ uri: user.avatar_url }} />
        </Header>

        <Content>
          <ProvidersListContainer>
            <ProvidersList
              data={providers} // tells where the data is coming from
              horizontal //makes the list horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(provider) => provider.id}
              renderItem={({ item: provider }) => (
                <ProviderContainer
                  onPress={() => {
                    handleSelectProvider(provider.id); // every time we call a function that has a parameter, we need to use an arrow function before
                  }}
                  selected={provider.id === selectedProvider} // props used to change the colour based on the selected provider
                >
                  <ProviderAvatar source={{ uri: provider.avatar_url }} />
                  <ProviderName
                    selected={provider.id === selectedProvider} // props used to change the colour based on the selected provider
                  >
                    {provider.name}
                  </ProviderName>
                </ProviderContainer>
              )}
            ></ProvidersList>
          </ProvidersListContainer>
          <Calendar>
            <Title>Select the date</Title>

            <OpenDatePickerButton onPress={handleToggleDatePicker}>
              <OpenDatePickerButtonText>Select another date</OpenDatePickerButtonText>
            </OpenDatePickerButton>

            {showDatePicker && (
              <DateTimePicker
                mode="date"
                display="calendar"
                textColor="#f4ede8"
                onChange={handleDateChanged}
                value={selectedDate}
              />
            )}
          </Calendar>

          <Schedule>
            <Title>Select a time slot</Title>

            {/* MORNING */}
            <Section>
              <SectionTitle>Morning</SectionTitle>

              <SectionContent>
                {morningAvailability.map(({ hourFormatted, hour, available }) => (
                  <Hour
                    enabled={available}
                    selected={selectedHour === hour}
                    available={available}
                    onPress={() =>
                      /* every time a function has arguments, we need to use an arrow function */
                      handleSelectHour(hour)
                    }
                    key={hourFormatted}
                  >
                    <HourText selected={selectedHour === hour}>{hourFormatted}</HourText>
                  </Hour>
                ))}
              </SectionContent>
            </Section>

            {/* AFTERNOON */}
            <Section>
              <SectionTitle>Afternoon</SectionTitle>

              <SectionContent>
                {afternoonAvailability.map(({ hourFormatted, hour, available }) => (
                  <Hour
                    enabled={available}
                    selected={selectedHour === hour}
                    available={available}
                    /* every time a function has arguments, we need to use an arrow function */
                    onPress={() => handleSelectHour(hour)}
                    key={hourFormatted}
                  >
                    <HourText selected={selectedHour === hour}>{hourFormatted}</HourText>
                  </Hour>
                ))}
              </SectionContent>
            </Section>
          </Schedule>

          <CreateAppointmentButton onPress={handleCreateAppointment}>
            <CreateAppointmentButtonText>Book</CreateAppointmentButtonText>
          </CreateAppointmentButton>
        </Content>
      </Container>
    </>
  );
};

export default CreateAppointment;

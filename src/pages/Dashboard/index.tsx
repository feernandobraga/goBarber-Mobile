import React, { useCallback, useEffect, useState } from "react";
import { View, Button } from "react-native";

import { useAuth } from "../../hooks/auth"; // hook that handles authentication

import { useNavigation } from "@react-navigation/native";

import api from "../../services/api";

import Icon from "react-native-vector-icons/Feather";

import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UserAvatar,
  ProvidersList,
  ProvidersListTitle,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMeta,
  ProviderMetaText,
} from "./styles";

export interface Provider {
  // every time we use an object/array inside the useState, it's recommended to have an interface
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]); // store providers from API

  const { user } = useAuth(); // handle authenticated user
  const { navigate } = useNavigation(); // handle routing

  useEffect(() => {
    api.get("providers").then((response) => {
      setProviders(response.data);
    });
  }, []);

  const navigateToProfile = useCallback(() => {
    navigate("Profile");
  }, [navigate]);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      navigate("CreateAppointment", { providerId });
    },
    [navigate]
  );

  return (
    <>
      <Container>
        <Header>
          <HeaderTitle>
            Welcome, {"\n"} {/* to break a line, same as <br> */}
            <UserName>{user.name}</UserName>
          </HeaderTitle>

          <ProfileButton onPress={navigateToProfile}>
            <UserAvatar source={{ uri: user.avatar_url }} />
          </ProfileButton>
        </Header>

        <ProvidersList
          contentContainerStyle={{ paddingBottom: 40 }}
          data={providers}
          keyExtractor={(provider) => provider.id}
          ListHeaderComponent={<ProvidersListTitle>Barbers</ProvidersListTitle>}
          renderItem={(
            {
              item: provider,
            } /* each item from the provider -> item: provider is basically giving each item an alias of provider */
          ) => (
            <ProviderContainer onPress={() => navigateToCreateAppointment(provider.id)}>
              {/* every time we call a function that has a parameter, we need to use an arrow function before */}

              <ProviderAvatar source={{ uri: provider.avatar_url }} />
              <ProviderInfo>
                <ProviderName>{provider.name}</ProviderName>

                <ProviderMeta>
                  <Icon name="calendar" size={14} color="#ff9000" />
                  <ProviderMetaText>Monday to Friday</ProviderMetaText>
                </ProviderMeta>

                <ProviderMeta>
                  <Icon name="clock" size={14} color="#ff9000" />
                  <ProviderMetaText>8 AM til 6 PM</ProviderMetaText>
                </ProviderMeta>
              </ProviderInfo>
            </ProviderContainer>
          )}
        />
      </Container>
    </>
  );
};

export default Dashboard;

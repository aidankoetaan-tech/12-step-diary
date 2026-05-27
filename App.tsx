import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import StepsScreen from './src/screens/StepsScreen';
import JournalScreen from './src/screens/JournalScreen';
import SponsorScreen from './src/screens/SponsorScreen';
import { RootTabParamList } from './src/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Deep, calm dark theme
const RecoveryTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7C6FF7',
    background: '#0D0D2B',
    card: '#0D0D2B',
    text: '#EAEAFF',
    border: '#1E1E3A',
    notification: '#7C6FF7',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={RecoveryTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0D0D2B',
              borderTopColor: '#1E1E3A',
              borderTopWidth: 1,
              height: 85,
              paddingBottom: 28,
              paddingTop: 8,
            },
            tabBarActiveTintColor: '#7C6FF7',
            tabBarInactiveTintColor: '#4A4A6A',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.3,
            },
            tabBarIcon: ({ color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'home';

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Steps') {
                iconName = 'footsteps';
              } else if (route.name === 'Journal') {
                iconName = 'book';
              } else if (route.name === 'Sponsor') {
                iconName = 'people';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarLabel: 'Home' }}
          />
          <Tab.Screen
            name="Steps"
            component={StepsScreen}
            options={{ tabBarLabel: 'Steps' }}
          />
          <Tab.Screen
            name="Journal"
            component={JournalScreen}
            options={{ tabBarLabel: 'Journal' }}
          />
          <Tab.Screen
            name="Sponsor"
            component={SponsorScreen}
            options={{ tabBarLabel: 'Sponsor' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

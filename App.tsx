import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import StepsScreen from './src/screens/StepsScreen';
import ToolsScreen from './src/screens/ToolsScreen';
import CopingScreen from './src/screens/CopingScreen';
import TriggerLogScreen from './src/screens/TriggerLogScreen';
import PlanScreen from './src/screens/PlanScreen';
import JournalScreen from './src/screens/JournalScreen';
import SupportScreen from './src/screens/SupportScreen';
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import MeditationScreen from './src/screens/MeditationScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import { RootTabParamList, ToolsStackParamList } from './src/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ToolsStack = createNativeStackNavigator<ToolsStackParamList>();

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

async function getRemembered(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem('auth.remembered') === 'true';
  }
  try {
    const val = await SecureStore.getItemAsync('auth.remembered');
    return val === 'true';
  } catch {
    return false;
  }
}

function ToolsStackScreen() {
  return (
    <ToolsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ToolsStack.Screen name="ToolsMenu" component={ToolsScreen} />
      <ToolsStack.Screen name="Coping" component={CopingScreen} />
      <ToolsStack.Screen name="Triggers" component={TriggerLogScreen} />
      <ToolsStack.Screen name="Plan" component={PlanScreen} />
      <ToolsStack.Screen name="Meditation" component={MeditationScreen} />
      <ToolsStack.Screen name="Emergency" component={EmergencyScreen} />
    </ToolsStack.Navigator>
  );
}

function MainTabs() {
  return (
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
            } else if (route.name === 'Tools') {
              iconName = 'construct';
            } else if (route.name === 'Journal') {
              iconName = 'book';
            } else if (route.name === 'Support') {
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
          name="Tools"
          component={ToolsStackScreen}
          options={{ tabBarLabel: 'Tools' }}
        />
        <Tab.Screen
          name="Journal"
          component={JournalScreen}
          options={{ tabBarLabel: 'Journal' }}
        />
        <Tab.Screen
          name="Support"
          component={SupportScreen}
          options={{ tabBarLabel: 'Support' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedRemember, setCheckedRemember] = useState(false);

  // After splash, check if user was remembered.
  useEffect(() => {
    if (showSplash) return;
    if (checkedRemember) return;
    getRemembered().then((remembered) => {
      if (remembered) setIsAuthenticated(true);
      setCheckedRemember(true);
    });
  }, [showSplash, checkedRemember]);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onDone={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <MainTabs />
    </SafeAreaProvider>
  );
}
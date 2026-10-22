import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AboutScreen from '../screens/AboutScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CareerCaseScreen from '../screens/CareerCaseScreen';
import ContributeScreen from '../screens/ContributeScreen';
import PeopleLikeMeScreen from '../screens/PeopleLikeMeScreen';
import JobSeekerProfileScreen from '../screens/JobSeekerProfileScreen';
import { colors } from '../styles/styles';

// Jeg bruger farverne fra styles.js, så navigationen passer til resten af appen.
// Header-designet er det samme for både stakken og de tabs, der har egen header.
const headerOptions = {
  headerStyle: {
    backgroundColor: colors.navy,
  },

  // Farven på titel og tilbage-pil.
  headerTintColor: colors.white,

  headerTitleStyle: {
    fontWeight: '600',
  },
};

// Ikon til hver tab. Den aktive tab får det fyldte ikon,
// de andre får outline-versionen (fx "compass-outline").
const TAB_ICONS = {
  ExploreTab: 'compass',
  AboutTab: 'information-circle',
  ContributeTab: 'add-circle',
};

// Jeg opretter en Stack Navigator til Explore-delen.
// Den indeholder Explore-listen, People Like Me, jobsøgerprofilen og detaljesiden,
// så brugeren altid kan gå tilbage til den forrige skærm.
const Stack = createNativeStackNavigator();

function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      {/* Startsiden i Explore-flowet med listen over alle career cases. */}
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: 'Explore Careers' }}
      />

      {/* Matches baseret på jobsøgerens gemte profil. */}
      <Stack.Screen
        name="PeopleLikeMe"
        component={PeopleLikeMeScreen}
        options={{ title: 'People Like Me' }}
      />

      {/* Formularen hvor jobsøgeren opretter eller redigerer sin profil. */}
      <Stack.Screen
        name="JobSeekerProfile"
        component={JobSeekerProfileScreen}
        options={{ title: 'My Profile' }}
      />

      {/*
        Detaljesiden bruges både fra Explore og fra People Like Me,
        så der ikke findes to forskellige detaljesider.
      */}
      <Stack.Screen
        name="CareerCase"
        component={CareerCaseScreen}
        options={{ title: 'Career Case' }}
      />
    </Stack.Navigator>
  );
}

// Jeg opretter en Bottom Tab Navigator.
// Den bruges til de tre hovedområder i appen:
// Explore, About og Contribute.
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,

        // Explore har allerede sin egen header gennem Stack Navigator.
        // Derfor skjuler jeg tab-headeren på Explore.
        headerShown: route.name !== 'ExploreTab',

        // Den aktive tab bruger navy, mens de andre tabs bruger grå.
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textMuted,

        // Jeg skjuler bottom navigation, når tastaturet åbner.
        // Det giver mere plads på formularerne.
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },

        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`;

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/*
        Første tab er Explore.
        Den peger på ExploreStack og ikke direkte på ExploreScreen,
        fordi Explore også skal kunne åbne de andre skærme i stakken.
      */}
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{ title: 'Explore' }}
      />

      {/* Anden tab er About. Her forklarer jeg kort hvordan Coreliance fungerer. */}
      <Tab.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{ title: 'About', headerTitle: 'About Coreliance' }}
      />

      {/* Tredje tab er Contribute. Her kan ansatte udfylde deres egen career case (demo). */}
      <Tab.Screen
        name="ContributeTab"
        component={ContributeScreen}
        options={{ title: 'Contribute' }}
      />
    </Tab.Navigator>
  );
}

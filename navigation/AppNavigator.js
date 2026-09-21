import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import AboutScreen from '../screens/AboutScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CareerCaseScreen from '../screens/CareerCaseScreen';
import ContributeScreen from '../screens/ContributeScreen';

// Jeg bruger de samme farver som resten af appen,
// så navigationen passer visuelt sammen med styles.js.
const NAVY = '#0F1E3D';
const WHITE = '#FFFFFF';
const GRAY = '#8A94A6';
const BORDER = '#E5E7EB';

// Jeg opretter en Stack Navigator til Explore-delen.
// Det gør, at jeg kan gå fra listen over career cases
// ind på detaljesiden og derefter tilbage igen.
const Stack = createNativeStackNavigator();

function ExploreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        // Jeg giver alle screens i Explore-stakken
        // samme header-design.
        headerStyle: {
          backgroundColor: NAVY,
        },

        // Farven på titel og tilbage-pil.
        headerTintColor: WHITE,

        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* 
        Dette er startsiden i Explore-flowet.
        Her vises listen over alle career cases.
      */}
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore Careers',
        }}
      />

      {/*
        Denne screen åbnes, når brugeren trykker
        på en career case fra Explore-listen.
      */}
      <Stack.Screen
        name="CareerCase"
        component={CareerCaseScreen}
        options={{
          title: 'Career Case',
        }}
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
        // Explore har allerede sin egen header gennem Stack Navigator.
        // Derfor skjuler jeg tab-headeren på Explore.
        //
        // About og Contribute har ikke deres egen Stack,
        // så de får deres header direkte fra Tab Navigator.
        headerShown: route.name !== 'ExploreTab',

        // Samme farver bruges til headers på About og Contribute.
        headerStyle: {
          backgroundColor: NAVY,
        },

        headerTintColor: WHITE,

        headerTitleStyle: {
          fontWeight: '600',
        },

        // Den aktive tab bruger navy,
        // mens de andre tabs bruger grå.
        tabBarActiveTintColor: NAVY,
        tabBarInactiveTintColor: GRAY,

        // Jeg skjuler bottom navigation, når tastaturet åbner.
        // Det giver mere plads på Contribute-formularen.
        tabBarHideOnKeyboard: true,

        // Her styler jeg selve navigationen nederst.
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },

        // Jeg vælger ikon ud fra hvilken tab brugeren står på.
        // "focused" fortæller, om tabben er aktiv.
        //
        // Når tabben er aktiv, bruger jeg det fyldte ikon.
        // Når den ikke er aktiv, bruger jeg outline-versionen.
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Ikon til Explore
          if (route.name === 'ExploreTab') {
            iconName = focused
              ? 'compass'
              : 'compass-outline';
          }

          // Ikon til About
          else if (route.name === 'AboutTab') {
            iconName = focused
              ? 'information-circle'
              : 'information-circle-outline';
          }

          // Ikon til Contribute
          else if (route.name === 'ContributeTab') {
            iconName = focused
              ? 'add-circle'
              : 'add-circle-outline';
          }

          // Til sidst returnerer jeg det valgte Ionicon.
          // React Navigation sender selv størrelse og farve ind.
          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      {/*
        Første tab er Explore.
        Den peger på ExploreStack og ikke direkte på ExploreScreen,
        fordi Explore også skal kunne åbne CareerCaseScreen.
      */}
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          title: 'Explore',
        }}
      />

      {/*
        Anden tab er About.
        Her forklarer jeg kort hvordan Coreliance fungerer.
      */}
      <Tab.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{
          title: 'About',
          headerTitle: 'About Coreliance',
        }}
      />

      {/*
        Tredje tab er Contribute.
        Her kan brugeren udfylde sin egen career case.
      */}
      <Tab.Screen
        name="ContributeTab"
        component={ContributeScreen}
        options={{
          title: 'Contribute',
        }}
      />
    </Tab.Navigator>
  );
}
import { Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ExploreScreen from '../screens/ExploreScreen';
import PeopleLikeMeScreen from '../screens/PeopleLikeMeScreen';
import JobSeekerProfileScreen from '../screens/JobSeekerProfileScreen';
import ContributeScreen from '../screens/ContributeScreen';
import CareerCaseScreen from '../screens/CareerCaseScreen';
import AboutScreen from '../screens/AboutScreen';
import { styles, colors } from '../styles/styles';

// Navigationen består af to lag:
// 1. En Stack Navigator yderst, som indeholder tabs, CareerCase og About.
// 2. En Bottom Tab Navigator med appens fire hovedområder.
// CareerCase ligger i stakken, så den samme detaljeside kan åbnes fra både
// Explore og People Like Me, og tilbage-pilen altid fører til den rigtige tab.

// Header-design, som både stakken og tabs bruger. Farver og tekst ligger i styles.js.
const headerOptions = {
  headerStyle: styles.header,
  headerTintColor: colors.white,
  headerTitleStyle: styles.headerTitle,
};

// Ikon til hver tab. Den aktive tab får det fyldte ikon,
// de andre får outline-versionen (fx "compass-outline").
const TAB_ICONS = {
  Explore: 'compass',
  PeopleLikeMe: 'people',
  MyProfile: 'person-circle',
  Contribute: 'add-circle',
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,

        // Jeg skjuler tab-baren, når tastaturet er åbent, så formularerne får mere plads.
        tabBarHideOnKeyboard: true,

        tabBarIcon: ({ focused, color, size }) => {
          const iconName = focused ? TAB_ICONS[route.name] : `${TAB_ICONS[route.name]}-outline`;

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        // About er ikke en tab. Den åbnes fra info-ikonet i headeren,
        // så vi undgår fem tabs i bunden.
        headerRight: () => (
          <Pressable
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('About')}
            accessibilityLabel="About Coreliance"
          >
            <Ionicons name="information-circle-outline" size={24} color={colors.white} />
          </Pressable>
        ),
      })}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: 'Explore', headerTitle: 'Explore Careers' }}
      />
      <Tab.Screen
        name="PeopleLikeMe"
        component={PeopleLikeMeScreen}
        options={{ title: 'People Like Me' }}
      />
      <Tab.Screen
        name="MyProfile"
        component={JobSeekerProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Tab.Screen
        name="Contribute"
        component={ContributeScreen}
        options={{ title: 'Contribute' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    // "minimal" viser kun tilbage-pilen uden tekst ved siden af.
    <Stack.Navigator screenOptions={{ ...headerOptions, headerBackButtonDisplayMode: 'minimal' }}>
      {/* Tabs har deres egne headers, så stakkens header skjules her.
          Titlen bruges af skærmlæsere på tilbage-knappen. */}
      <Stack.Screen
        name="Tabs"
        component={MainTabs}
        options={{ headerShown: false, title: 'Coreliance' }}
      />

      {/* Detaljesiden bruges både fra Explore og People Like Me. */}
      <Stack.Screen name="CareerCase" component={CareerCaseScreen} options={{ title: 'Career Case' }} />

      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Coreliance' }} />
    </Stack.Navigator>
  );
}

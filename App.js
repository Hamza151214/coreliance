import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import { auth } from './database/firebase';
import { styles } from './styles/styles';

// Root-komponent for hele appen.
// Jeg lytter på Firebase Auth: er brugeren logget ind, vises appen,
// ellers vises login-skærmen (samme princip som i INNT-øvelse 6).
export default function App() {
  // undefined = vi ved det ikke endnu, null = ikke logget ind
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* AppNavigator styrer al navigation (bottom tabs + stack) */}
      {user ? <AppNavigator /> : <AuthScreen />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

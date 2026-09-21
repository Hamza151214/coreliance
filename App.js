import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

// Root-komponent for hele appen
// NavigationContainer er obligatorisk for at React Navigation kan fungere
// og skal ligge yderst i komponent-træet
export default function App() {
  return (
    <NavigationContainer>
      {/* AppNavigator styrer al vores navigation (bottom tabs + stack) */}
      <AppNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
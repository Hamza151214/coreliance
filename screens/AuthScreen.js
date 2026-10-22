import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import FormField from '../components/FormField';
import { auth } from '../database/firebase';
import { styles } from '../styles/styles';

// Login og oprettelse samlet på én skærm, ligesom i INNT-øvelse 6.
// Når brugeren er logget ind, opdager App.js det via onAuthStateChanged
// og viser resten af appen automatisk.
const EMAIL_FIELD = {
  key: 'email',
  label: 'Email',
  placeholder: 'you@example.com',
  keyboardType: 'email-address',
  autoCapitalize: 'none',
};
const PASSWORD_FIELD = {
  key: 'password',
  label: 'Password',
  placeholder: 'At least 6 characters',
  autoCapitalize: 'none',
  secure: true,
};

// Firebase-fejlkoder oversat til forståelige beskeder.
const AUTH_ERRORS = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
  'auth/weak-password': 'The password must be at least 6 characters.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'No internet connection.',
};

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (email.trim() === '' || password === '') {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      setErrorMessage(AUTH_ERRORS[error.code] || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.authContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.aboutTitle}>Coreliance</Text>
        <Text style={styles.aboutIntro}>
          Learn from people who found their way into the Danish job market.
        </Text>

        <Text style={styles.stateTitle}>{isLogin ? 'Log in' : 'Create an account'}</Text>

        {errorMessage ? (
          <View style={[styles.messageBox, styles.messageError]}>
            <Text style={styles.messageText}>{errorMessage}</Text>
          </View>
        ) : null}

        <FormField field={EMAIL_FIELD} value={email} onChange={setEmail} />
        <FormField field={PASSWORD_FIELD} value={password} onChange={setPassword} />

        <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={isLoading}>
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            setIsLogin((previous) => !previous);
            setErrorMessage('');
          }}
        >
          <Text style={styles.secondaryButtonText}>
            {isLogin ? 'No account? Create one' : 'Already have an account? Log in'}
          </Text>
        </Pressable>

        <Text style={[styles.noteText, styles.authNote]}>
          Academic demonstration app (CBS INNT). All career cases are fictional.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

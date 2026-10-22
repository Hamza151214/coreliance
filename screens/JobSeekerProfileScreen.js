import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import FormField from '../components/FormField';
import { PROFILE_SECTIONS, EMPTY_PROFILE, validateProfile } from '../data/jobSeekerProfile';
import { loadProfile, saveProfile } from '../services/profileService';
import { styles } from '../styles/styles';

// Her opretter eller redigerer jobsøgeren sin profil.
// Felterne kommer fra data/jobSeekerProfile.js, og gem/hent sker
// gennem profileService, så skærmen ikke selv kender til AsyncStorage.
export default function JobSeekerProfileScreen({ navigation }) {
  const scrollViewRef = useRef(null);

  const [form, setForm] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState({});

  // message bruges til feedback øverst i formularen,
  // fx { type: 'success', text: 'Profile saved' }.
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  // Når skærmen åbner, henter jeg en eventuel gemt profil,
  // så brugeren kan redigere den i stedet for at starte forfra.
  useEffect(() => {
    loadProfile()
      .then((savedProfile) => {
        if (savedProfile) {
          setForm({ ...EMPTY_PROFILE, ...savedProfile });
          setHasSavedProfile(true);
        }
      })
      .catch(() => {
        setMessage({
          type: 'error',
          text: 'Your saved profile could not be loaded. You can still fill in the form.',
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Opdaterer ét felt og fjerner dets fejlbesked, når brugeren retter det.
  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSave = async () => {
    const newErrors = validateProfile(form);
    const errorCount = Object.keys(newErrors).length;

    setErrors(newErrors);

    if (errorCount > 0) {
      setMessage({
        type: 'error',
        text: `Please complete the ${errorCount} highlighted ${errorCount === 1 ? 'field' : 'fields'}.`,
      });
      scrollToTop();
      return;
    }

    setIsSaving(true);

    try {
      await saveProfile(form);
      setHasSavedProfile(true);
      setMessage({ type: 'success', text: 'Your profile has been saved.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Your profile could not be saved. Please try again.' });
    } finally {
      setIsSaving(false);
      scrollToTop();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {message ? (
          <View
            style={[
              styles.messageBox,
              message.type === 'success' ? styles.messageSuccess : styles.messageError,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>

            {message.type === 'success' ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('PeopleLikeMe')}
              >
                <Text style={styles.secondaryButtonText}>See people like me</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.formIntro}>
          {hasSavedProfile
            ? 'Update your profile to get new matches.'
            : 'A few short questions about who you are and what you are looking for. It takes about 3 minutes.'}
        </Text>

        <Text style={styles.noteText}>
          Your profile is only saved on this device. It is only sent to the AI
          if you agree on the People Like Me screen.
          Fields marked * are required.
        </Text>

        {PROFILE_SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={styles.formSectionTitle}>{section.title}</Text>

            {section.description ? (
              <Text style={[styles.noteText, styles.sectionDescription]}>{section.description}</Text>
            ) : null}

            {section.fields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={form[field.key]}
                error={errors[field.key]}
                onChange={(value) => updateField(field.key, value)}
              />
            ))}
          </View>
        ))}

        <Pressable style={styles.primaryButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.primaryButtonText}>{isSaving ? 'Saving…' : 'Save profile'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

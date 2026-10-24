import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import FormField from '../components/FormField';
import { PROFILE_SECTIONS, EMPTY_PROFILE, validateProfile } from '../data/jobSeekerProfile';
import { loadProfile, saveProfile } from '../services/profileService';
import { getProfileSignature } from '../services/matchingService';
import { styles } from '../styles/styles';

// My Profile har to tilstande:
// - Visning: den gemte profil vises med en knap til at redigere.
// - Redigering: formularen fra data/jobSeekerProfile.js (også når der ikke er en profil endnu).
// Gem og hent sker gennem profileService, så skærmen ikke selv kender til AsyncStorage.
export default function JobSeekerProfileScreen({ navigation }) {
  const scrollViewRef = useRef(null);

  const [savedProfile, setSavedProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // message bruges til feedback øverst på skærmen,
  // fx { type: 'success', text: 'Your profile has been saved.' }.
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Jeg henter profilen, hver gang tabben åbnes, men ikke midt i en redigering,
  // så brugerens ændringer ikke bliver overskrevet.
  useFocusEffect(
    useCallback(() => {
      if (isEditing) {
        return;
      }

      loadProfile()
        .then((profile) => {
          setSavedProfile(profile);
          setForm(profile || EMPTY_PROFILE);

          // Uden en gemt profil starter brugeren direkte i formularen (onboarding).
          if (!profile) {
            setIsEditing(true);
          }
        })
        .catch(() => {
          setMessage({ type: 'error', text: 'Your saved profile could not be loaded.' });
        })
        .finally(() => setIsLoading(false));
    }, [isEditing])
  );

  // Opdaterer ét felt og fjerner dets fejlbesked, når brugeren retter det.
  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const startEditing = () => {
    setMessage(null);
    setIsEditing(true);
  };

  // Annuller fortryder ændringerne og viser den gemte profil igen.
  const cancelEditing = () => {
    setForm(savedProfile);
    setErrors({});
    setMessage(null);
    setIsEditing(false);
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
      const newProfile = await saveProfile(form);

      // Hvis svarene er ændret, gør jeg opmærksom på, at gamle AI-matches ikke længere passer.
      const answersChanged =
        savedProfile && getProfileSignature(savedProfile) !== getProfileSignature(newProfile);

      setSavedProfile(newProfile);
      setIsEditing(false);
      setMessage({
        type: 'success',
        text: answersChanged
          ? 'Your profile has been saved. Any earlier AI matches are now out of date. You can update them in People Like Me.'
          : 'Your profile has been saved.',
      });
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
          </View>
        ) : null}

        <Text style={styles.formIntro}>
          {isEditing
            ? 'A few short questions about who you are and what you are looking for. It takes about 3 minutes.'
            : 'This is the profile the AI uses to find people like you.'}
        </Text>

        <Text style={styles.noteText}>
          Your profile is saved only on this device. When you ask for AI matches and have
          given consent, your answers are sent to OpenAI through the local Coreliance server.
        </Text>

        {isEditing ? (
          <>
            {PROFILE_SECTIONS.map((section) => (
              <View key={section.title}>
                <Text style={styles.formSectionTitle}>{section.title}</Text>

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

            <Text style={styles.noteText}>Fields marked * are required.</Text>

            <Pressable style={styles.primaryButton} onPress={handleSave} disabled={isSaving}>
              <Text style={styles.primaryButtonText}>{isSaving ? 'Saving…' : 'Save profile'}</Text>
            </Pressable>

            {savedProfile ? (
              <Pressable style={styles.secondaryButton} onPress={cancelEditing}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <>
            {/* Visning af den gemte profil, sektion for sektion */}
            {PROFILE_SECTIONS.map((section) => (
              <View key={section.title} style={styles.profileSection}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                {section.fields.map((field) => {
                  const value = savedProfile[field.key];
                  const text = Array.isArray(value) ? value.join(', ') : value;

                  return (
                    <View key={field.key} style={styles.profileItem}>
                      <Text style={styles.profileLabel}>{field.label}</Text>
                      <Text style={styles.profileValue}>{text || 'Not answered'}</Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <Pressable style={styles.primaryButton} onPress={startEditing}>
              <Text style={styles.primaryButtonText}>Edit profile</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('PeopleLikeMe')}>
              <Text style={styles.secondaryButtonText}>See people like me</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

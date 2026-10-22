import { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import CareerCard from '../components/CareerCard';
import { loadProfile, giveAiConsent } from '../services/profileService';
import { findMatches } from '../services/matchingService';
import { styles } from '../styles/styles';

export default function PeopleLikeMeScreen({ navigation }) {
  // status styrer hvad skærmen viser:
  // 'loading' | 'noProfile' | 'needsConsent' | 'matching' | 'ready' | 'error'
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Jeg husker hvilken version af profilen matches er lavet ud fra.
  // Så kalder jeg ikke OpenAI igen, bare fordi brugeren kommer tilbage fra en detaljeside.
  const matchedVersion = useRef(null);

  const runMatching = useCallback(async (savedProfile) => {
    setStatus('matching');

    try {
      setMatches(await findMatches());
      matchedVersion.current = savedProfile.updatedAt;
      setStatus('ready');
    } catch (error) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  }, []);

  const loadScreen = useCallback(async () => {
    try {
      const savedProfile = await loadProfile();

      if (!savedProfile) {
        setStatus('noProfile');
        return;
      }

      setProfile(savedProfile);

      if (!savedProfile.aiConsentAt) {
        setStatus('needsConsent');
        return;
      }

      if (matchedVersion.current !== savedProfile.updatedAt) {
        await runMatching(savedProfile);
      }
    } catch (error) {
      setErrorMessage('We could not load your profile.');
      setStatus('error');
    }
  }, [runMatching]);

  // Jeg tjekker profilen, hver gang skærmen kommer i fokus.
  // Har brugeren redigeret profilen, laves nye matches.
  useFocusEffect(
    useCallback(() => {
      loadScreen();
    }, [loadScreen])
  );

  const acceptConsent = async () => {
    try {
      await giveAiConsent();
      await runMatching(profile);
    } catch (error) {
      setErrorMessage('Your consent could not be saved. Please try again.');
      setStatus('error');
    }
  };

  const editProfile = () => navigation.navigate('JobSeekerProfile');

  if (status === 'loading' || status === 'matching') {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <ActivityIndicator />
        {status === 'matching' ? (
          <Text style={[styles.formIntro, styles.centeredText]}>
            Finding people like you with AI… This can take up to 30 seconds.
          </Text>
        ) : null}
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateTitle}>Something went wrong</Text>
        <Text style={styles.formIntro}>{errorMessage}</Text>

        <Pressable style={styles.primaryButton} onPress={loadScreen}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  // Hvis brugeren ikke har en profil endnu, leder jeg dem til formularen.
  if (status === 'noProfile') {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateTitle}>Find people like you</Text>
        <Text style={styles.formIntro}>
          Answer a few short questions about your background and goals. We will
          then show you career stories from people with a similar path into the
          Danish job market.
        </Text>

        <Pressable style={styles.primaryButton} onPress={editProfile}>
          <Text style={styles.primaryButtonText}>Create my profile</Text>
        </Pressable>
      </View>
    );
  }

  // Eksplicit samtykke, før profilen sendes til OpenAI.
  if (status === 'needsConsent') {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateTitle}>Before we use AI</Text>
        <Text style={styles.formIntro}>
          To find people like you, Coreliance sends your profile answers (not your
          email) and our fictional career cases to OpenAI through our secure server.
          OpenAI uses them to suggest matches and write explanations.
        </Text>
        <Text style={styles.noteText}>
          This is an academic demonstration. AI can make mistakes, and the results say
          nothing about your chances of being hired.
        </Text>

        <Pressable style={styles.primaryButton} onPress={acceptConsent}>
          <Text style={styles.primaryButtonText}>I agree, find my matches</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Not now</Text>
        </Pressable>
      </View>
    );
  }

  const openMatch = (match) => {
    navigation.navigate('CareerCase', { careerCase: match.careerCase, match: match });
  };

  return (
    <FlatList
      style={styles.screen}
      data={matches}
      keyExtractor={(item) => item.careerCaseId}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          {/* Vises kun her, hvor resultaterne faktisk kommer fra et OpenAI-kald */}
          <Text style={styles.matchLabel}>AI-powered matching</Text>
          <Text style={styles.formIntro}>
            Career stories that may be relevant to your goal: {profile.desiredRoles}.
          </Text>
          <Text style={styles.noteText}>
            Generated by OpenAI from fictional demonstration profiles. AI can make
            mistakes, and the results say nothing about your chances of being hired.
          </Text>

          <Pressable style={[styles.secondaryButton, styles.headerButton]} onPress={editProfile}>
            <Text style={styles.secondaryButtonText}>Edit my profile</Text>
          </Pressable>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.section}>
          <Text style={styles.stateTitle}>No similar cases yet</Text>
          <Text style={styles.formIntro}>
            The AI did not find a career case close to your profile. Try adding more
            detail to your profile, or browse all career cases.
          </Text>

          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.primaryButtonText}>Browse all career cases</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <CareerCard careerCase={item.careerCase} onPress={() => openMatch(item)}>
          {/* Kort forklaring på kortet. Detaljerne ses på detaljesiden. */}
          <View style={styles.matchBox}>
            <Text style={styles.matchLabel}>{item.relevance}</Text>
            <Text style={styles.matchReason}>{item.summary}</Text>
          </View>
        </CareerCard>
      )}
    />
  );
}

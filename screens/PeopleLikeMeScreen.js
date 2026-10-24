import { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import CareerCard from '../components/CareerCard';
import { loadProfile, giveAiConsent } from '../services/profileService';
import { loadCachedMatches, requestMatches, getProfileSignature } from '../services/matchingService';
import { styles } from '../styles/styles';

export default function PeopleLikeMeScreen({ navigation }) {
  // status styrer hvad skærmen viser: 'loading' | 'noProfile' | 'ready' | 'error'
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);

  // cache er de gemte AI-matches (eller null). De vises uden et nyt OpenAI-kald.
  const [cache, setCache] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // En ref ændrer sig med det samme, i modsætning til state.
  // Den forhindrer to OpenAI-kald, hvis brugeren trykker hurtigt to gange.
  const isMatchingRef = useRef(false);

  // Henter profil og gemte matches fra AsyncStorage. Her kaldes OpenAI aldrig.
  const loadScreen = useCallback(async () => {
    try {
      const savedProfile = await loadProfile();

      if (!savedProfile) {
        setStatus('noProfile');
        return;
      }

      setProfile(savedProfile);
      setCache(await loadCachedMatches());
      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  // Jeg læser data igen, hver gang tabben åbnes, så en redigeret profil
  // med det samme kan markere de gamle matches som forældede.
  useFocusEffect(
    useCallback(() => {
      loadScreen();
    }, [loadScreen])
  );

  // Det eneste sted, hvor OpenAI bliver kaldt, og kun efter et tryk fra brugeren.
  const runMatching = async (profileToMatch) => {
    if (isMatchingRef.current) {
      return;
    }

    isMatchingRef.current = true;
    setIsMatching(true);
    setErrorMessage('');

    try {
      setCache(await requestMatches(profileToMatch));
    } catch (error) {
      // De gamle matches beholdes, så en fejl ikke sletter gyldige resultater.
      setErrorMessage(error.message);
    } finally {
      isMatchingRef.current = false;
      setIsMatching(false);
    }
  };

  const acceptConsent = async () => {
    try {
      const consentedProfile = await giveAiConsent(profile);
      setProfile(consentedProfile);
      await runMatching(consentedProfile);
    } catch (error) {
      setErrorMessage('Your consent could not be saved. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateTitle}>Something went wrong</Text>
        <Text style={styles.formIntro}>Your profile or saved matches could not be loaded.</Text>

        <Pressable style={styles.primaryButton} onPress={loadScreen}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  // Uden profil leder jeg brugeren videre til My Profile.
  if (status === 'noProfile') {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateTitle}>Find people like you</Text>
        <Text style={styles.formIntro}>
          Answer a few short questions about your background and goals. You can then
          ask the AI to find fictional career stories with a similar path into the
          Danish job market.
        </Text>

        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('MyProfile')}>
          <Text style={styles.primaryButtonText}>Create my profile</Text>
        </Pressable>
      </View>
    );
  }

  // Eksplicit samtykke, før profilen sendes til OpenAI første gang.
  if (!profile.aiConsentAt) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateTitle}>Before we use AI</Text>
        <Text style={styles.formIntro}>
          To find people like you, your profile answers are sent to OpenAI through the
          local Coreliance server, together with the fictional career cases. OpenAI uses
          them to suggest matches and explain them. The server does not store your answers.
        </Text>
        <Text style={styles.noteText}>
          This is an academic demonstration. AI can make mistakes, and the results say
          nothing about your chances of being hired.
        </Text>

        <Pressable style={styles.primaryButton} onPress={acceptConsent} disabled={isMatching}>
          <Text style={styles.primaryButtonText}>
            {isMatching ? 'Finding matches…' : 'I agree, find my matches'}
          </Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Explore')}>
          <Text style={styles.secondaryButtonText}>Not now</Text>
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    );
  }

  // Samtykke er givet, men der findes ingen gyldige gemte matches.
  if (!cache) {
    return (
      <View style={[styles.screen, styles.centeredState]}>
        <Text style={styles.stateTitle}>Ready to find people like you</Text>
        <Text style={styles.formIntro}>
          The AI compares your profile with the fictional career cases. This can take
          up to 30 seconds.
        </Text>

        <Pressable style={styles.primaryButton} onPress={() => runMatching(profile)} disabled={isMatching}>
          <Text style={styles.primaryButtonText}>
            {isMatching ? 'Finding matches…' : 'Find my matches'}
          </Text>
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    );
  }

  // Matches er forældede, hvis de profilfelter, AI'en brugte, er ændret siden.
  const isOutdated = cache.profileSignature !== getProfileSignature(profile);

  let refreshLabel = 'Refresh matches';

  if (isMatching) {
    refreshLabel = 'Finding new matches…';
  } else if (isOutdated) {
    refreshLabel = 'Update matches';
  }

  const openMatch = (match) => {
    navigation.navigate('CareerCase', { careerCase: match.careerCase, match: match });
  };

  return (
    <FlatList
      style={styles.screen}
      data={cache.matches}
      keyExtractor={(item) => item.careerCaseId}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.matchLabel}>AI-powered matching</Text>
          <Text style={styles.formIntro}>
            Fictional career stories that may be relevant to your goal: {profile.desiredRoles}.
          </Text>
          <Text style={styles.noteText}>
            Generated by OpenAI on {new Date(cache.createdAt).toLocaleDateString()}. AI can
            make mistakes, and the results say nothing about your chances of being hired.
          </Text>

          {isOutdated ? (
            <View style={[styles.messageBox, styles.messageInfo]}>
              <Text style={styles.messageText}>
                Your profile has changed since these matches were made.
              </Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={[styles.messageBox, styles.messageError]}>
              <Text style={styles.messageText}>
                {errorMessage} Your previous matches are still shown.
              </Text>
            </View>
          ) : null}

          <Pressable
            style={isOutdated ? styles.primaryButton : styles.secondaryButton}
            onPress={() => runMatching(profile)}
            disabled={isMatching}
          >
            <Text style={isOutdated ? styles.primaryButtonText : styles.secondaryButtonText}>
              {refreshLabel}
            </Text>
          </Pressable>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.section}>
          <Text style={styles.stateTitle}>No similar cases found</Text>
          <Text style={styles.formIntro}>
            The AI did not find a career case close to your profile. Try adding more
            detail in My Profile, or browse all career cases.
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

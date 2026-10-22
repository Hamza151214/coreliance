import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import CareerCard from '../components/CareerCard';
import { loadProfile } from '../services/profileService';
import { findMatches, MATCHING_IS_DEMO } from '../services/matchingService';
import { styles } from '../styles/styles';

export default function PeopleLikeMeScreen({ navigation }) {
  // status styrer hvad skærmen viser:
  // 'loading' | 'noProfile' | 'ready' | 'error'
  const [status, setStatus] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);

  const loadMatches = useCallback(async () => {
    setStatus('loading');

    try {
      const savedProfile = await loadProfile();

      if (!savedProfile) {
        setStatus('noProfile');
        return;
      }

      setProfile(savedProfile);
      setMatches(await findMatches(savedProfile));
      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  // Jeg henter profil og matches, hver gang skærmen kommer i fokus.
  // Så vises nye matches med det samme, når brugeren har redigeret sin profil.
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  const editProfile = () => navigation.navigate('JobSeekerProfile');

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
        <Text style={styles.formIntro}>We could not load your profile or matches.</Text>

        <Pressable style={styles.primaryButton} onPress={loadMatches}>
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
          Create a short job seeker profile about your background, goals and
          challenges. We will then show you career cases from people who have
          walked a similar path into the Danish job market.
        </Text>

        <Pressable style={styles.primaryButton} onPress={editProfile}>
          <Text style={styles.primaryButtonText}>Create my profile</Text>
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
          <Text style={styles.formIntro}>
            Career cases that may be relevant to your goal: {profile.desiredRoles}.
          </Text>

          {MATCHING_IS_DEMO ? (
            <Text style={styles.noteText}>
              Demo matching: these results come from a simple comparison of your
              profile with demonstration cases. They are not AI-generated and say
              nothing about your chances of being hired.
            </Text>
          ) : null}

          <Pressable style={[styles.secondaryButton, styles.headerButton]} onPress={editProfile}>
            <Text style={styles.secondaryButtonText}>Edit my profile</Text>
          </Pressable>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.section}>
          <Text style={styles.stateTitle}>No similar cases yet</Text>
          <Text style={styles.formIntro}>
            We could not find a career case close to your profile. Try adding more
            skills, desired roles or industries — or browse all career cases.
          </Text>

          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.primaryButtonText}>Browse all career cases</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <CareerCard careerCase={item.careerCase} onPress={() => openMatch(item)}>
          {/* Jeg viser de to første grunde direkte på kortet. Resten ses på detaljesiden. */}
          <View style={styles.matchBox}>
            <Text style={styles.matchLabel}>{item.relevance}</Text>

            {item.similarities.slice(0, 2).map((reason) => (
              <Text key={reason} style={styles.matchReason}>
                • {reason}
              </Text>
            ))}
          </View>
        </CareerCard>
      )}
    />
  );
}

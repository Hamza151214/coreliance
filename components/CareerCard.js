import { View, Text, Pressable } from 'react-native';
import { styles } from '../styles/styles';

// Samler de felter, der findes, med " · " og springer tomme felter over.
function joinParts(parts) {
  return parts.filter(Boolean).join(' · ');
}

// CareerCard viser én career case som et kort.
// Komponenten modtager:
// - careerCase: objektet med al data om den pågældende case
// - onPress: funktionen der kaldes når man trykker på kortet (åbner detaljesiden)
// - children: valgfrit ekstra indhold, fx forklaringen på et match i People Like Me
// Vi bruger Pressable, så hele kortet fungerer som en knap
export default function CareerCard({ careerCase, onPress, children }) {
  // "No Danish" skal ikke blive til "Danish No Danish".
  const danish =
    careerCase.danishLevel && careerCase.danishLevel !== 'No Danish'
      ? `Danish ${careerCase.danishLevel}`
      : careerCase.danishLevel;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Øverste række: jobtitel og et badge der viser outcome (fx HIRED) */}
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle}>{careerCase.jobTitle}</Text>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{careerCase.outcome}</Text>
        </View>
      </View>

      {/* Universitet og uddannelse */}
      <Text style={styles.cardSubtitle}>
        {joinParts([careerCase.university, careerCase.degree])}
      </Text>

      {/* Type arbejdsgiver, by og dansk-niveau */}
      <Text style={styles.cardMeta}>
        {joinParts([careerCase.employerType, careerCase.location, danish])}
      </Text>

      {/* Nøgletal om jobsøgningen vises kun, hvis de findes */}
      {careerCase.applications !== null && careerCase.interviews !== null ? (
        <View style={styles.cardStatsRow}>
          <Text style={styles.cardStat}>
            <Text style={styles.cardStatValue}>{careerCase.applications}</Text> applications
          </Text>
          <Text style={styles.cardStat}>
            <Text style={styles.cardStatValue}>{careerCase.interviews}</Text> interviews
          </Text>
        </View>
      ) : null}

      {children}

      {careerCase.isFictional ? (
        <Text style={styles.fictionalTag}>Fictional demonstration profile</Text>
      ) : null}

      {/* Tydelig "View case"-tekst der signalerer at kortet er klikbart */}
      <Text style={styles.viewCase}>View case →</Text>
    </Pressable>
  );
}

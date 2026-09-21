import { View, Text, Pressable } from 'react-native';
import { styles } from '../styles/styles';

// CareerCard viser én career case som et kort på Explore-screenen
// Komponenten modtager:
// - careerCase: objektet med al data om den pågældende case
// - onPress: funktionen der kaldes når man trykker på kortet (åbner detaljesiden)
// Vi bruger Pressable, så hele kortet fungerer som en knap
export default function CareerCard({ careerCase, onPress }) {
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
        {careerCase.university} · {careerCase.degree}
      </Text>

      {/* Nationalitet og dansk-niveau */}
      <Text style={styles.cardMeta}>
        {careerCase.nationality} · Danish {careerCase.danishLevel}
      </Text>

      {/* Nøgletal om jobsøgningen — kravet om at vise applications/interviews */}
      <View style={styles.cardStatsRow}>
        <Text style={styles.cardStat}>
          <Text style={styles.cardStatValue}>{careerCase.applications}</Text> applications
        </Text>
        <Text style={styles.cardStat}>
          <Text style={styles.cardStatValue}>{careerCase.interviews}</Text> interviews
        </Text>
      </View>

      {/* Tydelig "View case"-tekst der signalerer at kortet er klikbart */}
      <Text style={styles.viewCase}>View case →</Text>
    </Pressable>
  );
}
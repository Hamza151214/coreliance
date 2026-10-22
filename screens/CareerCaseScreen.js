import { View, Text, ScrollView, Pressable, Alert } from 'react-native';

import { styles } from '../styles/styles';

// Én række med label og værdi. Hvis værdien mangler, vises rækken ikke,
// så ufuldstændige cases ikke viser tomme felter.
function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// En simpel punktliste, som bruges til erfaring, skills og match-forklaringer.
function BulletList({ items }) {
  return items.map((item, index) => (
    <Text key={index} style={styles.bulletItem}>
      • {item}
    </Text>
  ));
}

export default function CareerCaseScreen({ route }) {
  // Den valgte career case bliver sendt gennem navigation.
  // Hvis brugeren kommer fra People Like Me, sendes "match" også med,
  // så jeg kan vise hvorfor casen blev foreslået.
  const { careerCase, match } = route.params;

  // I prototypen har vi ikke rigtige CV-filer endnu.
  // Knappen viser derfor en Alert for at demonstrere funktionaliteten.
  const showCV = () => {
    Alert.alert(
      'CV Snapshot',
      'The anonymised CV will be available in a future version of Coreliance.'
    );
  };

  const referral = careerCase.referral === null ? null : careerCase.referral ? 'Yes' : 'No';

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Overordnet information om jobbet */}
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{careerCase.jobTitle}</Text>

        <Text style={styles.detailSubtitle}>
          {[careerCase.location, careerCase.field].filter(Boolean).join(' · ')}
        </Text>
      </View>

      {/* Forklaring på matchet – kun når casen er åbnet fra People Like Me */}
      {match ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why this case was suggested</Text>

          <BulletList items={match.similarities} />

          {match.differences.length > 0 ? (
            <>
              <Text style={styles.subsectionTitle}>Differences to keep in mind</Text>
              <BulletList items={match.differences} />
            </>
          ) : null}

          {match.lessons.length > 0 ? (
            <>
              <Text style={styles.subsectionTitle}>What you could learn</Text>
              <BulletList items={match.lessons} />
            </>
          ) : null}
        </View>
      ) : null}

      {/* Personens baggrund på det tidspunkt jobbet blev søgt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background</Text>
        <DetailRow label="University" value={careerCase.university} />
        <DetailRow label="Degree" value={careerCase.degree} />
        <DetailRow label="Nationality" value={careerCase.nationality} />
        <DetailRow label="Danish level" value={careerCase.danishLevel} />
      </View>

      {/* Tidligere erfaring før jobbet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>At the time of application</Text>
        <BulletList items={careerCase.previousExperience} />

        {careerCase.skills.length > 0 ? (
          <>
            <Text style={styles.subsectionTitle}>Skills</Text>
            <BulletList items={careerCase.skills} />
          </>
        ) : null}
      </View>

      {/* Nøgletal for jobsøgningen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Search</Text>
        <DetailRow label="Applications" value={careerCase.applications} />
        <DetailRow label="Interviews" value={careerCase.interviews} />
        <DetailRow label="Offers" value={careerCase.offers} />
      </View>

      {/* Resultatet af jobsøgningen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outcome</Text>
        <DetailRow label="Result" value={careerCase.outcome} />
        <DetailRow label="Role" value={careerCase.jobTitle} />
        <DetailRow label="How they got it" value={careerCase.jobRoute} />
        <DetailRow label="Referral" value={referral} />
      </View>

      {/* Personens eget råd til andre internationale */}
      {careerCase.advice ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advice</Text>
          <Text style={styles.adviceQuote}>“{careerCase.advice}”</Text>
        </View>
      ) : null}

      {/* Placeholder til den fremtidige CV-funktion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CV Snapshot</Text>

        <Text style={styles.formIntro}>
          See the anonymised CV that was used when applying for this role.
        </Text>

        <Pressable style={styles.primaryButton} onPress={showCV}>
          <Text style={styles.primaryButtonText}>View CV</Text>
        </Pressable>

        {careerCase.isDemo ? (
          <Text style={styles.demoNote}>
            This is a demonstration case, not a real Coreliance record.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

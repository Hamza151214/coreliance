import { View, Text, ScrollView, Pressable, Alert } from 'react-native';

import { styles } from '../styles/styles';

export default function CareerCaseScreen({ route }) {
  // Den valgte career case bliver sendt fra ExploreScreen gennem navigation
  const { careerCase } = route.params;

  // I prototypen har vi ikke rigtige CV-filer endnu.
  // Knappen viser derfor en Alert for at demonstrere funktionaliteten.
  const showCV = () => {
    Alert.alert(
      'CV Snapshot',
      'The anonymised CV will be available in a future version of Coreliance.'
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      {/* Overordnet information om jobbet */}
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{careerCase.jobTitle}</Text>

        <Text style={styles.detailSubtitle}>
          {careerCase.location} · {careerCase.field}
        </Text>
      </View>

      {/* Brugerens baggrund på det tidspunkt jobbet blev søgt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>University</Text>
          <Text style={styles.detailValue}>
            {careerCase.university}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Degree</Text>
          <Text style={styles.detailValue}>
            {careerCase.degree}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nationality</Text>
          <Text style={styles.detailValue}>
            {careerCase.nationality}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Danish level</Text>
          <Text style={styles.detailValue}>
            {careerCase.danishLevel}
          </Text>
        </View>
      </View>

      {/* Tidligere erfaring før jobbet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          At the time of application
        </Text>

        {careerCase.previousExperience.map((experience, index) => (
          <Text
            key={index}
            style={styles.bulletItem}
          >
            • {experience}
          </Text>
        ))}

        <Text style={styles.subsectionTitle}>
          Skills
        </Text>

        {careerCase.skills.map((skill, index) => (
          <Text
            key={index}
            style={styles.bulletItem}
          >
            • {skill}
          </Text>
        ))}
      </View>

      {/* Nøgletal for jobsøgningen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Search</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Applications</Text>
          <Text style={styles.detailValue}>
            {careerCase.applications}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Interviews</Text>
          <Text style={styles.detailValue}>
            {careerCase.interviews}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Offers</Text>
          <Text style={styles.detailValue}>
            {careerCase.offers}
          </Text>
        </View>
      </View>

      {/* Resultatet af jobsøgningen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outcome</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Result</Text>
          <Text style={styles.detailValue}>
            {careerCase.outcome}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Role</Text>
          <Text style={styles.detailValue}>
            {careerCase.jobTitle}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>How they got it</Text>
          <Text style={styles.detailValue}>
            {careerCase.jobRoute}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Referral</Text>
          <Text style={styles.detailValue}>
            {careerCase.referral ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      {/* Personens eget råd til andre internationale */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advice</Text>

        <Text style={styles.adviceQuote}>
          “{careerCase.advice}”
        </Text>
      </View>

      {/* Placeholder til den fremtidige CV-funktion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CV Snapshot</Text>

        <Text style={styles.formIntro}>
          See the anonymised CV that was used when applying for this role.
        </Text>

        <Pressable
          style={styles.cvButton}
          onPress={showCV}
        >
          <Text style={styles.cvButtonText}>View CV</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles, colors } from '../styles/styles';

export default function AboutScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.aboutContainer}>

        {/* 
          Jeg bruger denne screen til kort at forklare idéen bag Coreliance.
          Det gør det nemmere for en ny bruger at forstå værdien af appen,
          uden at der skal bygges mere avanceret funktionalitet.
        */}
        <Text style={styles.aboutTitle}>
          How Coreliance works
        </Text>

        <Text style={styles.aboutIntro}>
          Coreliance helps international students and graduates understand
          how other internationals actually entered the Danish job market.
        </Text>

        {/* Første del af brugerrejsen */}
        <View style={styles.aboutStep}>
          <Ionicons
            name="search-outline"
            size={26}
            color={colors.accent}
          />

          <View style={styles.aboutStepText}>
            <Text style={styles.aboutStepTitle}>
              1. Explore real career cases
            </Text>

            <Text style={styles.aboutStepDescription}>
              See anonymised profiles showing education, experience,
              applications, interviews and job outcomes.
            </Text>
          </View>
        </View>

        {/* Anden del af brugerrejsen */}
        <View style={styles.aboutStep}>
          <Ionicons
            name="document-text-outline"
            size={26}
            color={colors.accent}
          />

          <View style={styles.aboutStepText}>
            <Text style={styles.aboutStepTitle}>
              2. Learn what worked
            </Text>

            <Text style={styles.aboutStepDescription}>
              Understand what someone's profile looked like when they
              applied and how they eventually got hired.
            </Text>
          </View>
        </View>

        {/* Tredje del af brugerrejsen */}
        <View style={styles.aboutStep}>
          <Ionicons
            name="people-outline"
            size={26}
            color={colors.accent}
          />

          <View style={styles.aboutStepText}>
            <Text style={styles.aboutStepTitle}>
              3. Contribute your experience
            </Text>

            <Text style={styles.aboutStepDescription}>
              Share your own career journey anonymously and help the next
              international student navigate the job market.
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
}
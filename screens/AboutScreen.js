import { ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles, colors } from '../styles/styles';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.screen}>
      <View style={styles.aboutContainer}>

        {/*
          Jeg bruger denne screen til kort at forklare idéen bag Coreliance.
          Den åbnes fra info-ikonet i headeren og er derfor ikke en tab.
        */}
        <Text style={styles.aboutTitle}>
          How Coreliance works
        </Text>

        <Text style={styles.aboutIntro}>
          Coreliance helps international students and graduates learn how others
          have entered the Danish job market. In this prototype, all career cases
          are fictional demonstration profiles.
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
              1. Explore career cases
            </Text>

            <Text style={styles.aboutStepDescription}>
              Browse 14 fictional career stories showing education, experience,
              applications, interviews and how the job was found.
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
              See what each person's background looked like, what was hard
              and which strategies helped.
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
              3. Find people like you
            </Text>

            <Text style={styles.aboutStepDescription}>
              Create a short profile in My Profile. With your consent, AI finds
              the fictional career stories most relevant to you.
            </Text>
          </View>
        </View>

        {/* Fjerde del af brugerrejsen */}
        <View style={styles.aboutStep}>
          <Ionicons
            name="add-circle-outline"
            size={26}
            color={colors.accent}
          />

          <View style={styles.aboutStepText}>
            <Text style={styles.aboutStepTitle}>
              4. Contribute your experience
            </Text>

            <Text style={styles.aboutStepDescription}>
              The Contribute tab shows how employed internationals could share
              their story. In this prototype it is a demo, and nothing is saved or sent.
            </Text>
          </View>
        </View>

        <Text style={styles.noteText}>
          Coreliance is an academic demonstration app (CBS INNT). Your profile and
          AI matches are stored only on this device.
        </Text>
      </View>
    </ScrollView>
  );
}
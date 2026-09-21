import { useRef, useState } from 'react';
import {
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { styles } from '../styles/styles';

export default function ContributeScreen() {
  // Jeg bruger useRef til at få adgang til ScrollView'en.
  // Det gør det muligt for mig at flytte formularen lidt,
  // når brugeren trykker på nogle af de nederste inputfelter.
  const scrollViewRef = useRef(null);

  // Jeg bruger useState til at gemme værdien fra hvert inputfelt.
  // Når brugeren skriver noget, bliver den tilhørende state opdateret.
  const [currentRole, setCurrentRole] = useState('');
  const [field, setField] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [nationality, setNationality] = useState('');
  const [danishLevel, setDanishLevel] = useState('');
  const [previousExperience, setPreviousExperience] = useState('');
  const [applications, setApplications] = useState('');
  const [interviews, setInterviews] = useState('');
  const [jobRoute, setJobRoute] = useState('');
  const [advice, setAdvice] = useState('');

  // Jeg bruger denne funktion til at flytte ScrollView'en
  // til en bestemt position i formularen.
  //
  // Jeg bruger en kort timeout, så tastaturet når at åbne først.
  // Ellers kan ScrollView'en beregne positionen før skærmens størrelse ændres.
  const scrollToPosition = (yPosition) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yPosition,
        animated: true,
      });
    }, 200);
  };

  // Denne funktion bliver kørt, når brugeren trykker
  // på knappen "Submit career case".
  const submitCareerCase = () => {
    // Jeg kræver kun de vigtigste felter i denne prototype.
    // De andre felter må gerne være tomme.
    if (
      currentRole.trim() === '' ||
      university.trim() === '' ||
      degree.trim() === ''
    ) {
      Alert.alert(
        'Missing information',
        'Please fill in your current role, university and degree.'
      );

      return;
    }

    // Prototypen har endnu ikke en rigtig backend eller database.
    // Derfor viser jeg en Alert for at demonstrere,
    // at formularen bliver behandlet, når brugeren trykker Submit.
    Alert.alert(
      'Thank you!',
      'Your career case has been submitted.'
    );

    // Jeg nulstiller alle inputfelterne efter submission,
    // så formularen er klar til en ny bruger.
    setCurrentRole('');
    setField('');
    setUniversity('');
    setDegree('');
    setNationality('');
    setDanishLevel('');
    setPreviousExperience('');
    setApplications('');
    setInterviews('');
    setJobRoute('');
    setAdvice('');

    // Til sidst sender jeg ScrollView'en tilbage til toppen.
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}

      // På iOS bruger jeg padding, så tastaturet
      // ikke bare lægger sig direkte oven på formularen.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

      // Offset tager højde for headeren øverst i appen.
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}

        // Det gør det muligt at trykke på andre inputfelter,
        // selv om tastaturet allerede er åbent.
        keyboardShouldPersistTaps="handled"

        // På iPhone kan brugeren trække tastaturet væk
        // samtidig med at formularen scrolles.
        keyboardDismissMode="interactive"
      >
        <Text style={styles.formIntro}>
          Share your experience anonymously and help other international
          students understand how people actually enter the Danish job market.
        </Text>

        <Text style={styles.inputLabel}>Current role *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Junior Financial Analyst"
          value={currentRole}
          onChangeText={setCurrentRole}
        />

        <Text style={styles.inputLabel}>Field</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Finance"
          value={field}
          onChangeText={setField}
        />

        <Text style={styles.inputLabel}>University *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. CBS"
          value={university}
          onChangeText={setUniversity}
        />

        <Text style={styles.inputLabel}>Degree *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. MSc Finance"
          value={degree}
          onChangeText={setDegree}
        />

        <Text style={styles.inputLabel}>Nationality</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. German"
          value={nationality}
          onChangeText={setNationality}
        />

        <Text style={styles.inputLabel}>Danish level</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. A2 or No Danish"
          value={danishLevel}
          onChangeText={setDanishLevel}
        />

        <Text style={styles.inputLabel}>Previous experience</Text>
        <TextInput
          style={[
            styles.textInput,
            styles.textInputMultiline,
          ]}
          placeholder="What experience did you have before getting the role?"
          multiline
          value={previousExperience}
          onChangeText={setPreviousExperience}
        />

        <Text style={styles.inputLabel}>
          Number of applications
        </Text>

        <TextInput
          style={styles.textInput}
          placeholder="e.g. 32"
          keyboardType="numeric"
          value={applications}
          onChangeText={setApplications}
        />

        <Text style={styles.inputLabel}>
          Number of interviews
        </Text>

        <TextInput
          style={styles.textInput}
          placeholder="e.g. 5"
          keyboardType="numeric"
          value={interviews}
          onChangeText={setInterviews}
        />

        <Text style={styles.inputLabel}>
          How did you get the job?
        </Text>

        <TextInput
          style={styles.textInput}
          placeholder="e.g. LinkedIn application"
          value={jobRoute}
          onChangeText={setJobRoute}

          // Dette felt ligger relativt langt nede i formularen.
          // Jeg giver derfor kun formularen et lille ekstra skub.
          onFocus={() => scrollToPosition(350)}
        />

        <Text style={styles.inputLabel}>
          Advice for others
        </Text>

        <TextInput
          style={[
            styles.textInput,
            styles.textInputMultiline,
          ]}
          placeholder="What would you tell another international student?"
          multiline
          value={advice}
          onChangeText={setAdvice}

          // Det sidste felt kræver lidt mere scrolling,
          // men jeg sender ikke formularen helt til bunden.
          onFocus={() => scrollToPosition(450)}
        />

        <Pressable
          style={styles.submitButton}
          onPress={submitCareerCase}
        >
          <Text style={styles.submitButtonText}>
            Submit career case
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
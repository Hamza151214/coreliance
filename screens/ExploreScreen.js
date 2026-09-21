import { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';

import CareerCard from '../components/CareerCard';
import { CAREER_CASES } from '../data/careerCases';
import { styles } from '../styles/styles';

// Jeg samler alle mine filtre i ét array.
// Det gør det nemt at tilføje eller fjerne kategorier senere.
const FILTERS = [
  'All',
  'Finance',
  'Data',
  'Consulting',
  'Marketing',
  'IT',
  'Business Development',
];

export default function ExploreScreen({ navigation }) {
  // Jeg bruger state til at huske hvilket filter brugeren har valgt.
  // Appen starter med "All", så alle career cases bliver vist.
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Hvis brugeren vælger "All", bruger jeg hele datasættet.
  // Ellers filtrerer jeg efter careerCase.field.
  const filteredCases =
    selectedFilter === 'All'
      ? CAREER_CASES
      : CAREER_CASES.filter(
          (careerCase) => careerCase.field === selectedFilter
        );

  // Når jeg trykker på et CareerCard, sender jeg hele den valgte case
  // videre til detaljesiden gennem navigation.
  const openCareerCase = (careerCase) => {
    navigation.navigate('CareerCase', {
      careerCase: careerCase,
    });
  };

  // Denne funktion bestemmer hvordan én filterknap bliver vist.
  // Jeg bruger en FlatList til filtrene, så rækken får en fast højde
  // og ikke kan vokse mærkeligt, når en knap bliver aktiv.
  const renderFilter = ({ item }) => {
    const isActive = selectedFilter === item;

    return (
      <Pressable
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter(item)}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.filterText,
            isActive && styles.filterTextActive,
          ]}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      {/* 
        Jeg bruger en separat horizontal FlatList til filtrene.
        style på selve listen bestemmer den faste højde.
      */}
      <FlatList
        data={FILTERS}
        horizontal
        keyExtractor={(item) => item}
        renderItem={renderFilter}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={styles.filterListContent}
      />

      {/*
        Dette er appens hovedliste.
        FlatList viser alle de career cases, der matcher det valgte filter.
      */}
      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CareerCard
            careerCase={item}
            onPress={() => openCareerCase(item)}
          />
        )}
      />
    </View>
  );
}
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';

import CareerCard from '../components/CareerCard';
import { getCareerCases } from '../services/careerCaseService';
import { styles } from '../styles/styles';

export default function ExploreScreen({ navigation }) {
  // Jeg henter career cases gennem careerCaseService i stedet for at importere
  // demo-filen direkte. Så virker skærmen også, når data senere kommer fra Supabase.
  const [careerCases, setCareerCases] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);

  // Jeg bruger state til at huske hvilket filter brugeren har valgt.
  // Appen starter med "All", så alle career cases bliver vist.
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    getCareerCases()
      .then(setCareerCases)
      .catch(() => setLoadFailed(true));
  }, []);

  // Filtrene bygges ud fra de felter, der findes i data,
  // så jeg ikke skal vedligeholde en separat liste.
  const filters = ['All', ...new Set(careerCases.map((careerCase) => careerCase.field).filter(Boolean))];

  // Hvis brugeren vælger "All", bruger jeg hele datasættet.
  // Ellers filtrerer jeg efter careerCase.field.
  const filteredCases =
    selectedFilter === 'All'
      ? careerCases
      : careerCases.filter((careerCase) => careerCase.field === selectedFilter);

  // Når jeg trykker på et CareerCard, sender jeg hele den valgte case
  // videre til detaljesiden gennem navigation.
  const openCareerCase = (careerCase) => {
    navigation.navigate('CareerCase', { careerCase: careerCase });
  };

  // Denne funktion bestemmer hvordan én filterknap bliver vist.
  // Jeg bruger en FlatList til filtrene, så rækken får en fast højde
  // og ikke kan vokse mærkeligt, når en knap bliver aktiv.
  const renderFilter = ({ item }) => {
    const isActive = selectedFilter === item;

    return (
      <Pressable
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setSelectedFilter(item)}
      >
        <Text numberOfLines={1} style={[styles.filterText, isActive && styles.filterTextActive]}>
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Jeg bruger en separat horizontal FlatList til filtrene. */}
      <FlatList
        data={filters}
        horizontal
        keyExtractor={(item) => item}
        renderItem={renderFilter}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={styles.filterListContent}
      />

      {/*
        Dette er appens hovedliste.
        Øverst ligger indgangen til People Like Me.
      */}
      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Pressable style={styles.ctaCard} onPress={() => navigation.navigate('PeopleLikeMe')}>
              <Text style={styles.ctaTitle}>People Like Me →</Text>
              <Text style={styles.ctaText}>
                Create your job seeker profile and see career cases from people with a
                similar background and goals.
              </Text>
            </Pressable>

            <Text style={styles.noteText}>
              {loadFailed
                ? 'Career cases could not be loaded. Please try again later.'
                : 'The career cases below are demonstration examples.'}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <CareerCard careerCase={item} onPress={() => openCareerCase(item)} />
        )}
      />
    </View>
  );
}

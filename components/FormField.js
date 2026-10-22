import { View, Text, TextInput, Pressable } from 'react-native';

import { styles } from '../styles/styles';

// FormField viser ét felt i en formular: label, eventuel hjælpetekst,
// selve inputtet og en fejlbesked.
// Komponenten bruges af både ContributeScreen og JobSeekerProfileScreen,
// så de to formularer ikke gentager den samme kode.
//
// "field" er et objekt fra en feltliste, fx { label, placeholder, required, multiline }.
// Hvis feltet har "options", vises valgknapper i stedet for et tekstfelt.
// Med "multiSelect" kan flere knapper vælges, og værdien er et array.
export default function FormField({ field, value, onChange, error, onFocus }) {
  // Jeg finder ud af om en knap er valgt, og hvad den nye værdi bliver ved et tryk.
  const isSelected = (option) => (field.multiSelect ? (value || []).includes(option) : value === option);

  const toggleOption = (option) => {
    if (field.multiSelect) {
      const selected = value || [];
      onChange(isSelected(option) ? selected.filter((item) => item !== option) : [...selected, option]);
    } else {
      // Trykker man på det valgte svar igen, fjernes valget.
      onChange(isSelected(option) ? '' : option);
    }
  };

  return (
    <View>
      <Text style={styles.inputLabel}>
        {field.label}
        {field.required ? ' *' : ''}
      </Text>

      {field.hint ? <Text style={styles.inputHint}>{field.hint}</Text> : null}

      {field.options ? (
        <View style={styles.choiceRow}>
          {field.options.map((option) => {
            const isActive = isSelected(option);

            return (
              <Pressable
                key={option}
                style={[
                  styles.filterButton,
                  styles.choiceButton,
                  isActive && styles.filterButtonActive,
                ]}
                onPress={() => toggleOption(option)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <TextInput
          style={[
            styles.textInput,
            field.multiline && styles.textInputMultiline,
            error && styles.inputError,
          ]}
          placeholder={field.placeholder}
          keyboardType={field.keyboardType}
          autoCapitalize={field.autoCapitalize}
          secureTextEntry={field.secure}
          maxLength={field.maxLength || (field.multiline ? 1000 : 150)}
          multiline={field.multiline}
          value={value}
          onChangeText={onChange}
          onFocus={onFocus}
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

import { StyleSheet } from 'react-native';

// Farvepalette til hele appen
// Vi eksporterer den separat, så vi kan bruge farver direkte i komponenter
// hvor vi ikke går gennem et style-objekt (fx dynamiske badges)
export const colors = {
  navy: '#0F1E3D',
  white: '#FFFFFF',
  lightGray: '#F3F5F9',
  border: '#E5E7EB',
  textPrimary: '#0F1E3D',
  textSecondary: '#5B6478',
  textMuted: '#8A94A6',
  accent: '#2F6FED',
  successBg: '#E4F4EC',
  successText: '#1F8B5A',
};

// Alle styles er samlet i én StyleSheet
export const styles = StyleSheet.create({
  // FÆLLES CONTAINERE
  screen: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },

  // ABOUT SCREEN
// Denne sektion bruges til den korte introduktion til Coreliance.
// Jeg holder designet simpelt og bruger de samme farver som resten af appen.
aboutContainer: {
  padding: 20,
},

aboutTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: colors.textPrimary,
  marginBottom: 10,
},

aboutIntro: {
  fontSize: 15,
  color: colors.textSecondary,
  lineHeight: 22,
  marginBottom: 28,
},

// Hvert step består af et ikon og en tekstblok ved siden af hinanden.
aboutStep: {
  flexDirection: 'row',
  backgroundColor: colors.white,
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  alignItems: 'flex-start',
},

aboutStepText: {
  flex: 1,
  marginLeft: 14,
},

aboutStepTitle: {
  fontSize: 15,
  fontWeight: '600',
  color: colors.textPrimary,
  marginBottom: 5,
},

aboutStepDescription: {
  fontSize: 13,
  color: colors.textSecondary,
  lineHeight: 19,
},

  // FILTERLISTE PÅ EXPLORE-SCREEN
  // Jeg giver hele filterområdet en fast højde.
  // På den måde kan filterknapperne ikke pludselig vokse vertikalt.
  filterList: {
    flexGrow: 0,
    height: 58,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Jeg bruger kun denne style til indholdet inde i FlatList.
  // alignItems sørger for at alle filterknapper ligger centreret vertikalt.
  filterListContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  // Selve knappen har en FAST højde.
  // Jeg bruger derfor ikke paddingVertical, da det kan gøre højden mindre forudsigelig.
  filterButton: {
    height: 34,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,

    // Teksten skal stå præcis i midten af boblen.
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Når filteret er aktivt ændrer jeg KUN farverne.
  // Jeg ændrer bevidst ikke height, padding eller andre størrelser.
  filterButtonActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },

  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',

    // En fast lineHeight gør at bogstaverne ikke bliver klippet.
    lineHeight: 18,
  },

  filterTextActive: {
    color: colors.white,
  },

  // LISTE (ExploreScreen)
  listContent: {
    padding: 16,
  },

  // CAREER CARD
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Skygge for at give kortet dybde
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.successBg,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successText,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardStatsRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardStat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 16,
  },
  cardStatValue: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  viewCase: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 10,
  },

  // DETALJESIDE (CareerCaseScreen)
  detailHeader: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  detailSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 130,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  bulletItem: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
    paddingLeft: 4,
  },
  adviceQuote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // CV SNAPSHOT-KNAP (CareerCaseScreen)
  cvButton: {
    backgroundColor: colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cvButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // FORMULAR (ContributeScreen)

  // FORMULAR-CONTAINER
  // Jeg giver formularen almindelig padding rundt om indholdet.
  // Der er også lidt ekstra plads nederst, så det sidste felt
  // stadig kan scrolles op over tastaturet.
  formContainer: {
    padding: 16,
    paddingBottom: 120,
  },

  formIntro: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textInputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.navy,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },

  // KeyboardAvoidingView skal fylde hele skærmen.
  // Ellers kan ScrollView'en ikke beregne den ledige plads korrekt.
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },

});
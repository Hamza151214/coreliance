// Her definerer jeg alle felter i jobsøgerprofilen ét sted.
// JobSeekerProfileScreen bygger formularen ud fra denne liste,
// så et nyt spørgsmål kun skal tilføjes her.
//
// Formularen er bevidst kort: mest valgknapper og korte felter,
// og kun to længere fritekstfelter, som giver AI'en personlig kontekst.
//
// Felttyper:
// - options: brugeren vælger én værdi
// - options + multiSelect: brugeren kan vælge flere værdier (gemmes som array)
// - multiline: længere fritekst
// - ellers: kort tekstfelt

export const INDUSTRIES = [
  'Finance',
  'Data & Analytics',
  'Consulting',
  'Marketing & Communication',
  'IT & Software',
  'Sales & Business Development',
  'Supply Chain & Operations',
  'Design & UX',
  'Public Sector & NGOs',
];

export const PROFILE_SECTIONS = [
  {
    title: 'About you',
    fields: [
      {
        key: 'status',
        label: 'Current status',
        required: true,
        options: ['Student', 'Recent Graduate', 'Other Job Seeker'],
      },
      { key: 'university', label: 'University', required: true, placeholder: 'e.g. CBS' },
      {
        key: 'degree',
        label: 'Degree and field of study',
        required: true,
        placeholder: 'e.g. MSc Business Administration and Data Science',
      },
      {
        key: 'danishLevel',
        label: 'Danish level',
        required: true,
        options: ['No Danish', 'A1', 'A2', 'B1', 'B2', 'C1', 'Native'],
      },
    ],
  },
  {
    title: 'Your experience',
    fields: [
      {
        key: 'experienceLevel',
        label: 'Relevant work experience',
        required: true,
        options: ['None yet', 'Student job or internship', '1–2 years', '3+ years'],
      },
      {
        key: 'skills',
        label: 'Key skills',
        required: true,
        placeholder: 'e.g. Excel, SQL, project management',
      },
      {
        key: 'background',
        label: 'Tell us about your background, experience and skills.',
        required: true,
        multiline: true,
        placeholder: 'A few sentences are enough.',
      },
    ],
  },
  {
    title: 'What you are looking for',
    fields: [
      {
        key: 'desiredRoles',
        label: 'Desired job titles',
        required: true,
        placeholder: 'e.g. Data Analyst, Business Analyst',
      },
      {
        key: 'industries',
        label: 'Industries of interest',
        required: true,
        multiSelect: true,
        options: INDUSTRIES,
        hint: 'Choose one or more.',
      },
      {
        key: 'preferredLocation',
        label: 'Preferred location',
        options: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Anywhere in Denmark'],
      },
      {
        key: 'lookingFor',
        label: 'What kind of job are you looking for, and why?',
        required: true,
        multiline: true,
        placeholder: 'A few sentences are enough.',
      },
      {
        key: 'biggestChallenge',
        label: 'Biggest challenge in your job search so far',
        required: true,
        options: [
          'Danish language requirements',
          'No professional network',
          'Little relevant experience',
          'Getting invited to interviews',
          'Knowing which jobs fit me',
          'Understanding Danish work culture',
        ],
      },
    ],
  },
];

const PROFILE_FIELDS = PROFILE_SECTIONS.flatMap((section) => section.fields);

// En tom profil: tom tekst for almindelige felter og et tomt array for multiselect.
export const EMPTY_PROFILE = Object.fromEntries(
  PROFILE_FIELDS.map((field) => [field.key, field.multiSelect ? [] : ''])
);

const MIN_FREE_TEXT_LENGTH = 30;

// Jeg returnerer et objekt med en fejltekst for hvert felt, der ikke er gyldigt.
// Et tomt objekt betyder, at profilen kan gemmes.
export function validateProfile(profile) {
  const errors = {};

  PROFILE_FIELDS.forEach((field) => {
    const value = profile[field.key];
    const isEmpty = field.multiSelect ? !value || value.length === 0 : (value || '').trim() === '';

    if (field.required && isEmpty) {
      errors[field.key] = field.multiSelect ? 'Please choose at least one.' : 'This field is required.';
    } else if (field.multiline && (value || '').trim().length < MIN_FREE_TEXT_LENGTH) {
      errors[field.key] = `Please write at least a couple of sentences (${MIN_FREE_TEXT_LENGTH}+ characters).`;
    }
  });

  return errors;
}

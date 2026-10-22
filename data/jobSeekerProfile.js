// Her definerer jeg alle felter i jobsøgerprofilen ét sted.
// JobSeekerProfileScreen bygger formularen ud fra denne liste,
// så et nyt spørgsmål kun skal tilføjes her.
//
// Felttyper:
// - options: brugeren vælger én værdi blandt knapper
// - multiline: længere fritekst
// - list: kommasepareret tekst, fx "Excel, SQL, Python"

const DANISH_LEVELS = ['No Danish', 'A1', 'A2', 'B1', 'B2', 'C1', 'Native'];
const ENGLISH_LEVELS = ['Basic', 'Intermediate', 'Fluent', 'Native'];

export const PROFILE_SECTIONS = [
  {
    title: 'Education & background',
    fields: [
      {
        key: 'status',
        label: 'Current status',
        required: true,
        options: ['Student', 'Recent Graduate', 'Other Job Seeker'],
      },
      { key: 'university', label: 'University or institution', required: true, placeholder: 'e.g. CBS' },
      {
        key: 'degree',
        label: 'Degree and field of study',
        required: true,
        placeholder: 'e.g. MSc Business Administration and Data Science',
      },
      {
        key: 'graduationYear',
        label: 'Graduation year (or expected)',
        required: true,
        placeholder: 'e.g. 2026',
        keyboardType: 'numeric',
        maxLength: 4,
      },
      {
        key: 'countryOfOrigin',
        label: 'Country of origin',
        placeholder: 'e.g. Brazil',
        hint: 'Optional. This is never used for matching.',
      },
      { key: 'danishLevel', label: 'Danish level', required: true, options: DANISH_LEVELS },
      { key: 'englishLevel', label: 'English level', options: ENGLISH_LEVELS },
    ],
  },
  {
    title: 'Professional background',
    fields: [
      {
        key: 'workExperience',
        label: 'Previous work experience',
        multiline: true,
        placeholder: 'Roles, internships or projects you have worked on',
      },
      {
        key: 'studentJobs',
        label: 'Student job experience',
        multiline: true,
        placeholder: 'e.g. Student assistant in finance at a Danish SME',
      },
      {
        key: 'skills',
        label: 'Relevant skills',
        required: true,
        list: true,
        placeholder: 'e.g. Excel, SQL, Power BI',
        hint: 'Separate skills with commas.',
      },
      {
        key: 'previousIndustries',
        label: 'Industries you have worked in',
        list: true,
        placeholder: 'e.g. Banking, Retail',
      },
      {
        key: 'employmentSituation',
        label: 'Current employment situation',
        options: ['Not employed', 'Student job', 'Internship', 'Part-time job', 'Full-time job'],
      },
      {
        key: 'professionalBackground',
        label: 'Tell us about your professional background.',
        multiline: true,
      },
      {
        key: 'standOut',
        label: 'What skills or experiences make you stand out?',
        multiline: true,
      },
    ],
  },
  {
    title: 'Career interests',
    fields: [
      {
        key: 'desiredRoles',
        label: 'Desired job roles',
        required: true,
        list: true,
        placeholder: 'e.g. Data Analyst, Business Analyst',
        hint: 'Separate roles with commas.',
      },
      {
        key: 'industriesOfInterest',
        label: 'Industries of interest',
        list: true,
        placeholder: 'e.g. Finance, Consulting, Tech',
      },
      { key: 'preferredLocation', label: 'Preferred location', placeholder: 'e.g. Copenhagen' },
      {
        key: 'employmentType',
        label: 'Employment type',
        options: ['Full-time', 'Part-time', 'Student job', 'Internship', 'Graduate programme'],
      },
      {
        key: 'lookingFor',
        label: 'What kind of job are you looking for, and why?',
        required: true,
        multiline: true,
      },
      { key: 'careerDirection', label: 'Describe your ideal career direction.', multiline: true },
      {
        key: 'workInterests',
        label: 'What interests you most about the work you want to do?',
        multiline: true,
      },
    ],
  },
  {
    title: 'Your story',
    description:
      'These answers help us find people with a similar journey — not just the same job title.',
    fields: [
      {
        key: 'biggestChallenge',
        label: 'What has been your biggest challenge in finding a job in Denmark?',
        required: true,
        multiline: true,
      },
      {
        key: 'beyondApplication',
        label: 'Tell us something about yourself that a traditional job application might not capture.',
        multiline: true,
      },
      {
        key: 'wantToLearn',
        label: 'What would you like to learn from someone who has successfully found a job here?',
        multiline: true,
      },
    ],
  },
];

const PROFILE_FIELDS = PROFILE_SECTIONS.flatMap((section) => section.fields);

// En tom profil med alle felter som tomme tekster.
// Den bruges som udgangspunkt, når formularen åbnes første gang.
export const EMPTY_PROFILE = Object.fromEntries(PROFILE_FIELDS.map((field) => [field.key, '']));

// Jeg returnerer et objekt med en fejltekst for hvert felt, der ikke er gyldigt.
// Et tomt objekt betyder, at profilen kan gemmes.
export function validateProfile(profile) {
  const errors = {};

  PROFILE_FIELDS.forEach((field) => {
    if (field.required && (profile[field.key] || '').trim() === '') {
      errors[field.key] = 'This field is required.';
    }
  });

  // Årstallet skal være fire cifre og realistisk (op til 30 år tilbage og 6 år frem).
  const year = Number(profile.graduationYear);
  const currentYear = new Date().getFullYear();
  const isValidYear =
    /^\d{4}$/.test(profile.graduationYear) && year >= currentYear - 30 && year <= currentYear + 6;

  if (!errors.graduationYear && !isValidYear) {
    errors.graduationYear = 'Please enter a valid year, e.g. 2026.';
  }

  if (!errors.lookingFor && (profile.lookingFor || '').trim().length < 20) {
    errors.lookingFor = 'Please write at least a sentence (20+ characters).';
  }

  return errors;
}

// Lister skrives som kommasepareret tekst i formularen.
// Her laver jeg dem om til et array, fx "Excel, SQL" -> ['Excel', 'SQL'].
export function toList(text) {
  return (text || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

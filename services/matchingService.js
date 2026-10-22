import { getCareerCases } from './careerCaseService';
import { toList } from '../data/jobSeekerProfile';

// MIDLERTIDIG MATCHING TIL PROTOTYPEN
// Dette er IKKE AI. Jeg sammenligner profilen med career cases ud fra
// simple ord-overlap i uddannelse, roller, brancher, skills og erfaring.
// Senere erstattes findMatches() af et kald til en sikker backend (OpenAI),
// men input (profil) og output (liste af matches) skal forblive det samme.
export const MATCHING_IS_DEMO = true;

const MIN_SCORE = 3;
const MAX_RESULTS = 5;

// Ord der er så almindelige, at de ikke siger noget om ligheden.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'have', 'i',
  'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'so', 'that', 'the', 'their',
  'they', 'this', 'to', 'want', 'was', 'we', 'with', 'would', 'you', 'your', 'can',
  'will', 'like', 'also', 'get', 'find', 'more', 'some', 'very', 'what', 'why', 'how',
  'job', 'jobs', 'work', 'working', 'role', 'roles', 'position', 'company', 'firm',
  'student', 'students', 'assistant', 'intern', 'internship', 'junior', 'senior',
  'associate', 'year', 'years', 'experience', 'msc', 'bsc', 'ma', 'ba', 'master',
  'masters', 'bachelor', 'science', 'studies', 'degree', 'denmark', 'danish',
  'copenhagen', 'looking', 'interested', 'interest', 'business', 'international',
  'new', 'people',
]);

// En lille ordliste pr. felt, så fx "analytics" også kan matche feltet "Data".
const FIELD_KEYWORDS = {
  Finance: ['finance', 'financial', 'banking', 'accounting', 'audit', 'investment', 'controlling'],
  Data: ['data', 'analytics', 'analyst', 'analysis', 'python', 'sql', 'reporting', 'bi'],
  Marketing: ['marketing', 'brand', 'branding', 'digital', 'content', 'communication', 'ux', 'design'],
  Consulting: ['consulting', 'consultant', 'strategy', 'advisory'],
  IT: ['software', 'developer', 'engineering', 'engineer', 'tech', 'technology', 'programming', 'cloud'],
  'Business Development': ['sales', 'commercial', 'partnerships', 'bizdev'],
};

// Laver en tekst om til en liste af meningsfulde ord med små bogstaver.
function words(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#]+/u)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

// Returnerer de ord, som findes i begge lister (uden dubletter).
function sharedWords(listA, listB) {
  return [...new Set(listA.filter((word) => listB.includes(word)))];
}

// To skills er ens, hvis de er identiske, eller hvis den ene indeholder den anden,
// fx "CRM" og "CRM (Pipedrive)".
function isSameSkill(a, b) {
  const x = a.toLowerCase();
  const y = b.toLowerCase();

  return x === y || (x.length > 2 && y.includes(x)) || (y.length > 2 && x.includes(y));
}

// Sammenligner én profil med én career case.
// Hver lighed giver point og en forklaring, der kun bygger på felter som faktisk findes.
function matchCareerCase(profile, careerCase) {
  let score = 0;

  // Universitet, dansk-niveau og by alene er ikke nok til et match.
  // Derfor husker jeg, om der er mindst én karriererelateret lighed (punkt 1, 2, 3, 5 eller 6).
  let hasCareerOverlap = false;
  const similarities = [];
  const differences = [];
  const lessons = [];

  // 1. Ønskede roller sammenlignet med personens jobtitel
  if (sharedWords(words(profile.desiredRoles), words(careerCase.jobTitle)).length > 0) {
    score += 3;
    hasCareerOverlap = true;
    similarities.push(`Works as ${careerCase.jobTitle}, close to the roles you want.`);
  }

  // 2. Brancheinteresser sammenlignet med personens felt
  if (careerCase.field) {
    const interests = [...toList(profile.industriesOfInterest), ...toList(profile.desiredRoles)];
    const fieldWords = [...words(careerCase.field), ...(FIELD_KEYWORDS[careerCase.field] || [])];
    const fieldMatches =
      interests.some((item) => item.toLowerCase() === careerCase.field.toLowerCase()) ||
      sharedWords(words(interests.join(' ')), fieldWords).length > 0;

    if (fieldMatches) {
      score += 3;
      hasCareerOverlap = true;
      similarities.push(`Works in ${careerCase.field}, which relates to your career interests.`);
    } else if (profile.industriesOfInterest) {
      differences.push(`Works in ${careerCase.field}, which is not one of the industries you listed.`);
    }
  }

  // 3. Fælles skills (højst 6 point, så skills ikke vægter alt)
  const mySkills = toList(profile.skills);
  const commonSkills = careerCase.skills.filter((skill) =>
    mySkills.some((mySkill) => isSameSkill(mySkill, skill))
  );

  if (commonSkills.length > 0) {
    score += Math.min(commonSkills.length * 2, 6);
    hasCareerOverlap = true;
    similarities.push(`Shared skills: ${commonSkills.join(', ')}.`);
  }

  // 4. Uddannelse og universitet
  if (careerCase.degree) {
    if (sharedWords(words(profile.degree), words(careerCase.degree)).length > 0) {
      score += 2;
      similarities.push(`Similar education: ${careerCase.degree}.`);
    } else {
      differences.push(
        `Different educational background (${careerCase.degree}), but their route may still be relevant.`
      );
    }
  }

  const myUniversity = (profile.university || '').trim().toLowerCase();

  if (careerCase.university && careerCase.university.toLowerCase() === myUniversity) {
    score += 1;
    similarities.push(`Also studied at ${careerCase.university}.`);
  }

  // 5. Tidligere erfaring: jeg finder det første erfaringspunkt hos personen,
  // der deler ord med brugerens egen erfaring.
  const myExperience = words(
    [
      profile.workExperience,
      profile.studentJobs,
      profile.previousIndustries,
      profile.professionalBackground,
    ].join(' ')
  );
  const relatedExperience = careerCase.previousExperience.find(
    (item) => sharedWords(myExperience, words(item)).length > 0
  );

  if (relatedExperience) {
    score += 2;
    hasCareerOverlap = true;
    similarities.push(`Comparable experience before being hired: "${relatedExperience}".`);
  }

  // 6. Brugerens egne fritekstsvar. Her kan der findes ligheder,
  // som ikke fremgår af jobtitler eller uddannelse alene.
  const storyWords = words(
    [
      profile.lookingFor,
      profile.careerDirection,
      profile.workInterests,
      profile.standOut,
      profile.beyondApplication,
    ].join(' ')
  );
  // Jeg sammenligner kun med ord, der faktisk står i casen,
  // så forklaringen aldrig nævner noget, personen ikke selv har oplyst.
  const caseText = [
    careerCase.jobTitle,
    careerCase.field,
    careerCase.degree,
    ...careerCase.skills,
    ...careerCase.previousExperience,
  ].join(' ');
  const storyMatches = sharedWords(storyWords, words(caseText)).slice(0, 3);

  if (storyMatches.length > 0) {
    score += Math.min(storyMatches.length, 2);
    hasCareerOverlap = true;
    similarities.push(`Your own answers mention ${storyMatches.join(', ')}, which relates to their path.`);
  }

  // 7. Dansk-niveau og lokation (lav vægt)
  if (careerCase.danishLevel && profile.danishLevel) {
    if (careerCase.danishLevel === profile.danishLevel) {
      score += 1;
      similarities.push(`Had the same Danish level as you (${careerCase.danishLevel}) when hired.`);
    } else {
      const theirLevel =
        careerCase.danishLevel === 'No Danish' ? 'no Danish' : `Danish level ${careerCase.danishLevel}`;
      differences.push(`Had ${theirLevel} when hired (you: ${profile.danishLevel}).`);
    }
  }

  const myLocation = (profile.preferredLocation || '').toLowerCase();

  if (careerCase.location && myLocation.includes(careerCase.location.toLowerCase())) {
    score += 1;
    similarities.push(`Works in ${careerCase.location}, where you would like to work.`);
  }

  // Lessons bygger kun på det personen selv har oplyst om sin jobsøgning.
  if (careerCase.jobRoute) {
    lessons.push(`Got the job through: ${careerCase.jobRoute}${careerCase.referral ? ' (referral)' : ''}.`);
  }

  if (careerCase.applications !== null && careerCase.interviews !== null) {
    lessons.push(`Sent ${careerCase.applications} applications and had ${careerCase.interviews} interviews.`);
  }

  if (careerCase.advice) {
    lessons.push(`Their advice: "${careerCase.advice}"`);
  }

  return {
    careerCaseId: careerCase.id,
    careerCase,
    score: hasCareerOverlap ? score : 0,
    relevance: score >= 8 ? 'Strong match' : 'Possible match',
    similarities,
    differences,
    lessons,
  };
}

// Input: en gemt jobsøgerprofil.
// Output: en sorteret liste af matches med forklaringer.
// Nationalitet og oprindelsesland bruges bevidst ikke.
export async function findMatches(profile) {
  const careerCases = await getCareerCases();

  return careerCases
    .map((careerCase) => matchCareerCase(profile, careerCase))
    .filter((match) => match.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}

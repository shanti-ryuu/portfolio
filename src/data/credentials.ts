import { credentialImages } from './gallery.generated'

export type CredentialCategory = 'course' | 'participation' | 'award' | 'academic'
export type CredentialEvidence = {
  file: string
  imageKey: string
  caption: string
}
export type CredentialRecord = {
  id: string
  category: CredentialCategory
  title: string
  issuer: string | null
  date: string | null
  context: string | null
  evidence: CredentialEvidence[]
  draftFacts: Array<{ field: string; value: string | null; draft: true }>
}

export const credentials: CredentialRecord[] = [
  {
    id: 'cisco-packet-tracer-course', category: 'course', title: 'Getting Started with Cisco Packet Tracer',
    issuer: 'St. Dominic College of Asia · Cisco Networking Academy', date: '2026-02-06', context: null,
    evidence: [{ file: 'course completion/cisco-packet-tracer-course.png', imageKey: 'cisco-packet-tracer-course', caption: 'Certificate for Getting Started with Cisco Packet Tracer.' }], draftFacts: [],
  },
  {
    id: 'cybersecurity', category: 'course', title: 'Information Technology Specialist Certification: Cybersecurity',
    issuer: 'Pearson · Certiport', date: '2026-02-04', context: null,
    evidence: [{ file: 'course completion/cybersecurity.png', imageKey: 'cybersecurity', caption: 'Information Technology Specialist Certification in Cybersecurity.' }], draftFacts: [],
  },
  {
    id: 'introduction-to-cybersec', category: 'course', title: 'Introduction to Cybersecurity',
    issuer: 'St. Dominic College of Asia · Cisco Networking Academy', date: '2026-10-20', context: null,
    evidence: [{ file: 'course completion/introduction-to-cybersec.png', imageKey: 'introduction-to-cybersec', caption: 'Introduction to Cybersecurity certificate.' }], draftFacts: [],
  },
  {
    id: 'introduction-to-iot', category: 'course', title: 'Introduction to IoT and Digital Transformation',
    issuer: 'St. Dominic College of Asia · Cisco Networking Academy', date: '2026-03-03', context: null,
    evidence: [{ file: 'course completion/introduction-to-iot.png', imageKey: 'introduction-to-iot', caption: 'Certificate for Introduction to IoT and Digital Transformation.' }], draftFacts: [],
  },
  {
    id: 'java-course', category: 'course', title: 'Java Foundations', issuer: 'Oracle Academy', date: '2024-12-27', context: null,
    evidence: [{ file: 'course completion/java-course.png', imageKey: 'java-course', caption: 'Oracle Academy certificate for Java Foundations.' }], draftFacts: [],
  },
  {
    id: 'microsoft-specialist', category: 'course', title: 'Microsoft Office Specialist: PowerPoint 2019 Associate',
    issuer: 'Microsoft · Certiport', date: '2024-05-30', context: null,
    evidence: [{ file: 'course completion/microsoft-specialist.png', imageKey: 'microsoft-specialist', caption: 'Microsoft Office Specialist certificate for PowerPoint 2019 Associate.' }], draftFacts: [],
  },
  {
    id: 'software-dev', category: 'course', title: 'Software Development', issuer: 'Pearson · Certiport', date: '2026-06-03', context: null,
    evidence: [{ file: 'course completion/software-dev.png', imageKey: 'software-dev', caption: 'Software Development certificate.' }], draftFacts: [],
  },
  {
    id: 'dict-participation', category: 'participation', title: 'Digital Startup Development and Acceleration Program (DSDAP) Caravan',
    issuer: 'ICT Industry Development Bureau · DICT Region IV-A', date: '2024-05-29', context: 'St. Dominic College of Asia · DRA Hall',
    evidence: [{ file: 'extracurricular cert/DICT-participation.png', imageKey: 'dict-participation', caption: 'Certificate of participation in the DSDAP Caravan.' }], draftFacts: [],
  },
  {
    id: 'egovph-participation', category: 'participation', title: 'eGOVPH Super App Orientation',
    issuer: 'Department of Information and Communications Technology · Region IV-A', date: '2024-05-29', context: 'St. Dominic College of Asia · Bacoor, Cavite',
    evidence: [{ file: 'extracurricular cert/egovph-participation.png', imageKey: 'egovph-participation', caption: 'Certificate of participation in the eGOVPH Super App Orientation.' }], draftFacts: [],
  },
  {
    id: 'prompt-engineering', category: 'participation', title: 'Prompt Engineering & AI Practice',
    issuer: 'Dominican Forge · ICT Department', date: '2025', context: 'Certificate of participation',
    evidence: [{ file: 'extracurricular cert/prompt-engineering.png', imageKey: 'prompt-engineering', caption: 'Certificate of participation in Prompt Engineering & AI Practice.' }], draftFacts: [],
  },
  {
    id: 'code-hunt-2ndplace', category: 'award', title: '2nd Place · Domini Xode Code Hunt',
    issuer: 'Domini Xode', date: null, context: null,
    evidence: [{ file: 'extracurricular cert/code-hunt-2ndplace.png', imageKey: 'code-hunt-2ndplace', caption: 'Second-place certificate for Domini Xode Code Hunt.' }],
    draftFacts: [{ field: 'eventDate', value: null, draft: true }],
  },
  {
    id: 'deanslist', category: 'academic', title: 'Dean’s List · First Semester, Academic Year 2025–2026',
    issuer: 'St. Dominic College of Asia', date: '2026-04-27', context: null,
    evidence: [
      { file: 'education cert/deanslist-cert1.png', imageKey: 'deanslist-cert1', caption: 'Dean’s List certificate for the first semester of Academic Year 2025–2026.' },
      { file: 'education cert/deanslist-certs.png', imageKey: 'deanslist-certs', caption: 'Photograph of Dean’s List certificates.' },
      { file: 'education cert/pictorial-deanslist.png', imageKey: 'pictorial-deanslist', caption: 'Group photo at a Dean’s List recognition event.' },
    ], draftFacts: [],
  },
  {
    id: 'course-passers-photo-record', category: 'academic', title: 'Photo record: Networking, JavaScript, and Cybersecurity passers',
    issuer: null, date: null, context: null,
    evidence: [{ file: 'education cert/pictrial-course-passers.JPG', imageKey: 'course-passers-photo-record', caption: 'Photo record of Networking, JavaScript, and Cybersecurity passers.' }],
    draftFacts: [{ field: 'eventDate', value: null, draft: true }, { field: 'organizer', value: null, draft: true }],
  },
]

export const credentialImagesByKey = credentialImages
export const credlyUrl = 'https://www.credly.com/users/joshua-santelices/badges/credly'

export function credentialImage(id: string) {
  return credentialImagesByKey[id]
}

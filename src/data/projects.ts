import type { GalleryKey } from './gallery.generated'

export type ProjectStatus = 'Implemented' | 'In progress' | 'Planned'
export type ProjectRepository = { label: string; url: string; note?: string; status?: ProjectStatus }
export type ProjectSection = { title: string; body: string; draft?: boolean }
export type ProjectComponent = { title: string; url: string; status: ProjectStatus; evidence: string; draft?: boolean }

export type Project = {
  slug: string
  title: string
  shortTitle: string
  kind: string
  status: string
  summary: string
  context: string
  roles: string[]
  contribution: string[]
  tech: string[]
  plannedTech?: string[]
  repos: ProjectRepository[]
  components?: ProjectComponent[]
  features: ProjectSection[]
  architecture: ProjectSection[]
  draftFacts: ProjectSection[]
  gallery: GalleryKey
}

// This is the single source used by Home, About, Tech Stack project references,
// the project index, and all case-study pages.
export const projects: Project[] = [
  {
    slug: 'grain-solar-rice-dryer',
    title: 'AI-Assisted Optimization of IoT Solar-Powered Rice Grain Dryer with Android-Based Monitoring and Predictive Control System.',
    shortTitle: 'grAIn: Solar-powered rice grain dryer',
    kind: 'IoT · Mobile · Web',
    status: 'In development',
    summary: 'An academic capstone exploring solar-powered rice drying, an Android monitoring app, and predictive-control ideas.',
    context: 'The capstone is organized across an admin dashboard, a mobile app, and a machine-learning service. The public repositories contain app screens, server routes, and prediction/training code; the presence of code does not verify hardware operation or model performance.',
    roles: ['Frontend development', 'Team lead', 'Documentation', 'Backend integration', 'Deployment'],
    contribution: [
      'Frontend development across the project interfaces.',
      'Team leadership and project documentation.',
      'Backend integration and deployment work as part of the capstone team.',
    ],
    tech: ['nextjs', 'react', 'typescript', 'expo', 'react-native', 'node', 'python', 'mongodb'],
    plannedTech: ['esp32-cpp', 'android-java'],
    repos: [
      { label: 'Admin dashboard', url: 'https://github.com/shanti-ryuu/grAIn-admin', note: 'Next.js application with dashboard pages and API routes.' },
      { label: 'Mobile app', url: 'https://github.com/shanti-ryuu/grAIn-mobile', note: 'Expo and React Native app with route and screen implementations.' },
      { label: 'ML service', url: 'https://github.com/shanti-ryuu/grAIn-ml-service', note: 'Flask prediction service and model training scripts; no model or dataset artifacts were present in the repository tree.' },
    ],
    components: [
      { title: 'Admin dashboard', url: 'https://github.com/shanti-ryuu/grAIn-admin', status: 'Implemented', evidence: 'Repository contains dashboard pages, API routes, models, and interface components.' },
      { title: 'Mobile app', url: 'https://github.com/shanti-ryuu/grAIn-mobile', status: 'Implemented', evidence: 'Repository contains Expo routes, React Native screens, API client, and device/control flows.' },
      { title: 'ML service', url: 'https://github.com/shanti-ryuu/grAIn-ml-service', status: 'In progress', evidence: 'Flask prediction endpoints and training scripts are present; the repository tree contains no model or dataset artifacts.' },
    ],
    features: [
      { title: 'Monitoring interface', body: 'Screens show dryer status, session information, sensor fields, alerts, and chart views. Displayed values are UI states, not verified measurements.' },
      { title: 'Control interface', body: 'A screen presents device selection, auto/manual controls, and temperature and fan sliders.' },
    ],
    architecture: [
      { title: 'Admin dashboard', body: 'Next.js, React, and TypeScript pages are paired with API route handlers and MongoDB models in the repository.' },
      { title: 'Mobile app', body: 'Expo Router and React Native screens use an API client and app context/hooks.' },
      { title: 'ML service', body: 'A Flask service exposes prediction endpoints and has Random Forest/XGBoost training code that reads a CSV training dataset.' },
    ],
    draftFacts: [
      { title: 'Hardware operation', body: 'Whether the repository UI has been connected to the physical dryer is unverified.', draft: true },
      { title: 'Model validation', body: 'No validated model, completed dataset, measured accuracy, or predictive-control result has been verified.', draft: true },
      { title: 'Production deployment', body: 'Live deployment status for any component is unverified.', draft: true },
    ],
    gallery: 'grain-solar-rice-dryer',
  },
  {
    slug: 'scentryx',
    title: 'ScentryX gas detection monitoring',
    shortTitle: 'ScentryX gas detection monitoring',
    kind: 'IoT · Mobile app',
    status: 'Frontend contribution',
    summary: 'A Flutter interface for a gas-monitoring project, with sign-in and device dashboard screens for gas level, safety status, and connectivity.',
    context: 'The linked repository is the ScentryX frontend app. Its README is still the default Flutter starter text; the UI screens provide the visible product details used here.',
    roles: ['Frontend design / UI', 'Documentation', 'Team lead'],
    contribution: [
      'Frontend design and UI contribution to the Flutter application.',
      'Project documentation and team leadership.',
    ],
    tech: ['flutter', 'dart'],
    repos: [
      { label: 'Frontend app', url: 'https://github.com/shanti-ryuu/ScentryX_FE', note: 'Flutter frontend repository.' },
    ],
    features: [
      { title: 'Sign-in screen', body: 'The gallery shows an email and password sign-in form.' },
      { title: 'Gas monitor dashboard', body: 'The visible dashboard shows a Kitchen Sensor, a gas-level display, Safe status, and Online device state. These are screenshot UI values.' },
    ],
    architecture: [
      { title: 'Frontend repository', body: 'The linked repository is a Flutter application. Its README does not document project-specific system architecture.' },
    ],
    draftFacts: [
      { title: 'Backend and hardware', body: 'Backend implementation, physical sensor integration, and production behavior are not established by the linked frontend repository.', draft: true },
      { title: 'Project-specific README', body: 'The repository README remains a generic Flutter starter template.', draft: true },
    ],
    gallery: 'scentryx',
  },
  {
    slug: 'dominotes',
    title: 'Dominotes',
    shortTitle: 'Dominotes',
    kind: 'Notes · Flutter Web PWA',
    status: 'Repository available',
    summary: 'An offline-ready notes PWA built with Flutter Web and Dart, with PIN access, folders, themes, and local Hive storage.',
    context: 'DomiNotes is a mobile-first notes app inspired by Apple Notes. Its README documents offline operation with Hive and describes Netlify as a supported static hosting option.',
    roles: ['Frontend design', 'Deployment'],
    contribution: [
      'Frontend design for the notes application.',
      'Deployment work for the project.',
    ],
    tech: ['flutter', 'dart', 'hive', 'netlify'],
    repos: [
      { label: 'Repository', url: 'https://github.com/shanti-ryuu/domini', note: 'README documents a Flutter Web/Dart PWA and Netlify as a supported host.' },
    ],
    features: [
      { title: 'Notes and folders', body: 'The README describes creating, editing, deleting, and organizing notes into folders.' },
      { title: 'Access and appearance', body: 'The README describes PIN access and light/dark theme support; the gallery includes settings screens.' },
      { title: 'Offline use', body: 'The README describes local Hive storage and offline functionality.' },
    ],
    architecture: [
      { title: 'Application', body: 'Flutter Web and Dart provide the Progressive Web App interface.' },
      { title: 'Local data', body: 'The README identifies Hive as the local NoSQL storage layer and states the app works independently of a cloud backend.' },
    ],
    draftFacts: [
      { title: 'Live deployment URL', body: 'A live deployment URL is not listed in the repository README.', draft: true },
    ],
    gallery: 'dominotes',
  },
]

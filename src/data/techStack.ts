export type TechCategory = 'Frontend' | 'Programming' | 'Mobile' | 'Backend & Data' | 'Cloud & Tools'
export type TechStatus = 'used' | 'studied' | 'exploring'
export type TechItem = {
  id: string
  name: string
  category: TechCategory
  status: TechStatus
  note: string
  logo: string
  featured?: boolean
  todo?: string
}

export const techStack: TechItem[] = [
  { id: 'react', name: 'React', category: 'Frontend', status: 'used', note: 'Used to build this portfolio interface.', logo: 'react', featured: true },
  { id: 'typescript', name: 'TypeScript', category: 'Programming', status: 'used', note: 'Used for typed React components and page data.', logo: 'typescript', featured: true },
  { id: 'css', name: 'CSS', category: 'Frontend', status: 'used', note: 'Used for layout, responsive styling, and glass surfaces.', logo: 'css', featured: true },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', status: 'used', note: 'Installed and configured through the Vite plugin; custom CSS defines the site styling.', logo: 'tailwindcss' },
  { id: 'vite', name: 'Vite', category: 'Frontend', status: 'used', note: 'Development server and production build for this portfolio.', logo: 'vite', featured: true },
  { id: 'motion', name: 'Motion for React', category: 'Frontend', status: 'used', note: 'Used for the portfolio’s scroll-linked and interface motion.', logo: 'motion', featured: true },
  { id: 'react-router', name: 'React Router', category: 'Frontend', status: 'used', note: 'Client-side routing for portfolio pages.', logo: 'react-router', featured: true },
  { id: 'flutter', name: 'Flutter', category: 'Mobile', status: 'used', note: 'Frontend design work for ScentryX and the DomiNotes Flutter Web app.', logo: 'flutter', featured: true },
  { id: 'react-native', name: 'React Native', category: 'Mobile', status: 'used', note: 'Mobile interface framework used in the grAIn app repository.', logo: 'react-native' },
  { id: 'node', name: 'Node.js', category: 'Backend & Data', status: 'used', note: 'Runtime used by the grAIn admin application.', logo: 'node' },
  { id: 'express', name: 'Express.js', category: 'Backend & Data', status: 'studied', note: 'A technology I am learning; it is not attributed to my ScentryX frontend contribution.', logo: 'express', todo: 'Confirm direct hands-on experience before describing it as used.' },
  { id: 'mongodb', name: 'MongoDB', category: 'Backend & Data', status: 'used', note: 'Database models and Mongoose integration are present in the grAIn admin repository.', logo: 'mongodb' },
  { id: 'firebase', name: 'Firebase Cloud Messaging', category: 'Backend & Data', status: 'studied', note: 'Listed in existing project context; hands-on contribution is not verified.', logo: 'firebase', todo: 'Confirm direct hands-on experience before marking as used.' },
  { id: 'dart', name: 'Dart', category: 'Programming', status: 'used', note: 'Used with Flutter in DomiNotes and the ScentryX frontend context.', logo: 'dart' },
  { id: 'hive', name: 'Hive', category: 'Backend & Data', status: 'used', note: 'DomiNotes README and dependency manifest identify Hive local storage.', logo: 'hive' },
  { id: 'netlify', name: 'Netlify', category: 'Cloud & Tools', status: 'studied', note: 'DomiNotes README and deployment configuration document Netlify as a supported host; a live deployment is not verified.', logo: 'netlify' },
  { id: 'esp32-cpp', name: 'ESP32 / C++', category: 'Programming', status: 'exploring', note: 'Planned embedded technology for the grAIn capstone; implementation is not present in the reviewed repositories.', logo: 'esp32', featured: true },
  { id: 'android-java', name: 'Android Java', category: 'Mobile', status: 'exploring', note: 'Android Java is a planned capstone technology; the linked mobile repository currently uses Expo and React Native.', logo: 'android' },
  { id: 'android-studio', name: 'Android Studio', category: 'Mobile', status: 'studied', note: 'Listed in the existing technology inventory.', logo: 'androidstudio', todo: 'Confirm experience level before describing it as used.' },
  { id: 'expo', name: 'Expo', category: 'Mobile', status: 'used', note: 'The grAIn mobile repository uses Expo with React Native.', logo: 'expo' },
  { id: 'python', name: 'Python', category: 'Programming', status: 'used', note: 'Used by the grAIn ML service and its training scripts.', logo: 'python' },
  { id: 'html', name: 'HTML', category: 'Frontend', status: 'studied', note: 'Experience level to confirm.', logo: 'html', todo: 'Confirm study or project use.' },
  { id: 'javascript', name: 'JavaScript', category: 'Programming', status: 'studied', note: 'Experience level to confirm.', logo: 'javascript', todo: 'Confirm study or project use.' },
  { id: 'c', name: 'C', category: 'Programming', status: 'studied', note: 'Experience level to confirm.', logo: 'c', todo: 'Confirm study or project use.' },
  { id: 'oracle-sql', name: 'Oracle SQL', category: 'Backend & Data', status: 'studied', note: 'Experience level to confirm.', logo: 'oracle', todo: 'Confirm study or project use.' },
  { id: 'linux', name: 'Linux', category: 'Cloud & Tools', status: 'studied', note: 'Experience level to confirm.', logo: 'linux', todo: 'Confirm study or project use.' },
  { id: 'postman', name: 'Postman', category: 'Cloud & Tools', status: 'studied', note: 'Experience level to confirm.', logo: 'postman', todo: 'Confirm study or project use.' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', status: 'studied', note: 'Experience level to confirm.', logo: 'nextjs', todo: 'Confirm study or project use; not listed as used.' },
  { id: 'aws', name: 'AWS', category: 'Cloud & Tools', status: 'studied', note: 'Experience level to confirm.', logo: 'aws', todo: 'Confirm study or project use; not listed as used.' },
  { id: 'render', name: 'Render', category: 'Cloud & Tools', status: 'studied', note: 'No deployment configuration is present in this repository.', logo: 'render', todo: 'Confirm use before marking as used.' },
  { id: 'git', name: 'Git', category: 'Cloud & Tools', status: 'studied', note: 'Repository history is not available in this workspace.', logo: 'git', todo: 'Confirm use before marking as used.' },
  { id: 'github', name: 'GitHub', category: 'Cloud & Tools', status: 'studied', note: 'Project repository links are listed on the project detail pages.', logo: 'github', todo: 'Confirm use before marking as used.' },
  { id: 'vscode', name: 'VS Code', category: 'Cloud & Tools', status: 'studied', note: 'Editor use to confirm.', logo: 'vscode', todo: 'Confirm direct use.' },
]

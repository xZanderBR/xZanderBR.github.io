export type Link = { label: string; href: string };
// One line of the git-log experience list, newest first.
export type Role = { title: string; org: string; dates: string; summary: string };
// `dir` is the folder name the side-projects listing shows.
export type OtherProject = {
  title: string;
  dir: string;
  summary: string;
  stack: string[];
  href: string;
};
export type Profile = {
  name: string;
  jobTitle: string;
  // The current employer, for search engines' Person data.
  employer: string;
  school: string;
  // The neofetch card on the home page.
  education: string;
  stackSummary: string;
  shipped: string[];
  hero: string;
  context: string;
  email: string;
  socials: Link[];
  resumeHref: string;
  sourceHref: string;
  experience: Role[];
  about: string;
  otherProjects: OtherProject[];
};

export const profile: Profile = {
  name: 'Zander Barajas',
  jobTitle: 'Software Engineer',
  employer: 'Envision Engineering',
  school: 'San Diego State University',
  education: 'B.S. Computer Science, SDSU',
  stackSummary: 'Rust, C++, TypeScript, Python',
  shipped: ['Aztec List', 'Pourtocol', 'Rivals Toolkit'],
  hero: 'From bytes to browsers: Rust desktop tools, full-stack apps and practical AI.',
  context: 'Software engineer at Envision Engineering. SDSU computer science, 2026. San Diego.',
  // Zander: add your contact address here.
  email: 'zanderbr@protonmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/xZanderBR' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/xzanderbr' },
  ],
  resumeHref: '/resume.pdf',
  sourceHref: 'https://github.com/xZanderBR/xZanderBR.github.io',
  experience: [
    {
      title: 'Founder & Software Engineer',
      org: 'Independent software business',
      dates: 'Jul 2026 – now',
      summary: 'Builds and runs commercial Windows software with 2,500+ paying customers.',
    },
    {
      title: 'Software Engineer',
      org: 'Envision Engineering',
      dates: 'Jun 2026 – now',
      summary: "Building Struc-AI with the firm's licensed engineers.",
    },
    {
      title: 'Software Engineering Intern',
      org: 'Envision Engineering',
      dates: 'Summers 2024 & 2025',
      summary:
        'Cut weekly reporting from 1-2 hours to under 15 minutes; automated CAD cleanup, cutting it 70% across 25+ projects.',
    },
  ],
  about:
    "Off the keyboard I train in powerlifting, surf when there's swell, and love going to music festivals.",
  otherProjects: [
    {
      title: 'Drone 2D obstacle avoidance',
      dir: 'drone-obstacle-avoidance',
      summary: 'PPO agent trained in a custom Gymnasium environment',
      stack: ['Python', 'SB3', 'PyTorch'],
      href: 'https://github.com/xZanderBR/Drone2D-Avoidance',
    },
    {
      title: 'Powerlifting meet calculator',
      dir: 'powerlifting-calculator',
      summary: 'Cross-platform C++ app, multithreaded sort 750% faster',
      stack: ['C++', 'Vulkan', 'ImGui'],
      href: 'https://github.com/xZanderBR/Powerlifting-Meet-Calculator',
    },
    {
      title: 'Financial transaction classification',
      dir: 'transaction-classifier',
      summary: 'Owned the neural network model on a 5-person ML project',
      stack: ['Python', 'scikit-learn'],
      href: 'https://github.com/darielgu/financial-classification',
    },
  ],
};

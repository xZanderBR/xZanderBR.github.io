export type Link = { label: string; href: string };
export type Role = { title: string; dates: string; summary: string };
export type Job = { org: string; place: string; roles: Role[] };
export type OtherProject = { title: string; summary: string; stack: string[]; href: string };
export type Profile = {
  name: string;
  hero: string;
  context: string;
  email: string;
  socials: Link[];
  resumeHref: string;
  sourceHref: string;
  experience: Job[];
  about: string;
  otherProjects: OtherProject[];
};

export const profile: Profile = {
  name: 'Zander Barajas',
  hero: 'I build software people use, from Rust desktop tools to full-stack web apps.',
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
      org: 'Envision Engineering',
      place: 'San Diego',
      roles: [
        {
          title: 'Software engineer',
          dates: 'Jun 2026 to present',
          summary:
            "Building Struc-AI with the firm's licensed engineers: a design-review checker for structural drawing sets, plus LLM reading of plans, soils reports and plan-check letters.",
        },
        {
          title: 'Software engineering intern',
          dates: 'Summers 2024 and 2025',
          summary:
            'Shipped a full-stack reporting dashboard that cut weekly reporting from 1 to 2 hours to under 15 minutes, and automated CAD cleanup in Python, cutting it by 70% across 25+ projects.',
        },
      ],
    },
    {
      org: 'Independent software business',
      place: 'San Diego',
      roles: [
        {
          title: 'Founder and software engineer',
          dates: 'Jul 2026 to present',
          summary:
            'I build and run commercial Windows software with 2,500+ paying customers, on a licensing platform I designed.',
        },
      ],
    },
  ],
  about:
    'Outside of code I compete in powerlifting, surf when the swell is worth it, and always have music on.',
  otherProjects: [
    {
      title: 'Drone 2D obstacle avoidance',
      summary: 'Trained a PPO agent in a custom Gymnasium environment',
      stack: ['Python', 'Stable-Baselines3', 'PyTorch'],
      href: 'https://github.com/xZanderBR/Drone2D-Avoidance',
    },
    {
      title: 'Powerlifting meet calculator',
      summary: 'Cross-platform C++ app with a multithreaded sort, 750% faster on large datasets',
      stack: ['C++', 'Vulkan', 'ImGui'],
      href: 'https://github.com/xZanderBR/Powerlifting-Meet-Calculator',
    },
    {
      title: 'Financial transaction classification',
      summary: 'Owned the neural network model on a 5-person ML project',
      stack: ['Python', 'scikit-learn'],
      href: 'https://github.com/darielgu/financial-classification',
    },
  ],
};

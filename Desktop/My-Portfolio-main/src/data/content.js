export const person = {
  name: 'Taha Naqvi',
  fullName: 'Syed Taha Ali Naqvi',
  location: 'Karachi, Pakistan',
  coordinates: '24.86° N, 67.01° E',
  timeZone: 'Asia/Karachi',
  resume: '/Resume1.pdf',
  github: 'https://github.com/tahanaqvi14',
}

export const roles = ['Software Engineer', 'Full Stack Developer', 'Web Application Engineer']

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#docmind' },
  { label: 'Journey', href: '#journey' },
  { label: 'Contact', href: '#contact' },
]

export const socials = [
  { label: 'LinkedIn', handle: 'syedtahaalinaqvi', href: 'https://www.linkedin.com/in/syedtahaalinaqvi' },
  { label: 'GitHub', handle: 'tahanaqvi14', href: 'https://github.com/tahanaqvi14' },
  { label: 'HackerRank', handle: 'syedtahaali2015', href: 'https://www.hackerrank.com/profile/syedtahaali2015' },
]

export const aboutStatement =
  "I help businesses and individuals bring their ideas to life through modern, high-performing websites and custom software. Whether it's a sleek front-end interface, a powerful back-end system, or managing databases — I handle it all."

export const facts = [
  { label: 'Name', value: 'Syed Taha Ali Naqvi' },
  { label: 'Based in', value: 'Karachi, Pakistan' },
  { label: 'Studying', value: 'B.E. Computer & Information Systems — NED University, 2023–2027' },
  { label: 'Currently', value: 'Part-time at ACE Systems' },
  { label: 'Focus', value: 'Full-stack apps, AI products & real-time systems' },
  { label: 'Home stack', value: 'MERN — MongoDB, Express, React, Node' },
]

export const tags = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Redux',
  'Node.js',
  'Express',
  'GraphQL',
  'MongoDB',
  'SQL',
  'Socket.io',
  'Tailwind',
  'GSAP',
  'Python',
  'Git',
  'Linux',
  'Figma',
]

export const mern = [
  { letter: 'M', name: 'MongoDB', color: '#4faa41' },
  { letter: 'E', name: 'Express.js', color: '#d4d4d4' },
  { letter: 'R', name: 'React.js', color: '#61dafb' },
  { letter: 'N', name: 'Node.js', color: '#83cd29' },
]

export const projects = [
  {
    id: 'docmind',
    title: 'DocMind AI',
    tagline: 'Chat with your documents — grounded answers, verified citations',
    date: 'April 2025',
    status: { label: 'Development completed', tone: 'done' },
    description:
      'DocMind AI is a full-stack, multi-tenant RAG (Retrieval-Augmented Generation) SaaS platform where users upload their own documents and get an instant AI chatbot that answers questions grounded strictly in that content. It combines vector search, streaming LLM inference, and real database-level security to deliver a 3-in-1 experience: document intelligence, verifiable citations, and test-mode subscription billing.',
    features: [
      'Grounded RAG chat with verifiable citations',
      'Multi-tenant document workspace with row-level security',
      'Real-time streaming AI responses',
      'Drag-and-drop upload with live processing status',
      'Usage analytics dashboard',
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Groq'],
    links: {
      code: 'https://github.com/tahanaqvi14/DocMind-AI',
      demo: 'https://docmindai-mauve.vercel.app/',
    },
    accent: '#93c2f7',
  },
  {
    id: 'codearena',
    title: 'CodeArena',
    tagline: 'A real-time platform for competitive programming & coding battles',
    date: 'Dec 2025',
    status: { label: 'Near completion', tone: 'progress' },
    description:
      'CodeArena is a real-time competitive coding platform where users are matched based on rank for head-to-head coding battles. Players compete in 10-minute matches, solve rank-based questions, earn points for correct answers, and view live leaderboards, match history, and detailed scoreboards — all powered by the MERN stack, GraphQL, and WebSockets.',
    features: [
      'Real-time player matchmaking based on user rank',
      'Live score updates using WebSockets',
      'Match history with individual match scores',
      'Post-match scoreboard with detailed results',
      'Low-latency gameplay built on MERN with GraphQL',
    ],
    stack: ['React', 'Node.js', 'GraphQL', 'WebSockets'],
    links: {
      code: 'https://github.com/tahanaqvi14/bugwar-updated/tree/main',
      demo: 'https://competitivecodingarena.onrender.com',
    },
    accent: '#7ee2a8',
  },
  {
    id: 'anchor',
    title: 'Anchor',
    tagline: 'AI negotiation simulator',
    date: 'Sep 2026',
    status: { label: 'Development completed', tone: 'done' },
    description:
      'Anchor is a full-stack web application for rehearsing high-stakes negotiations — a salary, a freelance rate, a vendor renewal — against an AI opponent that genuinely pushes back. Users pick a scenario, choose one of four opponents with distinct tactics, and negotiate by text or voice. Language models concede too easily by default, so the opponent’s position is clamped in application code against a hidden limit it is never told: it proposes a number, and the ledger decides whether it is allowed. When the session ends, Google’s Gemini writes a feedback report that quotes the user’s own messages back to them, with every citation verified against the transcript before it is shown.',
    features: [
      'AI opponents that push back',
      'Four distinct personas',
      'Cited feedback reports',
      'Voice input & output',
      'Progress dashboard',
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Gemini AI'],
    links: {
      code: 'https://github.com/tahanaqvi14/anchor',
      demo: 'https://anchor-chi-ten.vercel.app/',
    },
    accent: '#d9a8ff',
  },
]

export const journey = [
  {
    period: 'Apr 2025 — Present',
    org: 'ACE Systems',
    role: 'Part-time',
    points: [
      'Designed and built the company website to showcase services, packages and customer information.',
      'Configure routers and manage OLT / ONU settings, applying routing, switching, IP addressing and troubleshooting fundamentals.',
    ],
  },
  {
    period: 'Client project',
    org: 'Al-Hamd Granite & Marble',
    role: 'Web developer',
    points: [
      'Developed a responsive marble & granite business website with product and service sections.',
      'Built an interactive visualizer for previewing stone designs, with WhatsApp customer inquiries.',
    ],
  },
  {
    period: '2023 — 2027',
    org: 'NED University of Engineering & Technology',
    role: 'B.E. Computer & Information Systems',
    points: ['Currently pursuing a Bachelor of Engineering in Computer and Information Systems.'],
  },
]

export const achievements = [
  { title: '3rd Position', detail: 'Qubit coding competition' },
  { title: 'Intermediate Python', detail: 'DataCamp' },
  { title: 'JavaScript for Beginners', detail: 'Udemy' },
]

export const emailjsConfig = {
  serviceId: 'service_d6930zf',
  templateId: 'template_nkwoxd6',
  publicKey: 'B65b85THPngFCeqOn',
}

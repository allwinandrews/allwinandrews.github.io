/**
 * All site content lives here. Every claim must match
 * the profile notes kept outside this repo. Do not add numbers,
 * users or tools that are not in that file.
 */

export type StepKind = 'code' | 'model' | 'human'
export type Step = { kind: StepKind; label: string }

export type Project = {
  slug: string
  title: string
  tagline: string
  context: string // where and when
  role: string
  status: string
  stack: string[]
  steps?: Step[]
  points: string[]
  images?: { src: string; alt: string }[]
  video?: { src: string; poster: string; caption: string }
  links?: { label: string; href: string }[]
  exhibit?: 'stitch' | 'pose' | 'montecarlo'
  tier: 'featured' | 'exhibit' | 'more'
}

export const profile = {
  name: 'Allwin James Andrews',
  title: 'AI and full-stack engineer',
  location: 'Redhill, Surrey, UK',
  email: 'allwinjamesandrews@gmail.com',
  github: 'https://github.com/allwinandrews',
  linkedin: 'https://www.linkedin.com/in/allwinjandrews/',
  whatsapp: 'https://wa.me/447407488379',
  summary:
    'I build production AI systems end to end. Python on the backend (Django, FastAPI), React and TypeScript on the frontend, six years in production and about two of them in applied GenAI.',
  availability: 'Open to remote or hybrid roles across the UK. Right to work in the UK, no sponsorship needed.',
}

export const projects: Project[] = [
  {
    slug: 'aibb',
    title: 'AI Basket Builder',
    tagline: 'A retail agent where code decides what to recommend and the LLM only writes the sentence.',
    context: 'Strivonex, March 2026 to present',
    role: 'Founding developer',
    status: 'Pilot customers on a free trial',
    stack: ['Python', 'React', 'TypeScript', 'LLM', 'base44', 'Upload-Post API'],
    steps: [
      { kind: 'code', label: 'Intent scoring' },
      { kind: 'code', label: 'Dietary and allergen filter' },
      { kind: 'code', label: 'Product ranking' },
      { kind: 'model', label: 'LLM phrasing and tone' },
    ],
    points: [
      'Conversational agent that builds a shopping basket from natural language, for small retailers.',
      'Hybrid design: deterministic scoring and ranking drive every recommendation. The LLM handles wording, so it cannot invent a product or ignore an allergy.',
      'Built the dietary and allergen filtering and the upsell suggestion logic.',
      'Built an AI image studio that improves product photos without changing the product, and multi-platform social posting through the Upload-Post API.',
      'CRM integration work: custom endpoints, slug-domain routing, service-role writes and a token staleness fix.',
      'Proposed the free trial for pilot customers to get real feedback early. I work directly with the founder and the sales team.',
    ],
    tier: 'featured',
  },
  {
    slug: 'auron',
    title: 'Auron',
    tagline: 'A real-time meeting assistant: live transcription in, LLM insights out, while the meeting is still running.',
    context: 'Lyra Solutions, February to December 2025',
    role: 'Independent AI consultant, then co-founder and founding engineer',
    status: 'Built and deployed on AWS at Lyra Solutions',
    stack: ['React', 'Django ASGI', 'Django Channels', 'WebSockets', 'Deepgram', 'OpenAI', 'Celery', 'Redis', 'AWS'],
    steps: [
      { kind: 'code', label: 'Browser audio over WebSocket' },
      { kind: 'model', label: 'Deepgram live transcription' },
      { kind: 'code', label: 'Celery and Redis queue' },
      { kind: 'model', label: 'OpenAI insights' },
      { kind: 'code', label: 'Push to the React UI' },
    ],
    points: [
      'Led the full-stack build of a browser-based assistant that transcribes a meeting live and surfaces insights during it.',
      'Django on ASGI with Channels holds the WebSocket connections. Deepgram handles streaming speech to text.',
      'Background work runs on Celery with Redis, so the live transcript is not held up.',
      'Deployed on AWS.',
    ],
    tier: 'featured',
  },
  {
    slug: 'alynd',
    title: 'Alynd',
    tagline: 'A career management platform with a voice assistant that turns spoken work updates into structured history.',
    context: 'Lyra Solutions, 2025',
    role: 'Co-founder and founding engineer',
    status: 'Product built at Lyra Solutions',
    stack: ['React', 'TypeScript', 'Django', 'FastAPI'],
    steps: [
      { kind: 'human', label: 'Spoken work update' },
      { kind: 'model', label: 'Speech to text' },
      { kind: 'model', label: 'LLM structures the entry' },
      { kind: 'code', label: 'Work history record' },
      { kind: 'code', label: 'CV creator and job spec matcher' },
    ],
    points: [
      'Led the full-stack AI work on an all-in-one career management platform.',
      'Lyra, the voice-input assistant, structures what a user says about their work into portfolio-ready entries.',
      'Work history manager with timeline and table views, a CV creator with templates, and a job spec matcher.',
    ],
    images: [
      { src: 'media/alynd-1.jpg', alt: 'Alynd work history manager, timeline view' },
      { src: 'media/alynd-2.jpg', alt: 'Alynd work history manager, table view' },
      { src: 'media/alynd-3.jpg', alt: 'Alynd CV creator with templates' },
    ],
    tier: 'featured',
  },
  {
    slug: 'aiseries',
    title: 'aiseries',
    tagline: 'A production pipeline for AI-generated short-form series, with human approval before every costly step.',
    context: 'Personal project, 2026',
    role: 'Sole developer',
    status: 'Working pipeline, public repo',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Gemini', 'Veo'],
    steps: [
      { kind: 'code', label: 'Locked anchors (characters, style)' },
      { kind: 'code', label: 'Prompt composition' },
      { kind: 'human', label: 'Approval gate' },
      { kind: 'model', label: 'Gemini and Veo generation' },
      { kind: 'human', label: 'Review' },
    ],
    points: [
      'Takes a series from storyboard to video to lip-synced Malayalam dialogue.',
      'Prompts are composed deterministically from locked anchors, so characters and style stay consistent across shots.',
      'Human approval gates sit before each expensive generation step, which keeps cost under control.',
      'My most recent TypeScript work: Next.js, Prisma and PostgreSQL throughout.',
    ],
    video: {
      src: 'media/aiseries-reel.mp4',
      poster: 'media/aiseries-reel.jpg',
      caption: 'Sample output. Every frame is AI-generated with Gemini and Veo.',
    },
    links: [{ label: 'Code on GitHub', href: 'https://github.com/allwinandrews/aiseries' }],
    tier: 'featured',
  },
  {
    slug: 'fitness-ai',
    title: 'fitness-ai',
    tagline: 'Real-time workout form correction that runs entirely on the phone. No video leaves the device.',
    context: 'Side project, 2026',
    role: 'Sole developer',
    status: 'Working PWA. Squat and sit-up rules implemented',
    stack: ['React', 'TypeScript', 'Vite PWA', 'MediaPipe (WASM)', 'IndexedDB', 'Django', 'DRF'],
    steps: [
      { kind: 'model', label: 'MediaPipe pose, on device' },
      { kind: 'code', label: 'Joint-angle maths' },
      { kind: 'code', label: 'Rep state machine' },
      { kind: 'code', label: 'Feedback message library' },
      { kind: 'model', label: 'LLM session summary' },
    ],
    points: [
      'Pose detection runs client-side in WebAssembly. There is no network call inside the per-frame loop.',
      'A pure rule engine turns joint angles into rep counts and form events, so it can be unit tested without a camera.',
      'Feedback is spoken and shown on screen, debounced so it does not nag.',
      'Sessions are logged to IndexedDB and synced to a Django API when the phone is online.',
      'The 3D skeleton on this page is MediaPipe output from the demo clip, with the knee angle computed live in your browser.',
    ],
    video: {
      src: 'media/fitness-squat.mp4',
      poster: 'media/fitness-squat.jpg',
      caption: 'The app counting reps and judging squat depth.',
    },
    exhibit: 'pose',
    tier: 'exhibit',
  },
  {
    slug: 'trading-bot',
    title: 'Trading bot',
    tagline: 'A backtester with a risk layer and a Monte Carlo stress test, built to find out how bad a year could get.',
    context: 'Personal project, 2026',
    role: 'Sole developer',
    status: 'Paper trading only. Not validated live, and no claims about returns',
    stack: ['Python', 'pandas', 'NumPy', 'Pytest', 'Streamlit', 'IBKR API', 'Gemini'],
    steps: [
      { kind: 'code', label: 'Signals and regime filter' },
      { kind: 'code', label: 'Risk layer (stops, sizing, loss breaker)' },
      { kind: 'code', label: 'IBKR paper execution' },
      { kind: 'model', label: 'Gemini trade journal' },
    ],
    points: [
      'Single-ticker and portfolio backtesters with a shared cash pool and real commission schedules.',
      'Risk layer with stop losses, position sizing and a daily loss breaker.',
      'Block-bootstrap Monte Carlo: resamples the backtest in month-long blocks so losing streaks stay clustered.',
      'The LLM never places a trade. It only writes the journal entry explaining what the rules did.',
      'The chart on this page is generated by the same code. It is a best case by construction: it only resamples history the backtest already saw.',
    ],
    links: [{ label: 'Code on GitHub', href: 'https://github.com/allwinandrews/trading-bot' }],
    exhibit: 'montecarlo',
    tier: 'exhibit',
  },
  {
    slug: 'kadha',
    title: 'Kadha stitch pipeline',
    tagline: 'A Python pipeline that turns artwork into machine-ready embroidery files, with automated stitch checks.',
    context: 'Personal brand, 2026',
    role: 'Sole developer and designer',
    status: 'Brand is pre-launch',
    stack: ['Python', 'OpenCV', 'scikit-image', 'Ink/Stitch', 'pyembroidery'],
    steps: [
      { kind: 'code', label: 'Image preparation' },
      { kind: 'code', label: 'Stitch generation' },
      { kind: 'code', label: 'PES and DST export' },
      { kind: 'code', label: 'Automated stitch checks' },
    ],
    points: [
      'Turns finished artwork into stitch-ready PES and DST files for an embroidery machine.',
      'Automated checks catch stitch problems before a file goes anywhere near fabric.',
      'The animation at the top of this site is one of those files, drawn stitch by stitch in the order the machine would sew it.',
    ],
    images: [
      { src: 'media/kadha-adam.jpg', alt: 'Kadha Creation of Adam patch design' },
      { src: 'media/kadha-wolf.jpg', alt: 'Kadha wolf patch design' },
      { src: 'media/kadha-jatayu.jpg', alt: 'Kadha Jatayu patch design' },
    ],
    links: [{ label: 'Code on GitHub', href: 'https://github.com/allwinandrews/kadha' }],
    exhibit: 'stitch',
    tier: 'exhibit',
  },
  {
    slug: 'matchfound',
    title: 'MatchFound',
    tagline: 'An AI recruitment platform: CV parsing, embeddings and explainable job matching.',
    context: 'Own product, June 2025 to present',
    role: 'Owner and lead developer',
    status: 'Built and tested, no users yet. B2B rebuild in progress',
    stack: ['Django', 'DRF', 'Next.js', 'PostgreSQL (AWS RDS)', 'Gemini', 'Stripe'],
    steps: [
      { kind: 'model', label: 'Gemini CV parsing' },
      { kind: 'model', label: 'Embeddings' },
      { kind: 'code', label: 'Cosine similarity' },
      { kind: 'code', label: 'Must-have checks' },
      { kind: 'code', label: 'Ranked matches' },
    ],
    points: [
      'Gemini parses CVs and produces embeddings. Matching itself is plain cosine similarity plus must-have checks, so a score can always be explained.',
      'Django and DRF backend, Next.js frontend, PostgreSQL on AWS RDS, Stripe for payments.',
      'A B2B rebuild is in progress, including a move to pgvector.',
    ],
    tier: 'more',
  },
  {
    slug: 'leadcapture',
    title: 'LeadCapture.io',
    tagline: 'A multi-step lead form platform, inherited with over 2,000 live customers and no documentation.',
    context: 'Labglo Technologies, 2018 to 2023',
    role: 'Lead developer',
    status: 'In production with paying customers during my time on it',
    stack: ['React', 'TypeScript', 'Redux', 'Django', 'AWS'],
    points: [
      'The team inherited the product after the client lost contact with the previous developer. Early changes broke other parts.',
      'We responded by logging every change, writing the missing documentation and building a staging server with a copy of real data.',
      'Release routine: database backup, release, check every form still works and leads still arrive, roll back to the previous merge if not.',
      'Built the React and TypeScript dashboard with Redux and the third-party integrations.',
    ],
    tier: 'more',
  },
  {
    slug: 'stylehr',
    title: 'StyleHR',
    tagline: 'Attendance and payroll SaaS for a multi-location retailer. The product I owned longest.',
    context: 'Labglo Technologies, 2018 to 2023',
    role: 'Lead developer, later solution architect',
    status: 'Delivered to the client',
    stack: ['Django', 'DRF', 'PostgreSQL', 'Celery', 'React', 'eSSL integration'],
    points: [
      'Met the client myself to understand how their stores ran, then decided the solution.',
      'Integrated eSSL attendance devices across locations and built the payroll pipeline on Celery.',
      'Multi-tenant PostgreSQL design.',
      'Mentored junior developers on backend work, Git and Agile practice.',
    ],
    tier: 'more',
  },
]

export const moreWork: { title: string; text: string; stack: string; href?: string }[] = [
  {
    title: 'LiveKit voice agent',
    text: 'Speech to text, LLM and text to speech in one pipeline, with a state machine controlling the conversation flow.',
    stack: 'Python, LiveKit Agents, React, TypeScript',
    href: 'https://github.com/allwinandrews/livekit-python-voice-agent',
  },
  {
    title: 'ScoreTurf',
    text: 'Football analytics: YOLOv8 player detection and ByteTrack tracking behind a Django API and a React front end.',
    stack: 'YOLOv8, ByteTrack, Django, React, TypeScript',
  },
  {
    title: 'AI social content engine',
    text: 'Agent workflows triggered by CRM events that generate and schedule social posts. Built on contract at IT Talent Hub.',
    stack: 'n8n, Predis.ai, OpenAI, Claude',
  },
  {
    title: 'SignalnShadow',
    text: 'A scripted pipeline that assembles 30-second short-form videos from generated clips, narration and captions.',
    stack: 'Python, Claude, Higgsfield, Edge-TTS',
  },
  {
    title: 'Project4 Multi-Channel',
    text: 'E-commerce listing and inventory sync across Amazon, eBay and Walmart.',
    stack: 'React, Redux, Django',
  },
  {
    title: 'Project4 bidding automation',
    text: 'An automated bidding system so an online seller could take part in auctions without sitting at the screen.',
    stack: 'React, Django, Python',
  },
]

export const experience = [
  {
    role: 'Founding Developer',
    org: 'Strivonex',
    when: 'Mar 2026 to present',
    where: 'Remote',
    text: 'Building AI Basket Builder, a conversational retail agent with a hybrid rules and LLM design, plus CRM integration work.',
  },
  {
    role: 'AI Integration Specialist (contract)',
    org: 'IT Talent Hub',
    when: 'Jan to Mar 2026',
    where: 'Ilford',
    text: 'n8n and Predis.ai content pipelines, agent workflows triggered by CRM events, prompt templates for OpenAI and Claude.',
  },
  {
    role: 'Co-Founder and Founding Engineer',
    org: 'Lyra Solutions',
    when: 'Feb to Dec 2025',
    where: 'UK',
    text: 'Led full-stack AI work on Auron and Alynd. Started as an independent AI consultant, became co-founder in May 2025.',
  },
  {
    role: 'Software Engineer to Solution Architect',
    org: 'Labglo Technologies',
    when: 'Dec 2018 to Aug 2023',
    where: 'Trivandrum, India',
    text: 'Led StyleHR and LeadCapture.io. Multi-tenant PostgreSQL, Celery pipelines, mentoring junior developers.',
  },
]

export const education = ['MSc Data Science, University of East London', 'BSc Computer Science, University of Calicut']

export const stackGroups: [string, string][] = [
  ['AI', 'OpenAI, Anthropic Claude, Google Gemini, Deepgram, RAG, embeddings, agent workflows'],
  ['Backend', 'Python, Django, FastAPI, Django Channels, WebSockets, Celery, Redis, Node.js'],
  ['Frontend', 'React, Next.js, TypeScript, Tailwind, Redux, Zustand'],
  ['Data', 'PostgreSQL, MongoDB, MySQL, Redis'],
  ['Infra and testing', 'Docker, AWS, CI/CD, Pytest, Jest, Cypress, Playwright, n8n'],
]

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug)

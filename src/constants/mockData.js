export const INITIAL_ACCOUNTS = [
  {
    id: 'acc_1',
    email: 'alex.harrison.dev@gmail.com',
    status: 'connected',
    isPrimary: true,
    lastSync: '2026-07-14T22:15:00Z',
    connectionType: 'Gmail OAuth'
  },
  {
    id: 'acc_2',
    email: 'harrison.consulting@gmail.com',
    status: 'connected',
    isPrimary: false,
    lastSync: '2026-07-14T20:30:00Z',
    connectionType: 'Gmail OAuth'
  },
  {
    id: 'acc_3',
    email: 'alex.harrison.work@gmail.com',
    status: 'expired',
    isPrimary: false,
    lastSync: '2026-07-10T14:22:00Z',
    connectionType: 'Gmail OAuth'
  }
];

export const INITIAL_TEMPLATES = [
  {
    id: 'tpl_1',
    name: 'Frontend Engineer Application',
    category: 'Job Application',
    subject: 'Application for Frontend Engineer Role - {{candidate_name}}',
    body: `Hi {{company_name}} Team,

I hope this email finds you well.

My name is {{candidate_name}}, and I'm writing to express my strong interest in the Frontend Engineer position at {{company_name}}. With over 4 years of experience building performant, pixel-perfect web applications using React, Tailwind CSS, and Redux, I am confident in my ability to contribute value to your team immediately.

I have attached my resume for your review, and I would love to schedule a brief call to discuss how my skill set aligns with {{company_name}}'s goals.

Thank you for your time and consideration.

Best regards,
{{candidate_name}}
Software Engineer
{{today_date}}`,
    attachments: [
      { name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }
    ],
    isFavorite: true,
    lastUpdated: '2026-07-14T18:45:00Z'
  },
  {
    id: 'tpl_2',
    name: 'Application Follow-up (1 Week)',
    category: 'Follow-up',
    subject: 'Follow-up: Frontend Engineer application - {{candidate_name}}',
    body: `Hi {{company_name}} Team,

I hope you're having a great week.

I'm checking in on the status of my application for the Frontend Engineer position, which I submitted last week. I remain highly enthusiastic about the opportunity to join {{company_name}} and would love to hear if there are any next steps in the interview process.

Please let me know if you need any additional information or portfolio samples from my end.

Best regards,
{{candidate_name}}`,
    attachments: [],
    isFavorite: false,
    lastUpdated: '2026-07-12T10:15:00Z'
  },
  {
    id: 'tpl_3',
    name: 'Cold Outreach - Networking',
    category: 'Networking',
    subject: 'Chatting about Engineering opportunities at {{company_name}}?',
    body: `Hi team at {{company_name}},

I've been following {{company_name}}'s growth, especially your recent work in the developer tools space, and I am incredibly impressed.

My name is {{candidate_name}}, a Frontend Developer specializing in React and dashboard UX. I noticed your team is expanding, and I wanted to reach out to see if you have any engineering openings coming up. 

I'd appreciate 10 minutes of your time to chat about how my experience matches what you look for in engineering hires.

Thanks,
{{candidate_name}}`,
    attachments: [],
    isFavorite: true,
    lastUpdated: '2026-07-08T15:30:00Z'
  },
  {
    id: 'tpl_4',
    name: 'Interview Thank You Note',
    category: 'Thank You',
    subject: 'Thank you - {{candidate_name}} / {{company_name}} Interview',
    body: `Hi team,

Thank you so much for taking the time to speak with me today about the Frontend Engineer role at {{company_name}}. I thoroughly enjoyed learning more about your tech stack, team culture, and the exciting roadmap for this quarter.

Our conversation reinforced my interest in joining the team. I look forward to hearing about the next steps.

Best regards,
{{candidate_name}}`,
    attachments: [],
    isFavorite: false,
    lastUpdated: '2026-07-14T14:20:00Z'
  }
];

export const INITIAL_EMAILS = [
  {
    id: 'eml_1',
    to: 'hiring@vercel.com',
    candidateName: 'Alex Harrison',
    companyName: 'Vercel',
    jobTitle: 'Frontend Engineer',
    subject: 'Application for Frontend Engineer Role - Alex Harrison',
    body: 'Hi Vercel Team, My name is Alex...',
    sentAt: '2026-07-14T21:40:00Z',
    status: 'sent',
    fromAccount: 'alex.harrison.dev@gmail.com',
    attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
    openRate: 1, // opened
    clickRate: 1, // clicked link
  },
  {
    id: 'eml_2',
    to: 'jobs@stripe.com',
    candidateName: 'Alex Harrison',
    companyName: 'Stripe',
    jobTitle: 'Senior UI Developer',
    subject: 'Application for Frontend Engineer Role - Alex Harrison',
    body: 'Hi Stripe Team, My name is Alex...',
    sentAt: '2026-07-14T19:15:00Z',
    status: 'sent',
    fromAccount: 'alex.harrison.dev@gmail.com',
    attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
    openRate: 1,
    clickRate: 0,
  },
  {
    id: 'eml_3',
    to: 'careers@notion.so',
    candidateName: 'Alex Harrison',
    companyName: 'Notion',
    jobTitle: 'Product Engineer',
    subject: 'Application for Frontend Engineer Role - Alex Harrison',
    body: 'Hi Notion Team, My name is Alex...',
    sentAt: '2026-07-13T15:20:00Z',
    status: 'sent',
    fromAccount: 'alex.harrison.dev@gmail.com',
    attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
    openRate: 0,
    clickRate: 0,
  },
  {
    id: 'eml_4',
    to: 'contact@linear.app',
    candidateName: 'Alex Harrison',
    companyName: 'Linear',
    jobTitle: 'Design Engineer',
    subject: 'Application for Frontend Engineer Role - Alex Harrison',
    body: 'Hi Linear Team, My name is Alex...',
    sentAt: '2026-07-12T11:05:00Z',
    status: 'failed',
    errorReason: 'Mailbox full or invalid address',
    fromAccount: 'alex.harrison.work@gmail.com',
    attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
    openRate: 0,
    clickRate: 0,
  },
  {
    id: 'eml_5',
    to: 'recruiting@resend.com',
    candidateName: 'Alex Harrison',
    companyName: 'Resend',
    jobTitle: 'React Developer',
    subject: 'Application for Frontend Engineer Role - Alex Harrison',
    body: 'Hi Resend Team, My name is Alex...',
    sentAt: '2026-07-11T09:30:00Z',
    status: 'sent',
    fromAccount: 'alex.harrison.dev@gmail.com',
    attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
    openRate: 1,
    clickRate: 1,
  }
];

export const INITIAL_SCHEDULED = [
  {
    id: 'sch_1',
    to: 'careers@figma.com',
    candidateName: 'Alex Harrison',
    companyName: 'Figma',
    jobTitle: 'Frontend Lead',
    subject: 'Application for Frontend Engineer Role - Alex Harrison',
    body: 'Hi Figma Team, My name is Alex...',
    scheduledAt: '2026-07-15T09:00:00Z',
    status: 'pending',
    fromAccount: 'alex.harrison.dev@gmail.com',
    attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
    timezone: 'America/New_York'
  },
  {
    id: 'sch_2',
    to: 'hr@airbnb.com',
    candidateName: 'Alex Harrison',
    companyName: 'Airbnb',
    jobTitle: 'Staff Engineer UI',
    subject: 'Application for Frontend Engineer Role - Alex Harrison',
    body: 'Hi Airbnb Team, My name is Alex...',
    scheduledAt: '2026-07-16T14:30:00Z',
    status: 'pending',
    fromAccount: 'alex.harrison.dev@gmail.com',
    attachments: [{ name: 'Alex_Harrison_Resume.pdf', size: '245 KB' }],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'sch_3',
    to: 'talent@uber.com',
    candidateName: 'Alex Harrison',
    companyName: 'Uber',
    jobTitle: 'Frontend Specialist',
    subject: 'Chatting about Engineering opportunities at Uber?',
    body: 'Hi team at Uber, My name is Alex...',
    scheduledAt: '2026-07-17T11:00:00Z',
    status: 'paused',
    fromAccount: 'harrison.consulting@gmail.com',
    attachments: [],
    timezone: 'Europe/London'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'ntf_1',
    type: 'success',
    title: 'Email Sent Successfully',
    message: 'Your job application to Stripe was successfully delivered.',
    timestamp: '2026-07-14T19:15:00Z',
    isRead: false
  },
  {
    id: 'ntf_2',
    type: 'danger',
    title: 'Email Delivery Failed',
    message: 'Failed to deliver application to Linear (hiring@linear.app). Address not found.',
    timestamp: '2026-07-12T11:05:00Z',
    isRead: false
  },
  {
    id: 'ntf_3',
    type: 'warning',
    title: 'Gmail Account Expired',
    message: 'OAuth Token expired for alex.harrison.work@gmail.com. Please reconnect.',
    timestamp: '2026-07-10T14:22:00Z',
    isRead: true
  },
  {
    id: 'ntf_4',
    type: 'info',
    title: 'Upcoming bulk schedule reminder',
    message: 'You have a bulk run scheduled in 10 hours for 25 candidates.',
    timestamp: '2026-07-14T21:00:00Z',
    isRead: false
  }
];

export const DAILY_EMAIL_STATS = [
  { date: 'Jul 08', sent: 12, opened: 9, clicked: 4, failed: 1 },
  { date: 'Jul 09', sent: 18, opened: 14, clicked: 8, failed: 0 },
  { date: 'Jul 10', sent: 8, opened: 7, clicked: 3, failed: 1 },
  { date: 'Jul 11', sent: 15, opened: 12, clicked: 6, failed: 0 },
  { date: 'Jul 12', sent: 22, opened: 16, clicked: 9, failed: 2 },
  { date: 'Jul 13', sent: 25, opened: 19, clicked: 11, failed: 0 },
  { date: 'Jul 14', sent: 32, opened: 26, clicked: 15, failed: 1 }
];

export const WEEKLY_ACTIVITY = [
  { week: 'Wk 24', JobApplications: 24, FollowUps: 10, Networking: 5 },
  { week: 'Wk 25', JobApplications: 32, FollowUps: 15, Networking: 12 },
  { week: 'Wk 26', JobApplications: 45, FollowUps: 22, Networking: 18 },
  { week: 'Wk 27', JobApplications: 58, FollowUps: 31, Networking: 25 }
];

export const CATEGORY_DISTRIBUTION = [
  { name: 'Job Application', value: 65, color: '#4F46E5' },
  { name: 'Follow-ups', value: 20, color: '#06B6D4' },
  { name: 'Networking', value: 10, color: '#F59E0B' },
  { name: 'Thank You', value: 5, color: '#22C55E' }
];

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney'
];

export const LANGUAGES = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de-DE' }
];

/**
 * Demo dataset for the North Star frontend.
 *
 * One coherent family story so every screen reinforces the same narrative:
 * Margaret is three weeks out from a hip replacement, her family is
 * coordinating around her recovery, and the AI has been reading her NHS
 * paperwork. Nothing here talks to a network — see `src/data/index.ts` for the
 * accessor layer the backend swaps out.
 */

import type {
  Appointment,
  CareDocument,
  CarePerson,
  CareReceiver,
  CareTask,
  ChatMessage,
  EmergencyContact,
  FamilyUpdate,
  HealthMetric,
  Insight,
  Medication,
  MedicationDose,
  Reminder,
  TimelineEvent,
} from "./types";

/* -------------------------------------------------------------------------- */
/* People                                                                      */
/* -------------------------------------------------------------------------- */

export const careReceiver: CareReceiver = {
  id: "person-margaret",
  fullName: "Margaret Okafor",
  initials: "MO",
  relationship: "Mum",
  role: "care-receiver",
  avatarUrl: null,
  accent: "gold",
  age: 78,
  situation: "Three weeks into recovery from a hip replacement",
  conditions: ["Type 2 diabetes", "High blood pressure", "Osteoarthritis"],
  allergies: ["Penicillin"],
  bloodType: "O+",
  nhsNumber: "485 777 3456",
};

export const caregivers: CarePerson[] = [
  {
    id: "person-amara",
    fullName: "Amara Okafor",
    initials: "AO",
    relationship: "Daughter",
    role: "owner",
    avatarUrl: null,
    accent: "clay",
  },
  {
    id: "person-david",
    fullName: "David Okafor",
    initials: "DO",
    relationship: "Son",
    role: "caregiver",
    avatarUrl: null,
    accent: "sage",
  },
  {
    id: "person-ruth",
    fullName: "Ruth Bennett",
    initials: "RB",
    relationship: "Sister",
    role: "viewer",
    avatarUrl: null,
    accent: "plum",
  },
];

/** The signed-in caregiver for this demo. */
export const currentUser = caregivers[0];

export const allPeople: CarePerson[] = [...caregivers, careReceiver];

export function findPerson(id: string | null): CarePerson | null {
  if (id === null) return null;
  return allPeople.find((person) => person.id === id) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Medications                                                                 */
/* -------------------------------------------------------------------------- */

export const medications: Medication[] = [
  {
    id: "med-metformin",
    name: "Metformin",
    dosage: "500mg",
    instruction: "With breakfast and dinner",
    timings: ["morning", "evening"],
    purpose: "Keeps blood sugar steady",
    prescribedBy: "Dr. Priya Raman",
    startedAt: "2019-03-12",
    changedNote: null,
    refillsRemaining: 2,
    daysSupplyLeft: 24,
  },
  {
    id: "med-ramipril",
    name: "Ramipril",
    dosage: "5mg",
    instruction: "Once in the morning",
    timings: ["morning"],
    purpose: "Lowers blood pressure",
    prescribedBy: "Dr. Priya Raman",
    startedAt: "2021-08-02",
    changedNote: "Dose increased from 2.5mg on 10 July",
    refillsRemaining: 1,
    daysSupplyLeft: 9,
  },
  {
    id: "med-atorvastatin",
    name: "Atorvastatin",
    dosage: "20mg",
    instruction: "At bedtime",
    timings: ["night"],
    purpose: "Manages cholesterol",
    prescribedBy: "Dr. Priya Raman",
    startedAt: "2020-11-19",
    changedNote: null,
    refillsRemaining: 3,
    daysSupplyLeft: 41,
  },
  {
    id: "med-alendronic",
    name: "Alendronic acid",
    dosage: "70mg",
    instruction: "Sunday mornings, sitting upright for 30 minutes after",
    timings: ["morning"],
    purpose: "Strengthens bone after the hip operation",
    prescribedBy: "Mr. Stephen Cole",
    startedAt: "2026-07-06",
    changedNote: "Started after discharge",
    refillsRemaining: 2,
    daysSupplyLeft: 33,
  },
  {
    id: "med-paracetamol",
    name: "Paracetamol",
    dosage: "500mg",
    instruction: "Up to twice a day if the hip aches",
    timings: ["as-needed"],
    purpose: "Pain relief",
    prescribedBy: "Mr. Stephen Cole",
    startedAt: "2026-07-04",
    changedNote: null,
    refillsRemaining: 4,
    daysSupplyLeft: 60,
  },
];

export const todaysDoses: MedicationDose[] = [
  {
    id: "dose-1",
    medicationId: "med-metformin",
    medicationName: "Metformin",
    dosage: "500mg",
    timing: "morning",
    scheduledFor: "8:00am",
    status: "taken",
    takenAt: "8:12am",
  },
  {
    id: "dose-2",
    medicationId: "med-ramipril",
    medicationName: "Ramipril",
    dosage: "5mg",
    timing: "morning",
    scheduledFor: "8:00am",
    status: "taken",
    takenAt: "8:12am",
  },
  {
    id: "dose-3",
    medicationId: "med-paracetamol",
    medicationName: "Paracetamol",
    dosage: "500mg",
    timing: "midday",
    scheduledFor: "1:00pm",
    status: "due",
    takenAt: null,
  },
  {
    id: "dose-4",
    medicationId: "med-metformin",
    medicationName: "Metformin",
    dosage: "500mg",
    timing: "evening",
    scheduledFor: "6:30pm",
    status: "upcoming",
    takenAt: null,
  },
  {
    id: "dose-5",
    medicationId: "med-atorvastatin",
    medicationName: "Atorvastatin",
    dosage: "20mg",
    timing: "night",
    scheduledFor: "9:30pm",
    status: "upcoming",
    takenAt: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Tasks                                                                       */
/* -------------------------------------------------------------------------- */

export const careTasks: CareTask[] = [
  {
    id: "task-1",
    title: "Book the 6-week orthopaedic follow-up",
    detail: "The discharge letter asks for this to be booked before 14 August.",
    status: "todo",
    priority: "high",
    category: "appointment",
    assigneeId: "person-amara",
    dueLabel: "Due today",
    generatedByAi: true,
    sourceDocumentId: "doc-discharge",
    completedAt: null,
  },
  {
    id: "task-2",
    title: "Order a Ramipril repeat prescription",
    detail: "Nine days of supply left.",
    status: "todo",
    priority: "high",
    category: "medication",
    assigneeId: "person-david",
    dueLabel: "Due today",
    generatedByAi: true,
    sourceDocumentId: null,
    completedAt: null,
  },
  {
    id: "task-3",
    title: "Physio exercises — morning set",
    detail: "Ten minutes, seated. Sheet is in the documents tab.",
    status: "in-progress",
    priority: "medium",
    category: "daily-living",
    assigneeId: "person-margaret",
    dueLabel: "Today",
    generatedByAi: true,
    sourceDocumentId: "doc-physio",
    completedAt: null,
  },
  {
    id: "task-4",
    title: "Arrange transport for Thursday's physio",
    detail: "Margaret can't manage the bus yet.",
    status: "todo",
    priority: "medium",
    category: "appointment",
    assigneeId: "person-david",
    dueLabel: "Tomorrow",
    generatedByAi: false,
    sourceDocumentId: null,
    completedAt: null,
  },
  {
    id: "task-5",
    title: "Fit the bathroom grab rail",
    detail: "Occupational therapy recommended one by the bath.",
    status: "in-progress",
    priority: "medium",
    category: "daily-living",
    assigneeId: "person-david",
    dueLabel: "This week",
    generatedByAi: true,
    sourceDocumentId: "doc-discharge",
    completedAt: null,
  },
  {
    id: "task-6",
    title: "Log blood pressure readings",
    detail: "Dr. Raman wants a week of morning readings before the review.",
    status: "todo",
    priority: "low",
    category: "wellbeing",
    assigneeId: "person-amara",
    dueLabel: "This week",
    generatedByAi: false,
    sourceDocumentId: null,
    completedAt: null,
  },
  {
    id: "task-7",
    title: "Send Ruth the recovery update",
    detail: null,
    status: "done",
    priority: "low",
    category: "admin",
    assigneeId: "person-amara",
    dueLabel: "Yesterday",
    generatedByAi: false,
    sourceDocumentId: null,
    completedAt: "24 Jul",
  },
  {
    id: "task-8",
    title: "Collect the walking frame from the clinic",
    detail: null,
    status: "done",
    priority: "medium",
    category: "daily-living",
    assigneeId: "person-david",
    dueLabel: "22 Jul",
    generatedByAi: false,
    sourceDocumentId: null,
    completedAt: "22 Jul",
  },
];

/* -------------------------------------------------------------------------- */
/* Appointments & reminders                                                    */
/* -------------------------------------------------------------------------- */

export const appointments: Appointment[] = [
  {
    id: "appt-physio",
    title: "Physiotherapy — session 4",
    clinician: "Nadia Hassan, Physiotherapist",
    location: "Rowan Community Clinic, Room 2",
    startsAt: "2026-07-30T10:30:00Z",
    dateLabel: "Thu 30 Jul",
    timeLabel: "10:30am",
    escortId: "person-david",
    notes: "Bring the walking frame and the exercise sheet.",
    transport: "David driving",
  },
  {
    id: "appt-diabetes",
    title: "Diabetes review",
    clinician: "Dr. Priya Raman, GP",
    location: "Elmwood Surgery",
    startsAt: "2026-08-06T09:15:00Z",
    dateLabel: "Thu 6 Aug",
    timeLabel: "9:15am",
    escortId: "person-amara",
    notes: "Bring a week of morning blood pressure readings.",
    transport: null,
  },
  {
    id: "appt-ortho",
    title: "Orthopaedic follow-up — 6 weeks",
    clinician: "Mr. Stephen Cole, Consultant",
    location: "Royal Free Hospital, Outpatients",
    startsAt: "2026-08-13T14:00:00Z",
    dateLabel: "Thu 13 Aug",
    timeLabel: "2:00pm",
    escortId: null,
    notes: "Needs booking — see today's priorities.",
    transport: null,
  },
];

export const reminders: Reminder[] = [
  {
    id: "rem-1",
    title: "Morning medication",
    kind: "medication",
    timeLabel: "8:00am",
    repeatLabel: "Every day",
    enabled: true,
    lastConfirmed: "Today, 8:12am",
  },
  {
    id: "rem-2",
    title: "Evening medication",
    kind: "medication",
    timeLabel: "6:30pm",
    repeatLabel: "Every day",
    enabled: true,
    lastConfirmed: "Yesterday, 7:41pm",
  },
  {
    id: "rem-3",
    title: "Physio exercises",
    kind: "movement",
    timeLabel: "11:00am",
    repeatLabel: "Weekdays",
    enabled: true,
    lastConfirmed: "Today, 11:05am",
  },
  {
    id: "rem-4",
    title: "Drink a glass of water",
    kind: "hydration",
    timeLabel: "Every 3 hours",
    repeatLabel: "Every day",
    enabled: true,
    lastConfirmed: "Today, 12:00pm",
  },
  {
    id: "rem-5",
    title: "Physio appointment",
    kind: "appointment",
    timeLabel: "9:30am",
    repeatLabel: "Thu 30 Jul",
    enabled: true,
    lastConfirmed: null,
  },
  {
    id: "rem-6",
    title: "Call Ruth",
    kind: "custom",
    timeLabel: "4:00pm",
    repeatLabel: "Sundays",
    enabled: false,
    lastConfirmed: "20 Jul, 4:10pm",
  },
];

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

export const timelineEvents: TimelineEvent[] = [
  {
    id: "tl-1",
    kind: "document",
    title: "Blood test results added",
    summary:
      "HbA1c came back at 51 mmol/mol — down from 58 in April. Kidney function normal.",
    occurredAt: "2026-07-24T16:20:00Z",
    dateLabel: "24 July",
    actorId: null,
    sourceDocumentId: "doc-bloods",
    significant: true,
  },
  {
    id: "tl-2",
    kind: "note",
    title: "Margaret walked to the front gate",
    summary: "First time without the frame. Tired afterwards but no pain.",
    occurredAt: "2026-07-22T11:00:00Z",
    dateLabel: "22 July",
    actorId: "person-david",
    sourceDocumentId: null,
    significant: false,
  },
  {
    id: "tl-3",
    kind: "appointment",
    title: "Physiotherapy — session 3",
    summary: "Nadia increased the standing exercises. Range of movement improving.",
    occurredAt: "2026-07-16T10:30:00Z",
    dateLabel: "16 July",
    actorId: "person-david",
    sourceDocumentId: null,
    significant: false,
  },
  {
    id: "tl-4",
    kind: "medication-change",
    title: "Ramipril increased to 5mg",
    summary:
      "Dr. Raman doubled the dose after two high readings. Blood pressure has settled since.",
    occurredAt: "2026-07-10T09:00:00Z",
    dateLabel: "10 July",
    actorId: null,
    sourceDocumentId: "doc-prescription",
    significant: true,
  },
  {
    id: "tl-5",
    kind: "milestone",
    title: "Margaret came home",
    summary: "Discharged after four nights. Alendronic acid and a walking frame added.",
    occurredAt: "2026-07-06T15:30:00Z",
    dateLabel: "6 July",
    actorId: "person-amara",
    sourceDocumentId: "doc-discharge",
    significant: true,
  },
  {
    id: "tl-6",
    kind: "hospital",
    title: "Right hip replacement",
    summary: "Surgery went well. Mr. Cole reported no complications.",
    occurredAt: "2026-07-02T08:00:00Z",
    dateLabel: "2 July",
    actorId: "person-amara",
    sourceDocumentId: null,
    significant: true,
  },
  {
    id: "tl-7",
    kind: "appointment",
    title: "Pre-operative assessment",
    summary: "Bloods, ECG and anaesthetic review all clear.",
    occurredAt: "2026-06-18T13:00:00Z",
    dateLabel: "18 June",
    actorId: "person-amara",
    sourceDocumentId: null,
    significant: false,
  },
];

/* -------------------------------------------------------------------------- */
/* Documents                                                                   */
/* -------------------------------------------------------------------------- */

export const careDocuments: CareDocument[] = [
  {
    id: "doc-bloods",
    title: "Blood test results — July",
    kind: "test-results",
    status: "ready",
    source: "NHS — Elmwood Surgery",
    uploadedAt: "2026-07-24T16:18:00Z",
    dateLabel: "24 July",
    fileName: "bloods-24-07.pdf",
    fileSizeLabel: "184 KB",
    pageCount: 2,
    aiSummary:
      "Margaret's blood sugar control has improved since April — HbA1c is down from 58 to 51 mmol/mol, which is inside the target range. Kidney and liver function are both normal. Nothing here needs urgent action, but Dr. Raman will want to see these at the diabetes review.",
    extractedFacts: [
      { label: "HbA1c", value: "51 mmol/mol" },
      { label: "Previous", value: "58 mmol/mol" },
      { label: "Kidney function", value: "Normal" },
      { label: "Taken", value: "22 July 2026" },
    ],
    generatedTaskIds: [],
    progress: 100,
  },
  {
    id: "doc-physio",
    title: "Physiotherapy exercise plan",
    kind: "care-plan",
    status: "ready",
    source: "Rowan Community Clinic",
    uploadedAt: "2026-07-16T12:04:00Z",
    dateLabel: "16 July",
    fileName: "physio-plan-wk3.pdf",
    fileSizeLabel: "512 KB",
    pageCount: 3,
    aiSummary:
      "A daily set of six exercises for weeks three to six after the hip replacement. Ten minutes each morning, seated for the first four, standing with support for the last two. Nadia asks that Margaret stops if she feels sharp pain rather than pushing through it.",
    extractedFacts: [
      { label: "Frequency", value: "Daily, mornings" },
      { label: "Duration", value: "10 minutes" },
      { label: "Exercises", value: "6" },
      { label: "Review", value: "30 July" },
    ],
    generatedTaskIds: ["task-3"],
    progress: 100,
  },
  {
    id: "doc-prescription",
    title: "Repeat prescription — updated",
    kind: "prescription",
    status: "ready",
    source: "NHS — Elmwood Surgery",
    uploadedAt: "2026-07-10T09:32:00Z",
    dateLabel: "10 July",
    fileName: "prescription-jul.pdf",
    fileSizeLabel: "96 KB",
    pageCount: 1,
    aiSummary:
      "Ramipril has been increased from 2.5mg to 5mg once daily. Everything else on the repeat list is unchanged. The higher dose started on 10 July.",
    extractedFacts: [
      { label: "Changed", value: "Ramipril 2.5mg → 5mg" },
      { label: "Unchanged", value: "4 medicines" },
      { label: "Effective", value: "10 July 2026" },
    ],
    generatedTaskIds: [],
    progress: 100,
  },
  {
    id: "doc-discharge",
    title: "Hospital discharge summary",
    kind: "discharge-summary",
    status: "ready",
    source: "NHS — Royal Free Hospital",
    uploadedAt: "2026-07-06T17:45:00Z",
    dateLabel: "6 July",
    fileName: "discharge-summary.pdf",
    fileSizeLabel: "1.2 MB",
    pageCount: 6,
    aiSummary:
      "Margaret had a right total hip replacement on 2 July and went home on 6 July after an uncomplicated stay. She was sent home with a walking frame, a new bone-strengthening medicine, and paracetamol for pain. Two things need booking: a six-week orthopaedic follow-up before 14 August, and a grab rail by the bath that occupational therapy recommended.",
    extractedFacts: [
      { label: "Procedure", value: "Right total hip replacement" },
      { label: "Admitted", value: "2 July 2026" },
      { label: "Discharged", value: "6 July 2026" },
      { label: "Consultant", value: "Mr. Stephen Cole" },
      { label: "New medicine", value: "Alendronic acid 70mg" },
      { label: "Follow-up", value: "By 14 August" },
    ],
    generatedTaskIds: ["task-1", "task-5"],
    progress: 100,
  },
];

/* -------------------------------------------------------------------------- */
/* AI assistant                                                                */
/* -------------------------------------------------------------------------- */

export const assistantGreeting: ChatMessage = {
  id: "chat-greeting",
  author: "assistant",
  body: "Good morning, Amara. Margaret had a settled night and took her morning medicines on time.\n\nTwo things are worth your attention today: the six-week orthopaedic follow-up still needs booking, and her Ramipril is down to nine days. Ask me anything about her care — I've read everything in her records.",
  timeLabel: "8:30am",
  citations: [],
  actions: [],
};

export const assistantSuggestions: string[] = [
  "What changed after Mum's discharge?",
  "Explain her latest blood test simply",
  "What should I ask at the physio review?",
  "Summarise this week for Ruth",
];

/** A scripted exchange used to show the assistant's reasoning and provenance. */
export const assistantConversation: ChatMessage[] = [
  assistantGreeting,
  {
    id: "chat-1",
    author: "user",
    body: "Explain her latest blood test simply",
    timeLabel: "8:34am",
    citations: [],
    actions: [],
  },
  {
    id: "chat-2",
    author: "assistant",
    body: "The headline is good news: Margaret's average blood sugar over the last three months has come down.\n\nHer HbA1c is 51 mmol/mol, down from 58 in April. Anything under 53 is generally where her GP wants her, so she's moved from just outside the target range to inside it. Her kidney and liver results were both normal, which matters because two of her medicines are processed by the kidneys.\n\nNothing here needs action today. Dr. Raman will go through these at the diabetes review on 6 August.",
    timeLabel: "8:34am",
    citations: [
      { label: "Blood test results — July", documentId: "doc-bloods" },
      { label: "Diabetes review, 6 Aug", documentId: null },
    ],
    actions: [
      { id: "act-1", label: "Add to Ruth's weekly update", kind: "share" },
      { id: "act-2", label: "Open the full results", kind: "open-document" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Insights & health signals                                                   */
/* -------------------------------------------------------------------------- */

export const insights: Insight[] = [
  {
    id: "insight-1",
    title: "Medication routine is holding",
    body: "Margaret has taken 27 of her last 28 morning doses. The one miss was the evening Metformin on 19 July.",
    tone: "positive",
    metric: "96%",
    metricLabel: "on time, 14 days",
    href: "/care",
  },
  {
    id: "insight-2",
    title: "Ramipril is running low",
    body: "Nine days of supply left. Repeat prescriptions at Elmwood usually take three working days.",
    tone: "attention",
    metric: "9",
    metricLabel: "days left",
    href: "/care",
  },
  {
    id: "insight-3",
    title: "Blood pressure has settled",
    body: "Since the Ramipril increase on 10 July, morning readings have averaged 128/78 — down from 146/88.",
    tone: "positive",
    metric: "128/78",
    metricLabel: "14-day average",
    href: "/insights",
  },
  {
    id: "insight-4",
    title: "Mobility is improving week on week",
    body: "David logged Margaret walking to the front gate without the frame on 22 July — a first since the operation.",
    tone: "neutral",
    metric: null,
    metricLabel: null,
    href: "/timeline",
  },
];

export const healthMetrics: HealthMetric[] = [
  {
    id: "metric-bp",
    label: "Blood pressure",
    value: "128/78",
    unit: null,
    tone: "positive",
    trend: "down",
    trendLabel: "Down from 146/88",
    series: [0.92, 0.88, 0.83, 0.79, 0.7, 0.64, 0.58, 0.55, 0.52, 0.5],
  },
  {
    id: "metric-hba1c",
    label: "Blood sugar (HbA1c)",
    value: "51",
    unit: "mmol/mol",
    tone: "positive",
    trend: "down",
    trendLabel: "In target range",
    series: [0.85, 0.82, 0.8, 0.74, 0.7, 0.66, 0.6, 0.55, 0.5, 0.46],
  },
  {
    id: "metric-mobility",
    label: "Daily movement",
    value: "18",
    unit: "min",
    tone: "neutral",
    trend: "up",
    trendLabel: "Up 6 min this week",
    series: [0.2, 0.24, 0.3, 0.28, 0.38, 0.44, 0.5, 0.55, 0.62, 0.7],
  },
  {
    id: "metric-sleep",
    label: "Rest",
    value: "7.2",
    unit: "hrs",
    tone: "neutral",
    trend: "steady",
    trendLabel: "Steady this fortnight",
    series: [0.6, 0.64, 0.58, 0.62, 0.66, 0.6, 0.63, 0.65, 0.61, 0.64],
  },
];

/* -------------------------------------------------------------------------- */
/* Family                                                                      */
/* -------------------------------------------------------------------------- */

export const familyUpdates: FamilyUpdate[] = [
  {
    id: "update-1",
    authorId: "person-david",
    body: "Mum walked to the front gate today without the frame. She was pleased with herself.",
    timeLabel: "22 Jul, 4:12pm",
    acknowledgedBy: ["person-amara", "person-ruth"],
  },
  {
    id: "update-2",
    authorId: "person-amara",
    body: "Blood tests came back and her sugar levels have improved since April. Nothing to worry about.",
    timeLabel: "24 Jul, 6:30pm",
    acknowledgedBy: ["person-ruth"],
  },
  {
    id: "update-3",
    authorId: "person-ruth",
    body: "Lovely to hear. I'll ring her on Sunday afternoon as usual.",
    timeLabel: "24 Jul, 8:05pm",
    acknowledgedBy: ["person-amara"],
  },
];

export const emergencyContacts: EmergencyContact[] = [
  {
    id: "ec-1",
    name: "Amara Okafor",
    relationship: "Daughter",
    phone: "07700 900 118",
    primary: true,
  },
  {
    id: "ec-2",
    name: "David Okafor",
    relationship: "Son",
    phone: "07700 900 241",
    primary: false,
  },
  {
    id: "ec-3",
    name: "Elmwood Surgery",
    relationship: "GP practice",
    phone: "020 7946 0330",
    primary: false,
  },
  {
    id: "ec-4",
    name: "NHS 111",
    relationship: "Non-emergency advice",
    phone: "111",
    primary: false,
  },
];

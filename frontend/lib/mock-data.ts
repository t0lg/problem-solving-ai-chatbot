import type { Problem, AnalysisResult, TimelineEvent } from "@/types/problem";
import type { Methodology } from "@/types/methodology";
import type { Incident, SimilarIncident, LessonLearned } from "@/types/incident";

// ── Recent Incidents ────────────────────────────────────────────────────
export const mockIncidents: Incident[] = [
  {
    id: "INC-2024-001",
    title: "Conveyor Belt Motor Overheating",
    description: "Production line 3 conveyor belt motor temperature exceeded threshold by 15°C during peak operation.",
    category: "mechanical",
    severity: "high",
    status: "investigating",
    reportedAt: "2024-12-15T08:30:00Z",
    location: "Plant A - Line 3",
    assignee: "J. Martinez",
  },
  {
    id: "INC-2024-002",
    title: "Pressure Valve PSV-104 Leaking",
    description: "Slow leak detected at pressure safety valve PSV-104 in reactor vessel 2.",
    category: "process",
    severity: "critical",
    status: "open",
    reportedAt: "2024-12-14T14:15:00Z",
    location: "Plant B - Reactor 2",
  },
  {
    id: "INC-2024-003",
    title: "PLC Communication Timeout",
    description: "Intermittent communication loss between PLC and SCADA system on production line 1.",
    category: "electrical",
    severity: "medium",
    status: "resolved",
    reportedAt: "2024-12-13T11:00:00Z",
    resolvedAt: "2024-12-14T09:30:00Z",
    location: "Plant A - Control Room",
    assignee: "S. Patel",
  },
  {
    id: "INC-2024-004",
    title: "Quality Deviation in Batch #4412",
    description: "Product viscosity measurements outside specification limits for batch #4412.",
    category: "quality",
    severity: "medium",
    status: "investigating",
    reportedAt: "2024-12-12T16:45:00Z",
    location: "Plant A - QC Lab",
    assignee: "L. Chen",
  },
  {
    id: "INC-2024-005",
    title: "Cooling Tower Fan Vibration",
    description: "Abnormal vibration levels detected on cooling tower fan unit CT-02.",
    category: "mechanical",
    severity: "low",
    status: "open",
    reportedAt: "2024-12-11T09:20:00Z",
    location: "Plant B - Utilities",
  },
];

// ── Similar Incidents ───────────────────────────────────────────────────
export const mockSimilarIncidents: SimilarIncident[] = [
  {
    incident: {
      id: "INC-2024-089",
      title: "Motor Bearing Failure on Line 2",
      description: "Similar motor overheating pattern led to bearing failure after 3 weeks of elevated temperatures.",
      category: "mechanical",
      severity: "critical",
      status: "resolved",
      reportedAt: "2024-09-20T10:00:00Z",
      resolvedAt: "2024-09-25T16:00:00Z",
      location: "Plant A - Line 2",
      assignee: "M. Thompson",
    },
    similarityScore: 0.92,
    matchedKeywords: ["motor", "overheating", "conveyor", "temperature"],
  },
  {
    incident: {
      id: "INC-2023-156",
      title: "Drive Motor Thermal Shutdown",
      description: "VFD thermal protection triggered shutdown on packing line motor due to insufficient ventilation.",
      category: "electrical",
      severity: "high",
      status: "resolved",
      reportedAt: "2023-11-05T13:30:00Z",
      resolvedAt: "2023-11-08T11:00:00Z",
      location: "Plant A - Packing",
      assignee: "R. Kim",
    },
    similarityScore: 0.78,
    matchedKeywords: ["motor", "thermal", "shutdown", "temperature"],
  },
  {
    incident: {
      id: "INC-2023-201",
      title: "Pump Motor Overload Trip",
      description: "Circulation pump motor tripped on overload due to impeller fouling and increased current draw.",
      category: "mechanical",
      severity: "medium",
      status: "resolved",
      reportedAt: "2023-08-14T07:45:00Z",
      resolvedAt: "2023-08-15T14:00:00Z",
      location: "Plant B - Utilities",
      assignee: "J. Martinez",
    },
    similarityScore: 0.65,
    matchedKeywords: ["motor", "overload", "overheating"],
  },
];

// ── Lessons Learned ─────────────────────────────────────────────────────
export const mockLessonsLearned: LessonLearned[] = [
  {
    id: "LL-001",
    incidentId: "INC-2024-089",
    title: "Implement predictive motor temperature monitoring",
    description: "Early detection of temperature trends could have prevented bearing failure. Continuous monitoring with automated alerts is critical.",
    actionsTaken: [
      "Installed IoT temperature sensors on all critical motors",
      "Configured automated alerts at 80% threshold",
      "Implemented weekly thermal imaging inspections",
    ],
    preventiveMeasures: [
      "Monthly bearing lubrication schedule",
      "Quarterly vibration analysis program",
      "Annual motor alignment verification",
    ],
    createdAt: "2024-09-26T10:00:00Z",
    tags: ["motor", "predictive-maintenance", "temperature", "IoT"],
  },
  {
    id: "LL-002",
    incidentId: "INC-2023-156",
    title: "Ensure adequate ventilation for VFD-driven motors",
    description: "VFD operation at low speeds reduces cooling fan effectiveness. External forced ventilation required below 30Hz.",
    actionsTaken: [
      "Added external cooling fans to VFD-driven motors",
      "Updated operating procedures for low-speed operations",
    ],
    preventiveMeasures: [
      "Include ventilation assessment in VFD installation checklist",
      "Define minimum speed limits without external cooling",
    ],
    createdAt: "2023-11-10T09:00:00Z",
    tags: ["VFD", "ventilation", "thermal-management"],
  },
];

// ── Methodologies ───────────────────────────────────────────────────────
export const mockMethodologies: Methodology[] = [
  {
    id: "meth-001",
    name: "5 Whys Analysis",
    type: "5_whys",
    description: "Iterative interrogation technique to explore cause-and-effect relationships underlying a problem.",
    steps: [
      { id: "s1", order: 1, title: "Define the Problem", description: "Clearly state the problem to be investigated", isCompleted: false },
      { id: "s2", order: 2, title: "Ask Why #1", description: "Why did this problem occur?", isCompleted: false },
      { id: "s3", order: 3, title: "Ask Why #2", description: "Why did that cause occur?", isCompleted: false },
      { id: "s4", order: 4, title: "Ask Why #3", description: "Why did that cause occur?", isCompleted: false },
      { id: "s5", order: 5, title: "Ask Why #4", description: "Why did that cause occur?", isCompleted: false },
      { id: "s6", order: 6, title: "Ask Why #5", description: "Identify the root cause", isCompleted: false },
    ],
    applicability: ["Simple to moderate problems", "Single cause chain", "Quick analysis needed"],
    icon: "help-circle",
  },
  {
    id: "meth-002",
    name: "Fishbone Diagram",
    type: "fishbone",
    description: "Identify all potential causes of a problem organized by major categories (Man, Machine, Method, Material, Measurement, Environment).",
    steps: [
      { id: "s1", order: 1, title: "State the Effect", description: "Write the problem on the head of the fish", isCompleted: false },
      { id: "s2", order: 2, title: "Identify Categories", description: "Draw major cause category branches", isCompleted: false },
      { id: "s3", order: 3, title: "Brainstorm Causes", description: "List potential causes under each category", isCompleted: false },
      { id: "s4", order: 4, title: "Analyze & Prioritize", description: "Rate causes by likelihood and impact", isCompleted: false },
      { id: "s5", order: 5, title: "Verify Root Cause", description: "Validate top causes with data", isCompleted: false },
    ],
    applicability: ["Complex problems", "Multiple potential causes", "Team brainstorming"],
    icon: "git-branch",
  },
  {
    id: "meth-003",
    name: "FMEA",
    type: "fmea",
    description: "Failure Mode and Effects Analysis – systematic method to evaluate potential failures and their impacts on system performance.",
    steps: [
      { id: "s1", order: 1, title: "Identify Components", description: "List all system components and functions", isCompleted: false },
      { id: "s2", order: 2, title: "Identify Failure Modes", description: "Determine how each component can fail", isCompleted: false },
      { id: "s3", order: 3, title: "Assess Effects", description: "Determine impact of each failure mode", isCompleted: false },
      { id: "s4", order: 4, title: "Calculate RPN", description: "Risk Priority Number = Severity × Occurrence × Detection", isCompleted: false },
      { id: "s5", order: 5, title: "Recommend Actions", description: "Prioritize and assign corrective actions", isCompleted: false },
    ],
    applicability: ["Design review", "Process optimization", "Risk assessment"],
    icon: "shield-alert",
  },
  {
    id: "meth-004",
    name: "8D Report",
    type: "8d",
    description: "Eight Disciplines problem solving methodology for identifying, correcting, and eliminating recurring problems.",
    steps: [
      { id: "s1", order: 1, title: "D1: Form Team", description: "Establish a cross-functional team", isCompleted: false },
      { id: "s2", order: 2, title: "D2: Define Problem", description: "Quantify the problem with data", isCompleted: false },
      { id: "s3", order: 3, title: "D3: Containment", description: "Implement interim containment actions", isCompleted: false },
      { id: "s4", order: 4, title: "D4: Root Cause", description: "Identify and verify root causes", isCompleted: false },
      { id: "s5", order: 5, title: "D5: Corrective Actions", description: "Choose and verify permanent corrective actions", isCompleted: false },
      { id: "s6", order: 6, title: "D6: Implement", description: "Implement and validate corrections", isCompleted: false },
      { id: "s7", order: 7, title: "D7: Prevent Recurrence", description: "Modify systems to prevent recurrence", isCompleted: false },
      { id: "s8", order: 8, title: "D8: Congratulate", description: "Recognize team contributions", isCompleted: false },
    ],
    applicability: ["Customer complaints", "Major quality issues", "Systemic failures"],
    icon: "clipboard-list",
  },
];

// ── Timeline Events ─────────────────────────────────────────────────────
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "evt-001",
    type: "input",
    title: "Problem Submitted",
    description: "Conveyor belt motor on production line 3 is overheating beyond normal operating parameters.",
    timestamp: "2024-12-15T08:30:00Z",
  },
  {
    id: "evt-002",
    type: "analysis",
    title: "AI Analysis Started",
    description: "Analyzing problem context, historical data, and similar incidents across the knowledge base.",
    timestamp: "2024-12-15T08:30:05Z",
  },
  {
    id: "evt-003",
    type: "insight",
    title: "Pattern Detected",
    description: "Found 3 similar incidents in the past 12 months. Motor overheating on conveyor lines correlates with bearing wear and insufficient lubrication schedules.",
    timestamp: "2024-12-15T08:30:12Z",
  },
  {
    id: "evt-004",
    type: "recommendation",
    title: "Methodology Suggested",
    description: "Based on problem complexity, the 5 Whys methodology is recommended as the primary analysis framework with Fishbone as supplementary.",
    timestamp: "2024-12-15T08:30:15Z",
  },
  {
    id: "evt-005",
    type: "resolution",
    title: "Root Cause Identified",
    description: "Root cause: Bearing lubrication interval extended from 30 days to 60 days during cost reduction initiative, leading to accelerated wear and heat generation.",
    timestamp: "2024-12-15T09:15:00Z",
  },
];

// ── Analysis Result ─────────────────────────────────────────────────────
export const mockAnalysisResult: AnalysisResult = {
  id: "analysis-001",
  problemId: "INC-2024-001",
  rootCause: "Insufficient bearing lubrication due to extended maintenance intervals",
  confidence: 0.87,
  findings: [
    {
      id: "f1",
      title: "Lubrication Schedule Changed",
      description: "Maintenance interval was extended from 30 to 60 days as part of Q3 cost reduction.",
      severity: "high",
      evidence: ["Maintenance log entry 2024-09-15", "Cost reduction memo CR-2024-Q3-012"],
    },
    {
      id: "f2",
      title: "Temperature Trend Anomaly",
      description: "Motor operating temperature has been steadily increasing over the past 6 weeks.",
      severity: "medium",
      evidence: ["SCADA temperature logs", "Thermal imaging report TIR-2024-47"],
    },
  ],
  recommendations: [
    "Restore original 30-day lubrication schedule immediately",
    "Install continuous temperature monitoring with automated alerts",
    "Conduct vibration analysis on all line 3 motors",
    "Schedule bearing replacement during next planned shutdown",
  ],
  timeline: mockTimelineEvents,
  createdAt: "2024-12-15T09:30:00Z",
};

// ── Problems ────────────────────────────────────────────────────────────
export const mockProblems: Problem[] = [
  {
    id: "INC-2024-001",
    title: "Conveyor Belt Motor Overheating",
    description: "Production line 3 conveyor belt motor temperature exceeded threshold by 15°C during peak operation.",
    severity: "high",
    status: "in_progress",
    category: "Mechanical",
    createdAt: "2024-12-15T08:30:00Z",
    updatedAt: "2024-12-15T09:30:00Z",
    tags: ["motor", "overheating", "line-3", "conveyor"],
  },
  {
    id: "INC-2024-002",
    title: "Pressure Valve PSV-104 Leaking",
    description: "Slow leak detected at pressure safety valve PSV-104 in reactor vessel 2.",
    severity: "critical",
    status: "analyzing",
    category: "Process",
    createdAt: "2024-12-14T14:15:00Z",
    updatedAt: "2024-12-14T14:15:00Z",
    tags: ["valve", "pressure", "leak", "reactor"],
  },
];

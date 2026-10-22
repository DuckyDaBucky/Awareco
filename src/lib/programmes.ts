import { getMetric, getPersona, getSource, handoff, type Metric, type Persona, type Source } from "./content.ts"

export type EvidenceState = "verified" | "reported" | "derived" | "illustrative" | "awaiting" | "unavailable"
export type EvidenceCoverage = "measured" | "partial" | "narrative"

export type StorySection = {
  heading: string
  paragraphs: string[]
}

export type Milestone = {
  label: string
  detail: string
}

export type ProgrammeEditorial = {
  dek: string
  audience: string
  period: string
  sections: StorySection[]
  shows: string[]
  limitations: string[]
  milestones: Milestone[]
}

export type ProgrammeRecord = {
  person: Persona
  editorial: ProgrammeEditorial
  metrics: Metric[]
  sources: Source[]
  evidenceState: EvidenceState
  coverage: EvidenceCoverage
  approvalLabel: string
  image: string
}

const editorial: Record<string, ProgrammeEditorial> = {
  aleto: {
    dek: "A nine-month mentoring relationship designed to strengthen professional networks, leadership confidence and routes into the workplace.",
    audience: "University students",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "A sustained mentoring relationship",
        paragraphs: [
          "The Aleto leadership programme connects university students with members of the team over nine months. The format is designed around continued contact rather than a single event, giving participants space to discuss confidence, professional networks and the transition from education into work.",
        ],
      },
      {
        heading: "What the report records",
        paragraphs: [
          "The detailed programme section records 14 participants. Survey respondents reported stronger professional networks at 93%, while 90% reported growth across leadership, confidence and presentation skills. A separate highlights section gives a cohort figure of 15; this experience retains the detailed-page count and discloses the difference.",
        ],
      },
      {
        heading: "How to interpret the result",
        paragraphs: [
          "The percentages are participant-reported outcomes. They indicate how respondents described their experience, but they are not employment, placement or promotion rates. Long-term career outcomes would require follow-up evidence that is not present in the loaded report.",
        ],
      },
    ],
    shows: ["A sustained nine-month programme", "A reported cohort and two survey outcomes", "Strong self-reported network and confidence signals"],
    limitations: ["Survey results are self-reported.", "The loaded source does not establish job-placement or long-term career outcomes.", "The report contains a disclosed cohort-count discrepancy."],
    milestones: [
      { label: "Programme", detail: "Nine months of mentoring" },
      { label: "Reported cohort", detail: "14 participants on the detailed programme page" },
      { label: "Follow-up need", detail: "Longitudinal career outcomes are not loaded" },
    ],
  },
  "accelerate-women": {
    dek: "A six-month pilot connecting women mentors at Arm with women mentees at AMF1.",
    audience: "Women in engineering and early-career roles",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "Mentorship across two organizations",
        paragraphs: [
          "Accelerate Women was structured as a six-month pilot linking mentors at Arm with mentees at AMF1. The programme focuses on relationship-building and professional support across two engineering organizations.",
        ],
      },
      {
        heading: "The reported signal",
        paragraphs: [
          "The 2025 report states that 71% of mentors and mentees were highly likely to continue their relationship. That measure indicates appetite for continued contact after the pilot and provides a useful signal about the perceived value of the pairing.",
        ],
      },
      {
        heading: "What remains unknown",
        paragraphs: [
          "Continuation intent is not a promotion, retention or recruitment outcome. A fuller evaluation would add participation counts, completion, role progression and longer-term follow-up while preserving participant privacy.",
        ],
      },
    ],
    shows: ["A defined six-month pilot", "Cross-organization mentoring", "Reported intent to continue mentoring relationships"],
    limitations: ["No cohort size is loaded in the current record.", "Continuation intent is not an employment outcome.", "Long-term progression evidence is unavailable."],
    milestones: [
      { label: "Format", detail: "Six-month pilot" },
      { label: "Reported outcome", detail: "71% highly likely to continue the relationship" },
      { label: "Next evidence", detail: "Participation and progression measures" },
    ],
  },
  "racing-pride": {
    dek: "A partnership focused on LGBTQ+ inclusion, visibility and a more welcoming motorsport community.",
    audience: "Fans, volunteers, marshals and the motorsport community",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "Belonging around the sport",
        paragraphs: [
          "Racing Pride and AMF1 collaborate on inclusion and visibility across campus and trackside activity. The programme story positions belonging as something created through recognition, participation and the signals a sporting organization sends to its community.",
        ],
      },
      {
        heading: "What is documented",
        paragraphs: [
          "The 2025 report describes activities that recognized LGBTQ+ marshals and volunteers and supported a welcoming environment around motorsport events. The current source provides a narrative record of activity rather than a numerical outcome series.",
        ],
      },
      {
        heading: "Evidence still needed",
        paragraphs: [
          "The loaded material does not quantify sustained participation, changes in belonging or long-term community outcomes. Those measures would need a carefully designed, privacy-preserving approach developed with the partner community.",
        ],
      },
    ],
    shows: ["A documented inclusion partnership", "Campus and trackside activity", "Recognition of LGBTQ+ marshals and volunteers"],
    limitations: ["No numerical programme outcome is loaded.", "Activity should not be presented as proof of long-term belonging.", "Any future identity-related measurement needs partner approval and privacy safeguards."],
    milestones: [
      { label: "Partnership", detail: "Inclusion and visibility in motorsport" },
      { label: "Documented activity", detail: "Campus and trackside recognition" },
      { label: "Evidence gap", detail: "No longitudinal participation outcome" },
    ],
  },
  "paddle-uk": {
    dek: "Formula One composite-design knowledge applied to a bespoke para-canoe seating challenge.",
    audience: "Para-athletes and engineering collaborators",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "Engineering beyond the car",
        paragraphs: [
          "AMF1 composite-design expertise supported Paddle UK and Darkside Canoes in developing a bespoke para-canoe seat. The collaboration translates lightweight-material and prototyping knowledge into an accessibility-focused sporting application.",
        ],
      },
      {
        heading: "An iterative development process",
        paragraphs: [
          "The report describes three prototypes developed over nine months, with qualitative improvements in stability and support. The prototype count demonstrates iteration and sustained engineering input rather than a single handoff.",
        ],
      },
      {
        heading: "Where measurement stops",
        paragraphs: [
          "No numerical performance improvement is published in the loaded source. The experience therefore reports the prototype process and qualitative design intent without inventing speed, comfort or competition outcomes.",
        ],
      },
    ],
    shows: ["Cross-sport engineering collaboration", "Three reported prototypes", "Nine months of iterative development"],
    limitations: ["No numerical athlete-performance outcome is published.", "Qualitative stability and support improvements are not converted into an invented score.", "The result describes the prototype process, not general impact across para-sport."],
    milestones: [
      { label: "Collaboration", detail: "AMF1, Paddle UK and Darkside Canoes" },
      { label: "Development", detail: "Three prototypes across nine months" },
      { label: "Evidence gap", detail: "No published numerical performance change" },
    ],
  },
  techvets: {
    dek: "Skills, networks and career support for veterans exploring technology and motorsport pathways.",
    audience: "Veterans moving into technology careers",
    period: "2024 programme reporting",
    sections: [
      {
        heading: "Translating experience",
        paragraphs: [
          "The TechVets partnership supports veterans as they translate service experience into technology and motorsport contexts. The programme narrative emphasizes transferable skills, professional connections and clearer routes into unfamiliar industries.",
        ],
      },
      {
        heading: "A published career story",
        paragraphs: [
          "The 2024 report includes an individual trackside IT career story that illustrates one possible route. It provides human context for the partnership and shows how prior experience can connect to a technology role.",
        ],
      },
      {
        heading: "Avoiding an unsupported generalization",
        paragraphs: [
          "One individual story does not establish a placement rate for the programme. Portfolio reporting should keep the story visible while marking participant counts, completion and employment outcomes as unavailable until they are supported by approved evidence.",
        ],
      },
    ],
    shows: ["A documented veteran-support partnership", "Skills and network support", "One published trackside IT career story"],
    limitations: ["No programme-wide numerical outcome is loaded.", "An individual story cannot establish a placement rate.", "The current evidence comes from the 2024 report rather than the 2025 reporting period."],
    milestones: [
      { label: "Focus", detail: "Technology and motorsport career pathways" },
      { label: "Published evidence", detail: "An individual trackside IT story" },
      { label: "Evidence gap", detail: "Programme-wide reach and placement outcomes" },
    ],
  },
  mechanics: {
    dek: "Hands-on technical learning intended to make vocational routes into motorsport more visible.",
    audience: "Students pursuing practical and vocational engineering routes",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "A practical route",
        paragraphs: [
          "Aspiring Mechanics centers hands-on learning and the vocational routes that can lead toward motorsport. It broadens the programme story beyond university pathways and makes technical progression more tangible for students who learn through practice.",
        ],
      },
      {
        heading: "The story in the report",
        paragraphs: [
          "The 2025 report follows a real student's progression through vocational levels. That narrative provides depth and continuity, showing a route developing over time rather than presenting a one-day interaction as a completed career outcome.",
        ],
      },
      {
        heading: "What cannot be inferred",
        paragraphs: [
          "The individual account is not a cohort result. The current evidence does not establish how many learners participate, what proportion progress, or whether employment outcomes can be attributed to the programme.",
        ],
      },
    ],
    shows: ["A vocational motorsport pathway", "A documented individual progression story", "Hands-on technical learning"],
    limitations: ["No programme-wide numerical outcome is loaded.", "One participant story cannot be generalized to every learner.", "Attribution and employment outcomes are unavailable."],
    milestones: [
      { label: "Route", detail: "Hands-on vocational learning" },
      { label: "Published evidence", detail: "One student's progression through levels" },
      { label: "Evidence gap", detail: "Cohort reach and progression rate" },
    ],
  },
  "make-a-mark-day": {
    dek: "Campus workshops and career exploration connecting students with the people and skills behind Formula One.",
    audience: "School students and community groups",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "Opening the campus",
        paragraphs: [
          "Make A Mark Day brings students into the AMF1 campus for workshops and career exploration. The programme is designed to make a wide range of roles visible and to connect classroom interests with the work behind a race team.",
        ],
      },
      {
        heading: "Reach recorded in 2025",
        paragraphs: [
          "The report records 257 students across two days, representing 14 schools and community groups. These measures establish the scale of the reported activity and the breadth of organizations represented during the event.",
        ],
      },
      {
        heading: "A skills-awareness baseline",
        paragraphs: [
          "A separate initial survey found that 68% of students were unclear about the skills needed for work involving AI. That percentage is best read as a baseline need identified before or at engagement, not as a negative outcome produced by the programme.",
        ],
      },
    ],
    shows: ["257 students reached", "14 schools and community groups represented", "A documented skills-awareness need"],
    limitations: ["Attendance is an activity measure, not a career outcome.", "The loaded data does not provide a comparable post-event AI-skills measure.", "Long-term student progression is unavailable."],
    milestones: [
      { label: "Delivery", detail: "Two campus days" },
      { label: "Reported reach", detail: "257 students from 14 groups" },
      { label: "Next evidence", detail: "Comparable post-event and longitudinal measures" },
    ],
  },
  "aramco-intern": {
    dek: "A summer placement connecting Aramco-sponsored engineering students with applied sustainability work.",
    audience: "Engineering students",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "Learning through live projects",
        paragraphs: [
          "Aramco-sponsored engineering students contributed to sustainability projects during a summer placement. The format combines exposure to a Formula One organization with applied project work and career-readiness activity.",
        ],
      },
      {
        heading: "What participation looked like",
        paragraphs: [
          "The 2025 report describes eight students and notes work that included the circularity metric project alongside career-readiness workshops. This connects the placement to a specific organizational sustainability challenge.",
        ],
      },
      {
        heading: "Separating programme and vehicle evidence",
        paragraphs: [
          "The AMR25 circularity measure belongs to the vehicle methodology and should not be attributed to an individual intern as a personal outcome. The placement can be linked to the project without claiming that eight participants produced the entire reported circularity result.",
        ],
      },
    ],
    shows: ["Eight reported placement participants", "Applied sustainability project exposure", "Career-readiness workshops"],
    limitations: ["Vehicle circularity is not a participant-level outcome.", "No post-placement employment measure is loaded.", "The source does not provide a comparable participant survey series."],
    milestones: [
      { label: "Format", detail: "Summer engineering placement" },
      { label: "Reported cohort", detail: "Eight students" },
      { label: "Project exposure", detail: "Circularity measurement and career readiness" },
    ],
  },
  "stem-racing": {
    dek: "Engineering, teamwork and competition brought together through an international STEM Racing programme.",
    audience: "School students interested in STEM and competition",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "Learning through competition",
        paragraphs: [
          "Unearth Your Greatness uses STEM Racing to connect model-car design, engineering decisions, teamwork and competition. The programme presents technical learning as a collaborative challenge with a visible connection to motorsport.",
        ],
      },
      {
        heading: "International reach",
        paragraphs: [
          "The report describes engagement with more than 600 students representing 35 countries at the World Finals. The interface preserves the report's “more than” qualifier rather than presenting 600 as an exact cap.",
        ],
      },
      {
        heading: "Target is not achievement",
        paragraphs: [
          "The programme also states an ambition to reach more than 100,000 students over three years. That figure is a future target, not completed reach, and is displayed separately from the reported World Finals engagement.",
        ],
      },
    ],
    shows: ["More than 600 students engaged", "35 countries represented", "A separately labelled three-year ambition"],
    limitations: ["Event engagement is not a long-term education outcome.", "The 100,000-student figure is a target, not achieved reach.", "No comparable participant-learning measure is loaded."],
    milestones: [
      { label: "Reported reach", detail: "600+ students" },
      { label: "International scope", detail: "35 countries" },
      { label: "Ambition", detail: "100,000+ students over three years" },
    ],
  },
  afbe: {
    dek: "A transition event connecting engineering students with staff, graduates and interns.",
    audience: "University engineering students",
    period: "2025 programme reporting",
    sections: [
      {
        heading: "Making pathways visible",
        paragraphs: [
          "The AFBE-UK transition event brought students together with people at different stages of engineering careers. Staff, graduates and interns provided multiple reference points for understanding entry routes and workplace experience.",
        ],
      },
      {
        heading: "Participation and feedback",
        paragraphs: [
          "The report records 16 participants and states that 100% of attendees found the event helpful. Together, the figures describe the scale of the event and the feedback reported by those who attended.",
        ],
      },
      {
        heading: "Keeping the claim proportionate",
        paragraphs: [
          "Helpful-event feedback is not a hiring probability or evidence of career progression. A stronger outcome record would follow whether participants gained interviews, placements or sustained professional connections, with appropriate consent and definitions.",
        ],
      },
    ],
    shows: ["16 reported participants", "Positive attendee feedback", "Direct contact with staff, graduates and interns"],
    limitations: ["The feedback measure reflects event attendees.", "Helpfulness is not a recruitment or placement outcome.", "No longitudinal follow-up is loaded."],
    milestones: [
      { label: "Event", detail: "Transition into engineering" },
      { label: "Reported attendance", detail: "16 students" },
      { label: "Reported feedback", detail: "100% found the event helpful" },
    ],
  },
  neurodiversity: {
    dek: "An employee resource group supporting connection, awareness and learning about neurodiversity.",
    audience: "AMF1 colleagues",
    period: "First-year activity reported in 2025",
    sections: [
      {
        heading: "A colleague-led support structure",
        paragraphs: [
          "The neurodiversity employee resource group supports connection, awareness and learning inside the organization. Its role is described at an aggregate level so the programme can be understood without identifying or making assumptions about individual colleagues.",
        ],
      },
      {
        heading: "First-year engagement",
        paragraphs: [
          "The report states that approximately 35 colleagues had engaged with the group in its first year. The approximate qualifier is retained because the published value is not presented as an exact audited headcount.",
        ],
      },
      {
        heading: "Privacy is part of the evidence design",
        paragraphs: [
          "Engagement does not disclose diagnosis, health information or individual membership. Future evaluation should continue to use minimum group sizes and aggregate reporting so that learning and belonging can be assessed without exposing sensitive personal data.",
        ],
      },
    ],
    shows: ["A first-year employee resource group", "Approximately 35 colleagues engaged", "An aggregate, privacy-conscious reporting approach"],
    limitations: ["Engagement is not a measure of individual health or diagnosis.", "No individual-level data should be inferred.", "A longer-term belonging or workplace-outcome measure is unavailable."],
    milestones: [
      { label: "Launch period", detail: "First-year activity" },
      { label: "Reported engagement", detail: "About 35 colleagues" },
      { label: "Safeguard", detail: "Aggregate reporting only" },
    ],
  },
  fundraising: {
    dek: "Fundraising and colleague match funding supporting community charity partners.",
    audience: "Community charity partners and AMF1 colleagues",
    period: "2025 annual reporting",
    sections: [
      {
        heading: "A portfolio of community support",
        paragraphs: [
          "Community fundraising combines colleague activity and match funding across a range of charitable causes. The record is presented as a portfolio total because the current source does not allocate the full amount across individual campaigns in this experience.",
        ],
      },
      {
        heading: "Reported funds raised",
        paragraphs: [
          "The 2025 report records £140,000 raised. This is a historical reported total for the year and is kept separate from any simulated reservation, expression of interest or prototype interaction elsewhere in the site.",
        ],
      },
      {
        heading: "What a stronger record would add",
        paragraphs: [
          "A fuller partner view could show the allocation by charity, match-funding contribution, campaign period and intended use where those details are approved. None of those breakdowns are invented when the source does not provide them.",
        ],
      },
    ],
    shows: ["A reported annual fundraising total", "Colleague and match-funding activity", "Support across multiple charitable causes"],
    limitations: ["The current experience does not allocate the total by charity.", "Funds raised are not the same as verified downstream social outcomes.", "Prototype actions do not alter the reported amount."],
    milestones: [
      { label: "Period", detail: "2025 annual reporting" },
      { label: "Reported total", detail: "£140,000 raised" },
      { label: "Next evidence", detail: "Approved allocation and downstream-use detail" },
    ],
  },
}

export function evidenceStateForSource(source: Source | undefined): EvidenceState {
  if (!source) return "unavailable"
  if (source.review_status === "illustrative_not_observed") return "illustrative"
  if (source.review_status === "unverified_url_do_not_use_in_primary_demo") return "awaiting"
  if (source.review_status.includes("checked")) return "verified"
  return "reported"
}

export function evidenceStateForMetric(metric: Metric): EvidenceState {
  if (metric.kind === "unavailable" || metric.value === null) return "unavailable"
  if (metric.kind === "illustrative" || metric.kind === "simulated") return "illustrative"
  if (metric.kind === "derived") return "derived"
  const states = metric.source_ids.map((id) => evidenceStateForSource(getSource(id)))
  return states.includes("verified") ? "verified" : "reported"
}

export function evidenceLabel(state: EvidenceState) {
  return {
    verified: "Verified source",
    reported: "Reported",
    derived: "Derived",
    illustrative: "Illustrative",
    awaiting: "Awaiting review",
    unavailable: "Unavailable",
  }[state]
}

export function getProgrammeRecord(id: string): ProgrammeRecord | undefined {
  const person = getPersona(id)
  const copy = editorial[id]
  if (!person || !copy) return undefined
  const metrics = person.metric_ids.map((metricId) => getMetric(metricId)).filter((metric): metric is Metric => Boolean(metric))
  const sources = person.source_ids.map((sourceId) => getSource(sourceId)).filter((source): source is Source => Boolean(source))
  const state = sources.length ? evidenceStateForSource(sources[0]) : "unavailable"
  const coverage: EvidenceCoverage = metrics.length >= 2 ? "measured" : metrics.length === 1 ? "partial" : "narrative"
  return {
    person,
    editorial: copy,
    metrics,
    sources,
    evidenceState: state,
    coverage,
    approvalLabel: person.approval_status === "demo_editorial_only_not_partner_approved" ? "Editorial demo · partner approval pending" : person.approval_status.replaceAll("_", " "),
    image: `/assets/people/${person.id}.jpg`,
  }
}

export function listProgrammeRecords() {
  return handoff.people.map((person) => getProgrammeRecord(person.id)).filter((record): record is ProgrammeRecord => Boolean(record))
}

export function programmeReadiness(record: ProgrammeRecord) {
  const sourceReady = record.sources.length > 0 && record.sources.every((source) => evidenceStateForSource(source) === "verified")
  const metricsReady = record.metrics.length > 0
  return {
    sourceReady,
    metricsReady,
    score: (sourceReady ? 50 : 0) + (metricsReady ? 35 : 0) + (record.person.approval_status.includes("partner_approved") && !record.person.approval_status.includes("not_partner_approved") ? 15 : 0),
  }
}

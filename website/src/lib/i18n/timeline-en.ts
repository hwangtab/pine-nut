import type { TimelineEvent } from "@/data/timeline";

export type EnglishTimelineCategory =
  | "Meetings"
  | "Protest"
  | "Legal"
  | "Solidarity"
  | "Other";

export interface EnglishTimelineEvent {
  id: number;
  date: string;
  year: number;
  title: string;
  description: string;
  category: EnglishTimelineCategory;
  imageUrl?: string;
  imageAlt?: string;
}

interface EnglishTimelineTranslation {
  date: string;
  title: string;
  description: string;
  category: EnglishTimelineCategory;
  imageAlt?: string;
}

const categoryMap: Record<TimelineEvent["category"], EnglishTimelineCategory> = {
  회의: "Meetings",
  집회: "Protest",
  법률: "Legal",
  연대: "Solidarity",
  기타: "Other",
};

const timelineTranslations: Record<number, EnglishTimelineTranslation> = {
  1: {
    date: "Summer 2019",
    title: "KHNP Selects Seven Candidate Sites; Hongcheon Applies to Host",
    description:
      "Korea Hydro & Nuclear Power selected seven candidate regions for new pumped-storage plants. Hongcheon County applied with Pungcheon-ri as the target area, placing the village directly in the path of large-scale development.",
    category: "Other",
  },
  2: {
    date: "March 2019",
    title: "Residents File Complaints; County Governor Promises to Stop if Residents Oppose",
    description:
      "After learning of the project, residents filed civil complaints. The Hongcheon County governor promised that the project would stop if villagers opposed it, a promise residents say was later broken.",
    category: "Meetings",
  },
  3: {
    date: "April 17, 2019",
    title: "Hongcheon County Pushes Through Resident Briefing Despite Opposition",
    description:
      "Even amid strong local resistance, Hongcheon County went ahead with a public briefing on the pumped-storage project, intensifying distrust among residents.",
    category: "Meetings",
  },
  4: {
    date: "April 19, 2019",
    title: "Overnight Sit-In and a Second Promise from the Governor",
    description:
      "Residents began an overnight sit-in. The county governor again promised to respect residents' wishes, but that promise, too, was not kept.",
    category: "Protest",
  },
  5: {
    date: "2019",
    title: "Residents Form Opposition Committee and Begin Weekly Protests",
    description:
      "Villagers formally created the Pungcheon-ri Pumped-Storage Opposition Committee and launched weekly demonstrations, marking the beginning of a struggle that would last more than seven years.",
    category: "Protest",
    imageAlt: "Pungcheon-ri residents protesting the pumped-storage plant in 2019",
  },
  6: {
    date: "May 2021",
    title: "Preferred Developer Selected",
    description:
      "A preferred operator for the Hongcheon pumped-storage project was selected, moving the project into a more concrete phase despite local opposition.",
    category: "Other",
  },
  7: {
    date: "February 2022",
    title: "Public Preliminary Feasibility Review Passes",
    description:
      "The project passed a public preliminary feasibility review. Residents criticized the process for failing to properly reflect environmental damage and community opposition.",
    category: "Legal",
  },
  8: {
    date: "August 2022",
    title: "Youth Direct Action Visits and Joins in Solidarity",
    description:
      "Youth climate activists visited Pungcheon-ri and publicly joined the struggle, helping expand its visibility across generations.",
    category: "Solidarity",
  },
  9: {
    date: "2022",
    title: "Environmental Impact Consultation Completed",
    description:
      "The environmental review process was completed, but residents and environmental groups argued that major issues such as forest destruction and wildlife habitat loss were not properly addressed.",
    category: "Other",
  },
  10: {
    date: "May 2023",
    title: "Planned Project Zone Officially Designated",
    description:
      "The planned project zone for the Hongcheon pumped-storage plant was officially designated and announced, escalating residents' opposition.",
    category: "Legal",
  },
  11: {
    date: "October 2023",
    title: "Gangwon Green Party Issues Official Statement of Opposition",
    description:
      "The Gangwon Green Party released an official statement opposing the project and highlighting its environmental and social consequences.",
    category: "Solidarity",
  },
  12: {
    date: "July 22, 2024",
    title: "Police Confrontation on the Second Floor of Hongcheon County Hall",
    description:
      "Residents faced police inside Hongcheon County Hall, and riot police were deployed. The scene became a symbol of how far the conflict had escalated.",
    category: "Protest",
    imageAlt: "Residents confronting police at Hongcheon County Hall in July 2024",
  },
  13: {
    date: "October 2024",
    title: "Logging Begins: 2,256 Pine Trees Cut for Relocation Road",
    description:
      "Logging began for the relocation road, affecting 10.96 hectares and 2,256 pine trees before full implementation approval was even issued.",
    category: "Other",
    imageAlt: "Pine trees being felled for relocation road construction",
  },
  14: {
    date: "July 12, 2025",
    title: "Concert and Village Festival Held in the Pine Forest",
    description:
      "Residents and supporters gathered in the pine forest for a concert and village festival intended to heal collective wounds and reaffirm solidarity.",
    category: "Solidarity",
    imageAlt: "Supporters gathered at the pine forest village event in 2025",
  },
  15: {
    date: "August 18, 2025",
    title: "Daewoo E&C Consortium Selected as Main Contractor",
    description:
      "The Daewoo E&C consortium was chosen to build the project, worth 615.5 billion KRW, pushing the conflict into a new phase.",
    category: "Other",
  },
  16: {
    date: "August 29, 2025",
    title: "Ministry Issues Implementation Approval Notice",
    description:
      "The Ministry of Trade, Industry and Energy officially approved the project, sharpening tensions between residents, authorities, and solidarity groups.",
    category: "Legal",
    imageAlt: "Pungcheon-ri residents at a press conference in front of the planning commission",
  },
  17: {
    date: "September 2025",
    title: "Advance Works Begin on Access and Relocation Roads",
    description:
      "After official approval, advance construction began, directly affecting the village and surrounding landscape.",
    category: "Other",
  },
  18: {
    date: "November 2025",
    title: "Seven Residents in Their 60s to 80s Are Indicted",
    description:
      "Seven elderly residents were indicted on charges of refusing to vacate, deepening the human cost of the conflict.",
    category: "Legal",
    imageAlt: "Residents of Pungcheon-ri receiving a civic award",
  },
  19: {
    date: "Late 2025",
    title: "Weekly Protest Count Passes 680",
    description:
      "The residents' weekly protest reached more than 680 gatherings, demonstrating extraordinary persistence over more than six years.",
    category: "Protest",
    imageAlt: "A solidarity rally marking the 672nd prayer meeting and protest",
  },
  20: {
    date: "January 2026",
    title: "Main Construction Scheduled to Begin",
    description:
      "Full construction of the pumped-storage plant was scheduled to begin, threatening irreversible changes to the village and the surrounding mountain environment.",
    category: "Other",
  },
  21: {
    date: "As of 2026",
    title: "The Struggle Continues with Support from More Than 140 Organizations",
    description:
      "More than seven years later, the struggle continues. Over 140 organizations now stand in solidarity with Pungcheon-ri, turning the issue into a national question of ecology, democracy, and residents' rights.",
    category: "Solidarity",
  },
};

export function translateTimelineEventToEnglish(
  event: TimelineEvent,
): EnglishTimelineEvent {
  const translated = timelineTranslations[event.id];

  return {
    id: event.id,
    date: translated?.date ?? event.date,
    year: event.year,
    title: translated?.title ?? event.title,
    description: translated?.description ?? event.description,
    category: translated?.category ?? categoryMap[event.category],
    imageUrl: event.imageUrl,
    imageAlt: translated?.imageAlt ?? event.imageAlt,
  };
}

export function translateTimelineEventsToEnglish(
  events: TimelineEvent[],
): EnglishTimelineEvent[] {
  return events.map(translateTimelineEventToEnglish);
}

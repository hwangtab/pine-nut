import type { NewsItem } from "@/data/news";

export type EnglishNewsCategory =
  | "Notice"
  | "Protest"
  | "Press Coverage"
  | "Solidarity";

export interface EnglishNewsItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: EnglishNewsCategory;
  sourceUrl: string;
  sourceName: string;
  thumbnailUrl?: string;
}

interface EnglishNewsTranslation {
  title: string;
  summary: string;
  content: string;
  category: EnglishNewsCategory;
}

const categoryMap: Record<NewsItem["category"], EnglishNewsCategory> = {
  공지: "Notice",
  집회: "Protest",
  언론보도: "Press Coverage",
  연대: "Solidarity",
};

const newsTranslations: Record<string, EnglishNewsTranslation> = {
  "pressian-elderly-residents-criminal-records": {
    title: "Why Did Elderly Pungcheon-ri Residents End Up with Criminal Records?",
    summary:
      "Seven residents in their 60s to 80s were indicted for refusing to leave during their opposition to the pumped-storage plant, and prosecutors sought fines of 2 to 3 million KRW.",
    content: `Seven elderly residents of Pungcheon-ri, Hongcheon County, who have opposed the pumped-storage power plant, were indicted on charges of refusing to vacate and are now standing trial. Prosecutors requested fines ranging from 2 to 3 million KRW.

These residents, aged from their 60s to 80s, are the same villagers who have held weekly protests since 2019 demanding the cancellation of the project. After spending their entire lives with the pine nut forest, they now face criminal punishment simply for trying to defend the land that sustained them.

Residents of Pungcheon-ri have held more than 680 regular protests since 2019. KHNP and Hongcheon County have continued to push the project forward, and after the Ministry of Trade, Industry and Energy issued its implementation approval notice in 2025, advance construction intensified the conflict even further.

The case shows how local voices can be sidelined in large state-backed development projects. It has also drawn criticism and solidarity from civil society groups across the country.`,
    category: "Press Coverage",
  },
  "ohmynews-pastor-tragedy": {
    title: "The Tragedy of Korea's Largest Pine Nut Region",
    summary:
      "Pastor Park Seong-yul, who has stood with villagers, describes the destruction now unfolding in Mt. Gari and Pungcheon-ri as construction advances.",
    content: `The area around Pungcheon-ri, known as one of Korea's leading pine nut producing regions, is facing a severe crisis because of the pumped-storage project. Pastor Park Seong-yul, who has supported the residents' struggle, visited the site and reported on the devastation already visible on Mt. Gari and in the village.

Pungcheon-ri has long relied on pine nut harvesting as a primary livelihood. The century-old pine forest is not only an economic base but the center of the village's history and culture. As relocation road and advance works proceed, thousands of pine trees have already been cut and the surrounding ecosystem is rapidly being damaged.

Park argues that this is not ordinary development. It is the uprooting of a community, a culture, and an ecological landscape built over generations. By sharing photographs and testimony from the site, he calls for far wider public attention to what is happening in Pungcheon-ri.`,
    category: "Press Coverage",
  },
  "hcsinmoon-approval-residents-backlash": {
    title: "Residents Strongly Oppose Government Approval of Hongcheon Pumped Storage Project",
    summary:
      "After the ministry's approval notice, residents of Pungcheon-ri warned that confrontation will deepen as the project moves ahead.",
    content: `After the Ministry of Trade, Industry and Energy issued its official implementation approval for the Hongcheon pumped-storage project, residents of Pungcheon-ri strongly protested. They say their opposition was completely ignored during the approval process.

With the approval in place, the Daewoo E&C consortium is set to begin a project worth 615.5 billion KRW over 84 months, while advance works such as access roads are already underway.

Residents have held weekly protests for nearly seven years since 2019. Their distrust deepened when promises made by the Hongcheon County governor to halt the project if residents opposed it were not kept. The approval notice has only intensified that anger.

Local concern is growing that once major construction begins, direct clashes between residents and contractors could follow unless meaningful dialogue is restored.`,
    category: "Press Coverage",
  },
  "ohmynews-nationwide-pumped-hydro-opposition": {
    title: "Calls Grow to Halt 15 New Pumped-Storage Projects Nationwide",
    summary:
      "Opposition is growing to new pumped-storage projects in 15 regions, including Hongcheon, with Pungcheon-ri becoming a symbolic case.",
    content: `Voices calling for a full halt to 15 new pumped-storage power plant projects across South Korea, including the one planned in Hongcheon, are growing louder. Environmental groups and resident organizations are questioning both the real need for the facilities and the scale of environmental damage they cause.

Opponents argue that pumped-storage plants are inefficient and require large-scale destruction during construction. In this broader national debate, Pungcheon-ri has emerged as one of the most symbolic cases because of the villagers' long and disciplined resistance.

More than 140 civic and environmental organizations have formed solidarity networks demanding a comprehensive review of new pumped-storage projects. They are also calling for energy policies that guarantee resident participation and reduce ecological harm.`,
    category: "Press Coverage",
  },
  "ohmynews-100-year-pine-forest": {
    title: "We Want to Protect the 100-Year Pine Forest, Wildlife, and Our Community",
    summary:
      "Residents say they are fighting to protect an old-growth pine nut forest, endangered wildlife habitat, and the village community built around it.",
    content: `Pungcheon-ri is home to a pine nut forest more than a century old. The forest is not only the basis of local livelihoods through pine nut harvesting but also habitat for endangered wildlife such as the goral.

Residents warn that if the pumped-storage plant is built, large sections of the forest will be destroyed and construction noise, vibration, and dust will severely affect everyday life and health. They point out that even before full construction, 2,256 pine trees were already felled during relocation road works.

For villagers, the pine forest is not scenery. It is life itself. Their culture of pine nut gathering and the bonds of the community were formed around these trees. This report highlights that the struggle is not a simple NIMBY reaction but a fight to protect ecology, livelihood, and community.`,
    category: "Press Coverage",
  },
  "ikpnews-village-festival": {
    title: "A Village Festival for Residents Fighting the Pumped-Storage Plant",
    summary:
      "After years of struggle, residents held a concert and village gathering in the pine forest to heal and reaffirm community ties.",
    content: `On July 12, 2025, residents of Pungcheon-ri held a concert and village festival in the pine forest. After more than seven years of resisting the pumped-storage plant, the gathering became a rare moment to set down the burden of struggle and share time together.

Residents were joined by activists and supporters from around the country. Music filled the forest, and the protest site briefly transformed into a space of healing and solidarity.

The event was designed to help repair the emotional wounds built up during years of protests, indictments, and repeated confrontation. It showed that the Pungcheon-ri struggle is not only a campaign of opposition, but also a collective effort to protect a living community.`,
    category: "Press Coverage",
  },
  "womennews-goral-sighting": {
    title: "We Saw Gorals Here: Residents Speak About Wildlife in Hongcheon",
    summary:
      "Residents say they have repeatedly seen endangered gorals near the planned project site, raising serious ecological concerns.",
    content: `Residents reported sightings of endangered gorals near the planned pumped-storage power plant site in Hongcheon. They say the area has long been home not only to gorals but to many species of wildlife.

The goral is legally protected in South Korea as a first-grade endangered species and a natural monument. Villagers warn that major earthworks would damage this habitat and push wildlife out of the area.

Pungcheon-ri is ecologically significant because of its pine forest and the range of species living there. Residents question whether the environmental impact assessment properly reflected this value and argue that the project's ecological legitimacy must be re-examined.`,
    category: "Press Coverage",
  },
  "newsis-pine-trees-felled": {
    title: "Thousands of Pine Trees Felled for Relocation Road Linked to Hongcheon Project",
    summary:
      "Thousands of pine trees were cut for road construction linked to the pumped-storage project, triggering controversy because it began before final approval.",
    content: `In October 2024, thousands of pine trees began to be cut for relocation road construction linked to the Hongcheon pumped-storage project. The logged area reached 10.96 hectares, including 2,256 pine trees, directly damaging the livelihood base of the village.

One of the biggest controversies was that the logging began before the Ministry of Trade, Industry and Energy issued the project's implementation approval. Residents and environmental groups condemned the work as premature and procedurally unjustified.

Many of the felled trees were decades old, with some more than 100 years old. For residents, the destruction of the forest is not just economic loss but the dismantling of a shared way of life built around the pine nut woods.`,
    category: "Press Coverage",
  },
  "newsis-police-confrontation-county-office": {
    title: "Residents Opposing the Hongcheon Plant Face Police at County Office",
    summary:
      "In July 2024, residents protesting the project faced police during a tense confrontation inside Hongcheon County Hall.",
    content: `On July 22, 2024, residents opposing the Hongcheon pumped-storage power plant confronted police on the second floor of Hongcheon County Hall. They had come to demand a halt to the project, and tensions escalated when police were deployed.

Residents accused Hongcheon County of ignoring their consistent opposition and breaking earlier promises to stop the project if the village objected. With riot police present and elderly villagers caught in the middle, the incident became a stark symbol of how severe the conflict had become.

The confrontation drew public attention and reinforced the sense that the dispute over the pumped-storage project had entered a dangerous and highly polarized phase.`,
    category: "Press Coverage",
  },
  "ohmynews-youth-direct-action": {
    title: "Youth Direct Action Calls for Full Cancellation of the Hongcheon Plant",
    summary:
      "Youth climate activists visited Pungcheon-ri and called for the complete cancellation of the pumped-storage project.",
    content: `Youth Direct Action, a youth environmental group, visited Pungcheon-ri and issued a statement calling for the complete cancellation of the pumped-storage power plant. Their visit showed that the struggle has grown beyond a local dispute into an intergenerational environmental movement.

The group argued that large-scale projects that destroy ecosystems cannot be treated as genuine solutions in an era of climate crisis. They called instead for alternatives centered on renewables, efficiency, and environmental justice.

By listening directly to residents and seeing the pine forest themselves, the young activists added new energy to the campaign. Their solidarity signaled that the future generation also sees Pungcheon-ri as part of a larger national question about energy policy and environmental protection.`,
    category: "Press Coverage",
  },
};

export function translateNewsItemToEnglish(item: NewsItem): EnglishNewsItem {
  const translated = newsTranslations[item.slug];

  return {
    id: item.id,
    slug: item.slug,
    title: translated?.title ?? item.title,
    summary: translated?.summary ?? item.summary,
    content: translated?.content ?? item.content,
    date: item.date,
    category: translated?.category ?? categoryMap[item.category],
    sourceUrl: item.sourceUrl,
    sourceName: item.sourceName,
    thumbnailUrl: item.thumbnailUrl,
  };
}

export function translateNewsItemsToEnglish(
  items: NewsItem[],
): EnglishNewsItem[] {
  return items.map(translateNewsItemToEnglish);
}

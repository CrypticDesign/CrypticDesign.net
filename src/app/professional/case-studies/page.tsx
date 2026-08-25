import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CaseStudyGallery from "@/components/CaseStudyGallery";

export const metadata: Metadata = {
  title: "Case Studies",
  alternates: { canonical: "/professional/case-studies" }, openGraph: { title: "UX & Product Design Case Studies", description: "Console game UX, VR training, enterprise health systems, tactical games, and mobile strategy work.", url: "/professional/case-studies", images: ["/share/case-studies.png"] }, twitter: { card: "summary_large_image", images: ["/share/case-studies.png"] }, robots: { index: true, follow: true },
  description: "Selected Cryptic Design work — console game UX, VR training, enterprise health systems, and mobile strategy — told as problem, approach, craft, and outcome.",
};

// CRY-344 item 4: content + imagery migrated from the legacy services and
// portfolio pages. Rights confirmed by Robert 2026-07-20.
type Shot = { src: string; alt: string; caption: string };
type FaqItem = { question: string; answer: string; bullets?: string[] };
type FaqSection = { title: string; items: FaqItem[] };
type CaseStudy = {
  slug: string;
  title: string;
  years: string;
  engagement: string;
  discipline: string;
  accent: "magenta" | "cyan" | "violet" | "indigo";
  hero: { src: string; alt: string };
  problem: string;
  approach: string;
  craft: string;
  outcome: string;
  shots: Shot[];
  faq?: FaqSection[];
};

const caseStudies: CaseStudy[] = [
  {
    slug: "humankind-console",
    title: "Humankind — Console Editions",
    years: "2022",
    engagement: "Cryptic Design engagement with Amplitude Studios and Aspyr Media",
    discipline: "Game UX / console platform design",
    accent: "magenta",
    hero: {
      src: "/images/case-studies/humankind-hero.jpg",
      alt: "Humankind console UX design case study by Cryptic Design for Amplitude Studios and Aspyr Media",
    },
    problem:
      "Bring a deep, systems-heavy 4X strategy game designed for PC to console platforms without losing the depth and complexity players expect.",
    approach:
      "Reverse-engineered the PC SKU's design systems and interaction models, then rebuilt them for controller-based play through iterative prototyping and user testing.",
    craft:
      "Optimized interfaces and refined control schemes across the game's core management systems — wonders, military movement, outposts, and cities — tuned for readability and strategy-focused interaction on console.",
    outcome:
      "Console editions retained the original PC version's depth while fitting the constraints and capabilities of console platforms, delivering a polished, user-friendly strategy experience.",
    faq: [
      {
        title: "About",
        items: [
          {
            question: "What is Humankind?",
            answer:
              "Humankind is a turn-based historical strategy game developed by Amplitude Studios and published by SEGA. Players guide a civilization from the Neolithic era to the modern age, shaping culture, diplomacy, cities, and military power through strategic decisions.",
          },
          {
            question: "What was the goal of this project?",
            answer:
              "The goal was to adapt Humankind's complex PC interface and game mechanics into a seamless console experience. Navigation, controls, and layouts were reworked so the game's strategic depth remained accessible through gamepad interaction.",
          },
        ],
      },
      {
        title: "Project scope & role",
        items: [
          {
            question: "What was Cryptic Design's role in this project?",
            answer:
              "Cryptic Design collaborated with Amplitude Studios and Aspyr Media to refine and develop the UX/UI framework for the console adaptation. The work included interaction-model redesign, controller-friendly navigation, and iterative usability evaluation without compromising the game's strategic complexity.",
          },
          {
            question: "What were the primary UX challenges?",
            answer: "The console adaptation had to preserve precision, clarity, and depth across several connected challenges:",
            bullets: [
              "Translate mouse-and-keyboard interactions into gamepad-friendly controls.",
              "Keep complex menus accessible without overwhelming console players.",
              "Improve information hierarchy and readability at television viewing distances.",
              "Reduce cognitive load by restructuring menu navigation.",
              "Refine HUD and tooltip behavior while preserving necessary game detail.",
            ],
          },
        ],
      },
      {
        title: "Key responsibilities",
        items: [
          {
            question: "What were Cryptic Design's primary contributions?",
            answer: "Cryptic Design's primary responsibilities included:",
            bullets: [
              "UX and UI adaptation for controller-based console navigation.",
              "Menu-flow and layout optimization.",
              "HUD and information-architecture improvements.",
              "Interaction, legibility, accessibility, and button-mapping enhancements.",
              "Heuristic evaluation and iterative usability testing.",
              "Prototyping and validation of interface components and interaction models.",
            ],
          },
        ],
      },
    ],
    shots: [
      {
        src: "/images/case-studies/humankind-turnstart.jpg",
        alt: "Turn start gameplay interface for Humankind console editions emphasizing strategic awareness and streamlined player feedback.",
        caption: "Turn start & awareness",
      },
      {
        src: "/images/case-studies/humankind-deployment.jpg",
        alt: "Deployment phase interface for Humankind console gameplay supporting tactical positioning and combat preparation.",
        caption: "Tactical deployment",
      },
      {
        src: "/images/case-studies/humankind-contender.jpg",
        alt: "Combat contender results screen focused on tactical clarity and battle outcome visualization in Humankind.",
        caption: "Combat outcomes",
      },
      {
        src: "/images/case-studies/humankind-battle.jpg",
        alt: "Battle results interface for Humankind communicating tactical outcomes, rewards, and combat summaries.",
        caption: "Battle results",
      },
      {
        src: "/images/case-studies/humankind-attack.jpg",
        alt: "Attack decision interaction flow designed for tactical gameplay clarity and responsive controller navigation.",
        caption: "Attack decisions",
      },
      {
        src: "/images/case-studies/humankind-unitturn.jpg",
        alt: "Unit turn gameplay interface supporting tactical decision making and strategic interaction design.",
        caption: "Unit turn flow",
      },
      {
        src: "/images/case-studies/humankind-unitresults.jpg",
        alt: "Unit results interface providing streamlined combat feedback and controller optimized tactical interaction.",
        caption: "Unit results",
      },
      {
        src: "/images/case-studies/humankind-opponent.jpg",
        alt: "Opponent turn state interface designed to maintain gameplay clarity and pacing during large scale strategy sessions.",
        caption: "Opponent turn state",
      },
      {
        src: "/images/case-studies/humankind-turnend.jpg",
        alt: "Turn end interaction systems featuring strategic notifications, gameplay transitions, and console optimized usability.",
        caption: "Turn end transitions",
      },
      {
        src: "/images/case-studies/humankind-wire-city.jpg",
        alt: "Wireframe UX concept for city construction systems and vertical navigation flows.",
        caption: "Wireframe — city construction",
      },
      {
        src: "/images/case-studies/humankind-wire-pop.jpg",
        alt: "Population management dialog wireframes focused on readability, interaction flow, and strategic decision support.",
        caption: "Wireframe — population dialogs",
      },
    ],
  },
  {
    slug: "win-reality",
    title: "WIN Reality — VR Baseball Training",
    years: "2021–2022",
    engagement: "Founder engagement at WIN Reality",
    discipline: "VR product UX / brand systems",
    accent: "cyan",
    hero: {
      src: "/images/case-studies/winreality-hero.jpg",
      alt: "WIN Reality VR baseball training platform marketing imagery",
    },
    problem:
      "Enhance the overall user experience of a VR baseball training simulator, including a new visual theme, branding, and user flow.",
    approach:
      "Began with a comprehensive research phase to build deep insight into the product, user behavior, company needs, and stakeholder perspectives before designing.",
    craft:
      "New visual theme, brand direction, restructured user flows, and a documented UI component system built for legibility inside immersive VR training contexts.",
    outcome:
      "A clearer, more cohesive training experience grounded in research rather than assumption, aligned with both athlete needs and company goals.",
    faq: [
      {
        title: "About",
        items: [
          { question: "What is WIN Reality?", answer: "WIN Reality is a virtual-reality baseball and softball training platform. It combines realistic pitching simulations, pitch-recognition drills, reaction training, and performance feedback for athletes at multiple levels." },
          { question: "What was the goal of the project?", answer: "The goal was to create an intuitive immersive environment where athletes could enter realistic training scenarios, find appropriate drills, make faster decisions, and understand their progress without interface friction." },
          { question: "What made the product distinctive?", answer: "The experience combined sports science, motion-captured pitchers, and interactive VR training in a tool designed for athletes ranging from developing youth players to professionals." },
          { question: "How did UX/UI support the training experience?", answer: "The interface clarified onboarding, drill discovery, profile selection, training customization, and feedback so players could focus on practice rather than learning the software." },
        ],
      },
      {
        title: "Project scope & role",
        items: [
          { question: "What was the scope of the project?", answer: "The work covered research, user flows, visual direction, brand expression, design-library foundations, and immersive interface design for the Meta Quest baseball and softball training experience." },
          { question: "What was Robert's role?", answer: "As Senior UX Designer, Robert contributed across discovery, requirements, workshops, prototyping, visual design, documentation, and implementation support in collaboration with product, engineering, art, and company stakeholders." },
        ],
      },
      {
        title: "Key responsibilities",
        items: [
          { question: "What were the primary responsibilities?", answer: "The role connected research and delivery across the product experience:", bullets: ["Research athlete, coach, product, and stakeholder needs.", "Design legible immersive interfaces and training flows for Meta Quest.", "Facilitate workshops and align stakeholders on experience priorities.", "Prototype and evaluate VR interactions.", "Develop the visual theme and reusable interface library.", "Support engineering implementation and iteration."] },
          { question: "How did the work contribute to the product?", answer: "The work clarified onboarding, training selection, immersive interaction, and the surrounding pod experience, helping athletes reach useful practice more confidently and consistently." },
        ],
      },
    ],
    shots: [
      {
        src: "/images/case-studies/winreality-login.png",
        alt: "Streamlined login interface for accessing training sessions, featuring profile management and device registration options.",
        caption: "Login & device registration",
      },
      {
        src: "/images/case-studies/winreality-drills.png",
        alt: "Categorized view of available drills, allowing players to refine pitch recognition and reaction skills.",
        caption: "Drill selection",
      },
      {
        src: "/images/case-studies/winreality-profile.png",
        alt: "Profile selection screen with clear organization for multiple accounts and progress tracking.",
        caption: "Profile selection",
      },
      {
        src: "/images/case-studies/winreality-components.png",
        alt: "Detailed breakdown of UI components within the pitcher selection system, ensuring usability and clarity.",
        caption: "UI component system",
      },
      {
        src: "/images/case-studies/winreality-cards.png",
        alt: "Comparison of different UI styles for drill selection cards, balancing readability and engagement.",
        caption: "Drill card explorations",
      },
      {
        src: "/images/case-studies/winreality-grid.png",
        alt: "Screen space resolution grid — a UI layout reference for optimal spacing and visual hierarchy across resolutions in VR.",
        caption: "Screen-space layout grid",
      },
      {
        src: "/images/case-studies/winreality-logo.jpg",
        alt: "WIN Reality brand mark in purple on black, part of the refreshed visual theme.",
        caption: "Brand mark",
      },
    ],
  },
  {
    slug: "digimancy-wire",
    title: "Digimancy — Project WIRE",
    years: "2021",
    engagement: "UX/UI design contribution while working with Digimancy Entertainment",
    discipline: "Tactical RPG UX / interaction systems",
    accent: "violet",
    hero: { src: "/images/case-studies/digimancy-hazard.png", alt: "Project WIRE narrative encounter interface for an environmental hazard" },
    problem: "Create a readable interaction framework for a new narrative-driven science-fiction RPG where dense tactical information and consequential choices had to coexist.",
    approach: "Combined competitive research and stakeholder input into a UX strategy, then moved from low- and high-fidelity mockups to a functional Figma prototype.",
    craft: "Dialogue encounters, menu navigation, combat HUDs, and a distinct breather phase that let players assess units, buffs, and tactical options before committing to the next action.",
    outcome: "A cohesive interface direction that improved combat readability, streamlined navigation, and gave the team an implementation-ready framework for the emerging IP.",
    faq: [
      { title: "About", items: [
        { question: "What was Project WIRE?", answer: "WIRE was a strategic science-fiction RPG in development at Digimancy Entertainment, built around narrative choice, world building, and turn-based tactical combat." },
        { question: "What made the interaction model distinctive?", answer: "A combat breather phase gave players a deliberate pause to understand battlefield state, unit status, buffs, and tactical options before the next exchange." },
      ] },
      { title: "Project scope & role", items: [
        { question: "What was Robert's role?", answer: "Robert contributed UX/UI design, interaction models, visual hierarchy, menus, HUDs, dialogue flows, prototypes, and implementation guidance while working with Digimancy." },
        { question: "What tools supported the work?", answer: "Figma supported wireframing and functional prototyping, with Adobe Creative Suite and Unity used across visual design, iteration, and in-engine collaboration." },
      ] },
      { title: "Key responsibilities", items: [
        { question: "What were the main UX challenges?", answer: "The work concentrated on information density and clear player feedback:", bullets: ["Balance high-information screens without overwhelming players.", "Create HUD states that adapted to different combat situations.", "Make actions, consequences, and combat feedback immediately legible.", "Maintain visual and interaction consistency across dialogue, menus, and combat."] },
        { question: "How was accessibility considered?", answer: "Usability evaluation focused on text readability, color contrast, interactive clarity, and keeping essential gameplay information accessible without unnecessary overload." },
      ] },
    ],
    shots: [
      { src: "/images/case-studies/digimancy-hazard.png", alt: "Environmental hazard narrative encounter with consequential crew and ship decisions", caption: "Environmental hazard encounter" },
      { src: "/images/case-studies/digimancy-pirate.png", alt: "Dialogue-driven pirate confrontation with branching player choices", caption: "Pirate confrontation" },
      { src: "/images/case-studies/digimancy-negotiation.png", alt: "Pirate negotiation interface offering diplomatic, threatening, and bribery choices", caption: "Branching negotiation" },
      { src: "/images/case-studies/digimancy-breather.png", alt: "Combat breather phase for reviewing battlefield state and tactical options", caption: "Combat breather phase" },
      { src: "/images/case-studies/digimancy-breather-expanded.png", alt: "Expanded combat breather interface with unit statistics and status effects", caption: "Expanded tactical state" },
      { src: "/images/case-studies/digimancy-combat.png", alt: "Tactical space-combat HUD with weapons, abilities, and ship status", caption: "Combat clash HUD" },
    ],
  },
  {
    slug: "wellsky",
    title: "WellSky — Enterprise Health Portfolio",
    years: "2019–2020",
    engagement: "Senior User Experience Designer within WellSky's engineering organization",
    discipline: "Enterprise UX / design systems",
    accent: "indigo",
    hero: {
      src: "/images/case-studies/wellsky-hero.jpg",
      alt: "WellSky enterprise healthcare software UX case study cover",
    },
    problem:
      "Address the UX needs of an extensive healthcare software portfolio spanning roughly 70 products.",
    approach:
      "Worked embedded with a team of UX designers, researchers, and managers, bringing senior product thinking to a large multi-role enterprise environment.",
    craft:
      "Information architecture, workflows, and interface systems for complex operational healthcare products, alongside heuristic evaluation and design language system documentation covering foundations, navigation, color, and component states.",
    outcome:
      "Coherent, user-centered UX support across one of the largest product portfolios in post-acute healthcare software.",
    faq: [
      {
        title: "About",
        items: [
          { question: "What is WellSky?", answer: "WellSky provides software for health and community-care organizations. At the time of this work, its portfolio included roughly 70 products serving complex healthcare, caregiving, rehabilitation, hospice, and social-service workflows." },
          { question: "What was the focus of the work?", answer: "The work focused on improving consistency, interoperability, and usability across a broad product portfolio through shared design foundations, clearer interaction patterns, and a formalized design-library system." },
        ],
      },
      {
        title: "Project scope & role",
        items: [
          { question: "What was the scope of the project?", answer: "The scope crossed multiple enterprise products and teams, with emphasis on standardizing visual language, improving cross-product workflows, documenting foundations, and resolving interaction-design needs in operational healthcare software." },
          { question: "What was Robert's role?", answer: "As a Senior User Experience Designer embedded in engineering, Robert helped establish and maintain design-system foundations, collaborated with product teams, led research and requirements discussions, and designed solutions for multiple products." },
        ],
      },
      {
        title: "Key responsibilities",
        items: [
          { question: "What were the primary responsibilities?", answer: "The role supported product teams and the broader portfolio through several connected responsibilities:", bullets: ["Create and maintain a formalized design library and shared visual standards.", "Improve interoperability and cross-product experience consistency.", "Partner with product managers, designers, engineers, and researchers.", "Lead UX research, requirements definition, and design documentation.", "Facilitate stakeholder reviews and translate findings into implementable solutions."] },
          { question: "How did the work contribute to the portfolio?", answer: "Shared design foundations reduced inconsistency, gave teams a clearer implementation reference, and supported more coherent experiences across a large family of healthcare products." },
        ],
      },
    ],
    shots: [
      {
        src: "/images/case-studies/wellsky-dashboard.jpg",
        alt: "Main landing page of the WellSky Blood system, providing quick access to patient management, non-patient workflows, and emergency actions.",
        caption: "Operational dashboard",
      },
      {
        src: "/images/case-studies/wellsky-foundations.jpg",
        alt: "Foundational principles of WellSky's Design Language System including material design, layout, structure, and accessibility.",
        caption: "Design language foundations",
      },
      {
        src: "/images/case-studies/wellsky-navigation.jpg",
        alt: "Diagram of WellSky's navigation architecture labeling breadcrumb navigation, page titles, and primary navigation areas.",
        caption: "Navigation architecture",
      },
      {
        src: "/images/case-studies/wellsky-buttons.jpg",
        alt: "Button styles within the WellSky design language system including contained, disabled, and focused states across light and dark themes.",
        caption: "Component states",
      },
      {
        src: "/images/case-studies/wellsky-nav-menu.jpg",
        alt: "Expanded primary navigation menu offering access to Patients, Orders, Inventory, Product Testing, Administration, and Billing.",
        caption: "Expanded navigation",
      },
      {
        src: "/images/case-studies/wellsky-search.jpg",
        alt: "Search bar functionality allowing users to type or scan for specific patient or inventory details.",
        caption: "Search & scan",
      },
      {
        src: "/images/case-studies/wellsky-testing.jpg",
        alt: "Product testing submenu enabling selection of bacterial platelet, ABO, unit, and automated testing types.",
        caption: "Product testing flows",
      },
      {
        src: "/images/case-studies/wellsky-navdesktop.jpg",
        alt: "Desktop navigation guidelines detailing top main navigation and left side navigation interaction patterns.",
        caption: "Navigation guidelines",
      },
      {
        src: "/images/case-studies/wellsky-material.jpg",
        alt: "Explanation of the adoption of Material Design principles to create a unified visual language across platforms.",
        caption: "Material foundations",
      },
      {
        src: "/images/case-studies/wellsky-color.jpg",
        alt: "Guide to color implementation in the design language system covering primary, secondary, and tertiary roles.",
        caption: "Color system",
      },
    ],
  },
  {
    slug: "onward-vr",
    title: "Onward — Tactical VR",
    years: "2019",
    engagement: "UX design contribution while working with Downpour Interactive",
    discipline: "VR game UX / design systems",
    accent: "cyan",
    hero: { src: "/images/case-studies/onward-role.jpg", alt: "Onward tactical VR role-selection interface" },
    problem: "Improve navigation, readability, and interaction consistency for a realism-focused VR military shooter with detailed roles, equipment, weapons, and community content.",
    approach: "Used competitive analysis and heuristic evaluation to shape the UX strategy, information architecture, design principles, and a unified visual style guide.",
    craft: "Role and loadout selection, weapon customization and statistics, attachment workflows, tryout interactions, and workshop browsing, with UI assets implemented in Unity.",
    outcome: "A more cohesive interface system with clearer navigation and stronger readability, supporting tactical preparation without pulling players out of the immersive experience.",
    faq: [
      { title: "About", items: [
        { question: "What is Onward?", answer: "Onward is a tactical VR military shooter developed by Downpour Interactive, focused on realism, teamwork, communication, and coordinated combat." },
        { question: "What was the UX focus?", answer: "The work focused on a cohesive visual language, clearer interaction design, stronger information architecture, and practical usability improvements within the Unity-based game experience." },
      ] },
      { title: "Project scope & role", items: [
        { question: "What was Robert's role?", answer: "As a UX Designer, Robert conducted research and analysis, helped define visual and interaction frameworks, created UI assets, supported feature ideation, and implemented interface work in Unity." },
        { question: "What did the project cover?", answer: "The scope included competitive analysis, heuristic evaluation, design principles, style-guide unification, information architecture, interface production, and implementation support." },
      ] },
      { title: "Key responsibilities", items: [
        { question: "What were the primary contributions?", answer: "The work connected strategic UX direction to production:", bullets: ["Conduct competitive analysis and heuristic evaluation.", "Develop a unified visual style guide.", "Structure navigation and information architecture.", "Create and implement UI assets in Unity.", "Contribute interaction frameworks and new-feature ideas."] },
        { question: "How did the work affect the experience?", answer: "The resulting system improved consistency, navigation, readability, and usability across preparation and content-discovery flows." },
      ] },
    ],
    shots: [
      { src: "/images/case-studies/onward-role.jpg", alt: "Role selection organized by rifleman, specialist, support, and marksman", caption: "Role selection" },
      { src: "/images/case-studies/onward-loadout.jpg", alt: "Tactical loadout selection for mid-range and close-range equipment", caption: "Loadout selection" },
      { src: "/images/case-studies/onward-customize.jpg", alt: "Loadout customization balancing equipment choices and available points", caption: "Loadout customization" },
      { src: "/images/case-studies/onward-attachments.jpg", alt: "Weapon attachment selection for flashlights, suppressors, and foregrips", caption: "Attachment selection" },
      { src: "/images/case-studies/onward-stats.jpg", alt: "Weapon detail interface with damage, accuracy, magazine, and penetration statistics", caption: "Weapon statistics" },
      { src: "/images/case-studies/onward-tryout.jpg", alt: "Virtual weapon tryout interaction before deployment", caption: "Weapon tryout" },
      { src: "/images/case-studies/onward-workshop.jpg", alt: "Community workshop browser with map and game-mode filters", caption: "Onward Workshop" },
    ],
  },
  {
    slug: "rise-to-power",
    title: "Star Wars: Rise to Power",
    years: "2018",
    engagement: "UI/UX design at Electronic Arts, in collaboration with Lucasfilm",
    discipline: "Mobile strategy UI / franchise systems",
    accent: "violet",
    hero: {
      src: "/images/case-studies/risetopower-hero.jpg",
      alt: "Star Wars: Rise to Power faction interface artwork comparing New Republic and Galactic Empire",
    },
    problem:
      "Establish and define the UI design for an unlaunched mobile strategy game, aligned with Star Wars' strategic and cinematic identity.",
    approach:
      "Worked closely with game designers, UI artists, programmers, and QA to problem-solve, implement, and test designs through iteration.",
    craft:
      "High-quality concept interfaces focused on intuitive navigation, strategic decision-making mechanics, and scalable UI elements supporting fleet management, diplomacy, and base building.",
    outcome:
      "A defined UI design language for the game's core systems; the title was ultimately unlaunched, and the work stands as a study in strategy-game interface design at franchise scale.",
    faq: [
      {
        title: "About",
        items: [
          { question: "What was Star Wars: Rise to Power?", answer: "Star Wars: Rise to Power was an unreleased mobile strategy game developed by Electronic Arts in collaboration with Lucasfilm. Its systems included faction alignment, base building, fleet management, alliances, and large-scale strategic conflict." },
          { question: "What was the focus of the project?", answer: "The project focused on a scalable UI/UX foundation for strategic play, including navigation, fleet and base management, diplomacy, live-service systems, and mobile interactions consistent with the Star Wars universe." },
        ],
      },
      {
        title: "Project scope & role",
        items: [
          { question: "What was the scope of the project?", answer: "The work covered concept development, information architecture, interaction design, prototyping, implementation collaboration, and testing for the game's central mobile-strategy systems." },
          { question: "What was Robert's role?", answer: "As Senior UX Designer at Electronic Arts, Robert defined UI/UX direction, created high-fidelity interface concepts, structured navigation and information architecture, and worked with game design, UI art, programming, and QA to refine the experience." },
        ],
      },
      {
        title: "Key responsibilities",
        items: [
          { question: "What were the primary responsibilities?", answer: "The work established an interface foundation for a dense strategy game:", bullets: ["Define a cohesive UI framework for strategic systems.", "Design concepts for fleet control, base building, diplomacy, progression, and live events.", "Build navigation and information architecture around player decisions.", "Collaborate with cross-functional teams during implementation.", "Test and iterate interface components for usability and scalability.", "Maintain franchise consistency while designing for mobile constraints."] },
          { question: "How did the work contribute to the project?", answer: "The resulting concepts and interaction structures gave the unreleased title a coherent foundation for presenting complex strategy systems with greater clarity, consistency, and mobile usability." },
        ],
      },
    ],
    shots: [
      {
        src: "/images/case-studies/risetopower-sector.jpg",
        alt: "Space strategy gameplay interface supporting tactical navigation, fleet awareness, and multiplayer interaction systems.",
        caption: "Sector navigation",
      },
      {
        src: "/images/case-studies/risetopower-shipyard.jpg",
        alt: "Spaceship building interface with build, repair, destroy, and queue options alongside resource and stat displays.",
        caption: "Shipyard & fleet build",
      },
      {
        src: "/images/case-studies/risetopower-base.jpg",
        alt: "Base management systems supporting strategic planning, construction workflows, and large scale mobile strategy gameplay.",
        caption: "Base management",
      },
      {
        src: "/images/case-studies/risetopower-city.jpg",
        alt: "City-building and strategy game interface with buildings, terrain, resource counters, and player controls.",
        caption: "Base HUD & world view",
      },
      {
        src: "/images/case-studies/risetopower-shipyard2.jpg",
        alt: "Fleet production interface focused on ship construction, tactical planning, and mobile strategy gameplay systems.",
        caption: "Fleet production",
      },
      {
        src: "/images/case-studies/risetopower-destroyer.jpg",
        alt: "Ship detail interface for an Imperial Star Destroyer showing stats, resources, and upgrade or build options.",
        caption: "Ship detail & upgrades",
      },
      {
        src: "/images/case-studies/risetopower-buildmenu.jpg",
        alt: "Fleet control upgrade systems focused on ship progression, tactical customization, and strategic gameplay usability.",
        caption: "Build & upgrade menu",
      },
      {
        src: "/images/case-studies/risetopower-guild.jpg",
        alt: "Guild and coalition interface with tabs, statistics, and notifications set against a galaxy background.",
        caption: "Guild & coalition",
      },
      {
        src: "/images/case-studies/risetopower-popup.jpg",
        alt: "Confirmation dialog systems supporting player decisions and streamlined mobile gameplay interaction workflows.",
        caption: "Confirmation dialogs",
      },
      {
        src: "/images/case-studies/risetopower-terrain.jpg",
        alt: "Science fiction strategy base view showing buildings, terrain, and on-screen statistics and menus.",
        caption: "Terrain & base reskin",
      },
    ],
  },
];

const accentHex = {
  magenta: "var(--cry-accent-magenta)",
  cyan: "var(--cry-accent-cyan)",
  violet: "var(--cry-accent-magenta)",
  indigo: "#6F7BFF",
} as const;

export default function CaseStudiesPage() {
  return (
    <main>
      <section className="visual-hero">
        <div className="visual-hero__image">
          <Image
            src="/images/professional-hero.png"
            alt="Abstract luminous network representing interconnected experience systems"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="visual-hero__wash" />
        <div className="visual-hero__content">
          <div className="signal-rail text-[var(--cry-accent-magenta)]" />
          <span className="kicker !text-[var(--cry-accent-magenta)]">
            Selected work / problem → approach → craft → outcome
          </span>
          <h1 className="display-title">
            Complex systems, made clear enough to play, work, and trust.
          </h1>
          <p>
            Six engagements across console strategy, virtual reality, tactical
            RPGs, enterprise healthcare, and mobile franchise games — each one a
            problem of making dense systems legible under real constraints.
          </p>
          <div className="hero-actions">
            <Link href="/professional/inquiry" className="button">
              Start a conversation
            </Link>
            <Link
              href="/professional"
              className="button secondary !border-[var(--cry-accent-magenta)]"
            >
              Professional Studio
            </Link>
          </div>
        </div>
      </section>

      <div className="shell page-stack">
        <nav aria-label="Case study index" className="panel p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="kicker !text-[var(--cry-accent-magenta)]">Portfolio index</span>
              <h2 className="text-xl font-semibold">Choose a use case</h2>
            </div>
            <p className="m-0 max-w-xl text-sm text-[var(--muted)]">Jump directly to the product context most relevant to your team.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs) => (
              <a
                key={cs.slug}
                href={`#${cs.slug}`}
                className="group relative grid min-h-28 grid-cols-[5.5rem_1fr] overflow-hidden bg-white/[.035] transition duration-200 hover:-translate-y-0.5 hover:bg-white/[.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: accentHex[cs.accent] }}
              >
                <span className="relative block overflow-hidden">
                  <Image src={cs.hero.src} alt="" fill sizes="88px" className="object-cover opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-100" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent to-[#07111a]/70" />
                </span>
                <span className="flex min-w-0 flex-col justify-center gap-2 px-4 py-3" style={{ borderBottom: `2px solid ${accentHex[cs.accent]}` }}>
                  <span className="text-[9px] font-bold uppercase tracking-[.1em]" style={{ color: accentHex[cs.accent] }}>{cs.years} / {cs.discipline}</span>
                  <span className="flex items-end justify-between gap-3 text-sm font-semibold leading-snug">
                    <span>{cs.title}</span>
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="mb-0.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 10h11M11 6l4 4-4 4" />
                    </svg>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </nav>

        {caseStudies.map((cs, index) => {
          const hex = accentHex[cs.accent];
          const imageFirst = index % 2 === 0;
          return (
            <section key={cs.slug} id={cs.slug} className="flex flex-col gap-5">
              <div className="section-heading">
                <div>
                  <span className="kicker" style={{ color: hex }}>
                    {cs.years} / {cs.discipline}
                  </span>
                  <h2 className="section-title">{cs.title}</h2>
                </div>
                <p>{cs.engagement}</p>
              </div>

              <div className={`feature-split ${imageFirst ? "" : "reverse"}`}>
                <div className="feature-split__image">
                  <Image
                    src={cs.hero.src}
                    alt={cs.hero.alt}
                    fill
                    sizes="(max-width:900px) 100vw, 60vw"
                  />
                </div>
                <div
                  className="feature-split__content !border-l-2"
                  style={{ borderLeftColor: hex }}
                >
                  <dl className="grid gap-5 sm:grid-cols-2">
                    {(
                      [
                        ["Problem", cs.problem],
                        ["Approach", cs.approach],
                        ["Craft", cs.craft],
                        ["Outcome", cs.outcome],
                      ] as const
                    ).map(([label, body]) => (
                      <div key={label} className="flex flex-col gap-2">
                        <dt
                          className="text-[10px] font-bold uppercase tracking-[.1em]"
                          style={{ color: hex }}
                        >
                          {label}
                        </dt>
                        <dd className="m-0 text-[13px] leading-relaxed text-[var(--muted)]">
                          {body}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <details className="panel group" open={index === 0}>
                <summary className="cursor-pointer list-none p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="kicker" style={{ color: hex }}>Project gallery</span>
                      <h3 className="text-lg font-semibold">Explore {cs.shots.length} design views</h3>
                    </div>
                    <span aria-hidden="true" className="text-2xl transition-transform group-open:rotate-45" style={{ color: hex }}>+</span>
                  </div>
                </summary>
                <div className="border-t border-[var(--border)] p-5 sm:p-6">
                  <CaseStudyGallery shots={cs.shots} accent={cs.accent} accentHex={hex} studyTitle={cs.title} />
                </div>
              </details>

              {cs.faq && (
                <section aria-labelledby={`${cs.slug}-faq-heading`} className="panel p-6 sm:p-8">
                  <div className="mb-6 max-w-3xl">
                    <span className="kicker" style={{ color: hex }}>Project FAQ</span>
                    <h3 id={`${cs.slug}-faq-heading`} className="section-title">Questions about the work</h3>
                  </div>
                  <div className="grid gap-8 lg:grid-cols-3">
                    {cs.faq.map((group) => (
                      <div key={group.title} className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold uppercase tracking-[.08em]" style={{ color: hex }}>
                          {group.title}
                        </h4>
                        {group.items.map((item) => (
                          <details key={item.question} className="border-t border-[var(--border)] py-4">
                            <summary className="cursor-pointer text-sm font-semibold leading-relaxed text-[var(--foreground)]">
                              {item.question}
                            </summary>
                            <div className="pt-3 text-[13px] leading-relaxed text-[var(--muted)]">
                              <p>{item.answer}</p>
                              {item.bullets && (
                                <ul className="mt-3 list-disc space-y-2 pl-5">
                                  {item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                                </ul>
                              )}
                            </div>
                          </details>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </section>
          );
        })}

        <section className="panel p-7 sm:p-10">
          <div className="section-heading !mb-0">
            <div>
              <span className="kicker !text-[var(--cry-accent-magenta)]">Working together</span>
              <h2 className="section-title">
                Have a system that needs to make sense to real people?
              </h2>
            </div>
            <p>
              Client material appears here only after explicit case-safe
              review. Engagement context is stated with each study.
            </p>
          </div>
          <div className="hero-actions">
            <Link href="/professional/inquiry" className="button">
              Start a conversation
            </Link>
            <Link
              href="/professional/contact"
              className="button secondary !border-[var(--cry-accent-magenta)]"
            >
              Contact the studio
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}

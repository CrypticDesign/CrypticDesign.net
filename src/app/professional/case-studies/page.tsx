import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PlayerDock from "@/components/PlayerDock";
import CaseStudyGallery from "@/components/CaseStudyGallery";

export const metadata: Metadata = {
  title: "Case Studies",
  alternates: { canonical: "/professional/case-studies" },
  description:
    "Selected Cryptic Design work — problem, approach, craft, outcome.",
};

// CRY-344 item 4: content + imagery migrated from the legacy services and
// portfolio pages. Rights confirmed by Robert 2026-07-20.
type Shot = { src: string; alt: string; caption: string };
type CaseStudy = {
  slug: string;
  title: string;
  years: string;
  engagement: string;
  discipline: string;
  accent: "magenta" | "cyan" | "gold" | "green";
  hero: { src: string; alt: string };
  problem: string;
  approach: string;
  craft: string;
  outcome: string;
  shots: Shot[];
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
    slug: "wellsky",
    title: "WellSky — Enterprise Health Portfolio",
    years: "2019–2020",
    engagement: "Senior User Experience Designer within WellSky's engineering organization",
    discipline: "Enterprise UX / design systems",
    accent: "green",
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
    slug: "rise-to-power",
    title: "Star Wars: Rise to Power",
    years: "2018",
    engagement: "UI/UX design at Electronic Arts, in collaboration with Lucasfilm",
    discipline: "Mobile strategy UI / franchise systems",
    accent: "gold",
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
  magenta: "#ed00a8",
  cyan: "#00e5ff",
  gold: "#ffd400",
  green: "#00f0a8",
} as const;

export default function CaseStudiesPage() {
  return (
    <main>
      <section className="visual-hero">
        <div className="visual-hero__image">
          <Image
            src="/images/case-studies/humankind-hero.jpg"
            alt="Console strategy interface design work by Cryptic Design"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="visual-hero__wash" />
        <div className="visual-hero__content">
          <div className="signal-rail text-[#ed00a8]" />
          <span className="kicker !text-[#ed00a8]">
            Selected work / problem → approach → craft → outcome
          </span>
          <h1 className="display-title">
            Complex systems, made clear enough to play, work, and trust.
          </h1>
          <p>
            Four engagements across console strategy, virtual reality training,
            enterprise healthcare, and mobile franchise games — each one a
            problem of making dense systems legible under real constraints.
          </p>
          <div className="hero-actions">
            <Link href="/professional/inquiry" className="button">
              Start a conversation
            </Link>
            <Link
              href="/professional"
              className="button secondary !border-[#ed00a8]"
            >
              Professional Studio
            </Link>
          </div>
        </div>
      </section>

      <div className="shell page-stack">
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

              <CaseStudyGallery
                shots={cs.shots}
                accent={cs.accent}
                accentHex={hex}
                studyTitle={cs.title}
              />
            </section>
          );
        })}

        <section className="panel p-7 sm:p-10">
          <div className="section-heading !mb-0">
            <div>
              <span className="kicker !text-[#ed00a8]">Working together</span>
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
              className="button secondary !border-[#ed00a8]"
            >
              Contact the studio
            </Link>
          </div>
        </section>

        <PlayerDock />
      </div>
    </main>
  );
}

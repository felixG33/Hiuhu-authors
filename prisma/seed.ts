import { PrismaClient, Role, ContentType, ContentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting HIUHU database seeding (Individual Author Mode)...");

  // 1. Author User & SUPER_ADMIN (HIUHU)
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@hiuhu.org").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword2026!";
  const adminName = "HIUHU";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: Role.SUPER_ADMIN,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Author & Super Admin established: ${superAdmin.email} (${superAdmin.name})`);

  // 2. Individual Author Profile for HIUHU
  const authorHIUHU = await prisma.authorProfile.upsert({
    where: { userId: superAdmin.id },
    update: {
      name: "HIUHU",
      slug: "hiuhu",
      bio: "HIUHU is an author, poet, and literary essayist exploring memory, architectural stillness, and the human spirit across long-form essays, poetry, and contemplative fiction. Based between London and Kyoto.",
      location: "London & Kyoto",
      website: "https://hiuhu.org",
      twitter: "@hiuhupress",
      instagram: "@hiuhu_press",
      genres: "Poetry, Literary Essays, Speculative Fiction, Poetics",
      isFeatured: true,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    },
    create: {
      userId: superAdmin.id,
      name: "HIUHU",
      slug: "hiuhu",
      bio: "HIUHU is an author, poet, and literary essayist exploring memory, architectural stillness, and the human spirit across long-form essays, poetry, and contemplative fiction. Based between London and Kyoto.",
      location: "London & Kyoto",
      website: "https://hiuhu.org",
      twitter: "@hiuhupress",
      instagram: "@hiuhu_press",
      genres: "Poetry, Literary Essays, Speculative Fiction, Poetics",
      isFeatured: true,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    },
  });

  // 3. Categories
  const categoriesData = [
    { name: "Literary Essays", slug: "literary-essays", description: "Critical reflections and meditative non-fiction.", accentColor: "#9e4827" },
    { name: "Poetics & Verse", slug: "poetics-and-verse", description: "Poems, elegies, and structural verse.", accentColor: "#7d3419" },
    { name: "Short Fiction", slug: "short-fiction", description: "Narratives of character, place, and moral tension.", accentColor: "#3f496c" },
    { name: "Philosophical Inquiry", slug: "philosophical-inquiry", description: "Explorations into aesthetics, time, and consciousness.", accentColor: "#2a3147" },
    { name: "Memoir & Dispatches", slug: "memoir-and-dispatches", description: "First-person testimonies and literary travelogues.", accentColor: "#b29e76" },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 4. Tags
  const tagsData = [
    { name: "Solitude", slug: "solitude" },
    { name: "Metaphor", slug: "metaphor" },
    { name: "Memory", slug: "memory" },
    { name: "City & Shadow", slug: "city-and-shadow" },
    { name: "Coastline", slug: "coastline" },
    { name: "Craft of Writing", slug: "craft-of-writing" },
  ];

  const tags: Record<string, any> = {};
  for (const tag of tagsData) {
    tags[tag.slug] = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // 5. Books by HIUHU
  await prisma.book.upsert({
    where: { slug: "the-silence-of-shores" },
    update: {
      authorId: authorHIUHU.id,
    },
    create: {
      title: "The Silence of Shores",
      slug: "the-silence-of-shores",
      description: "A sweeping meditation on northern estuaries and forgotten lighthouses. Tracing the psychological contours of seclusion, weaving lyric poetry and historical dispatches into an unforgettable tapestry.",
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
      isbn: "978-0-987654-32-1",
      publisher: "HIUHU Press",
      publicationDate: new Date("2025-11-14"),
      genre: "Poetry & Lyric Essay",
      pages: 228,
      buyUrl: "https://hiuhu.org/catalog/silence-of-shores",
      isFeatured: true,
      authorId: authorHIUHU.id,
    },
  });

  await prisma.book.upsert({
    where: { slug: "chronicles-of-the-clocktower" },
    update: {
      authorId: authorHIUHU.id,
    },
    create: {
      title: "Chronicles of the Clocktower",
      slug: "chronicles-of-the-clocktower",
      description: "Set in a labyrinthine Central European metropolis, a horologist inherits a manuscript whose chapters alter the physical passage of dusk. A masterclass in philosophical suspense and temporal mystery.",
      cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
      isbn: "978-1-543210-98-7",
      publisher: "HIUHU Editions",
      publicationDate: new Date("2026-03-22"),
      genre: "Literary Fiction",
      pages: 384,
      buyUrl: "https://hiuhu.org/catalog/clocktower",
      isFeatured: true,
      authorId: authorHIUHU.id,
    },
  });

  // 6. Content Items by HIUHU
  // Article 1
  await prisma.contentItem.upsert({
    where: { slug: "the-lost-cadence-of-prose" },
    update: {
      authorId: authorHIUHU.id,
    },
    create: {
      title: "The Lost Cadence of Prose: On Rereading Woolf and Sebald",
      slug: "the-lost-cadence-of-prose",
      excerpt: "Why the modern sentence has surrendered its musical breath, and how deliberate syntactic cadence can restore emotional gravity to long-form non-fiction.",
      content: `The modern sentence has grown breathlessly short. Under the relentless pressure of instant transmission and accelerated consumption, our prose has been engineered for velocity rather than resonance. Yet literature has never been merely an instrument of information transfer; it is, first and foremost, a choreography of sound and silence.

When Virginia Woolf sat before the tall standing desk in Rodmell, she attuned her ear to what she called the rhythm beneath words: "A sight, an emotion, creates this wave in the mind, long before it makes words to fit it." The sentence did not commence with grammar; it began as an oceanic swell. To encounter Woolf's prose is to surrender to that pulse—the subtle subordination of clauses, the parenthetical hesitations, the triumphant cadence that lands with the quiet certainty of falling snow.

Consider, too, the meandering wanderings of W. G. Sebald in *The Rings of Saturn*. His sentences stretch across entire pages, carrying the reader through Suffolk heathlands, seventeenth-century silkworm cultivation, and the ruins of European memory. There is no anxiety of speed. Sebald trusts that the patient mind seeks not a summary, but an immersion.

To write with cadence today is an act of quiet rebellion. It demands that we ask of every sentence not merely: *Is this concise?* but rather: *Does it ring true in the ear of the spirit?*`,
      coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200",
      type: ContentType.ARTICLE,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2026-08-10"),
      isFeatured: true,
      readingTimeMinutes: 5,
      authorId: authorHIUHU.id,
      categoryId: categories["literary-essays"].id,
      seoTitle: "The Lost Cadence of Prose — Essays by HIUHU",
      seoDescription: "An exploration into sentence musicality, Virginia Woolf, and the power of slow literary rhythm.",
      tags: {
        create: [
          { tag: { connect: { id: tags["craft-of-writing"].id } } },
          { tag: { connect: { id: tags["solitude"].id } } },
        ],
      },
    },
  });

  // Poem 1 (Poetry preserves intentional line breaks)
  await prisma.contentItem.upsert({
    where: { slug: "canticle-for-an-empty-harbor" },
    update: {
      authorId: authorHIUHU.id,
    },
    create: {
      title: "Canticle for an Empty Harbor",
      slug: "canticle-for-an-empty-harbor",
      excerpt: "The bell buoys toll their copper grief / Across the salt and broken reef...",
      content: `The bell buoys toll their copper grief
Across the salt and broken reef,
Where every tide returns alone,
To scour the memory from the stone.

No sail unbinds the morning fog,
No lantern marks the harbor log;
Only the gulls in wheeling arc
Draw compass circles through the dark.

What was surrendered to the deep
We did not lose, nor did we keep:
A knot untied beneath the spray,
A name the cold water took away.

Stand by the pier when daylight dies,
And watch the gray Atlantic rise—
It does not ask what ship you were,
Only what wind has brought you here.`,
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
      type: ContentType.POEM,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2026-09-02"),
      isFeatured: true,
      readingTimeMinutes: 2,
      authorId: authorHIUHU.id,
      categoryId: categories["poetics-and-verse"].id,
      seoTitle: "Canticle for an Empty Harbor — Poem by HIUHU",
      seoDescription: "A maritime elegy on tides, loss, and the eternal Atlantic shore.",
      tags: {
        create: [
          { tag: { connect: { id: tags["coastline"].id } } },
          { tag: { connect: { id: tags["solitude"].id } } },
        ],
      },
    },
  });

  // Story 1
  await prisma.contentItem.upsert({
    where: { slug: "the-cartographer-of-dusk" },
    update: {
      authorId: authorHIUHU.id,
    },
    create: {
      title: "The Cartographer of Dusk",
      slug: "the-cartographer-of-dusk",
      excerpt: "Every evening at five, Monsieur Delacroix drew the streets that existed only when the gas lamps began to flicker.",
      content: `Every evening at five, when the bells of Saint-Médard finished their mournful counting of the hour, Monsieur Delacroix unlocked the cedar drawer where he kept his compasses.

He was not an ordinary mapmaker. The municipal archives employed surveyors for sewers and water pipes, and men with tripod theodolites to determine property boundaries. Delacroix's contract, signed forty years earlier under an extinct ministry, carried a single enigmatic mandate: *To chart the city between the setting of the sun and the settling of true night.*

The inhabitants of the district believed that twilight was simply a transition—a dimming of light, like a lamp wick turned down. Delacroix knew better. Twilight was a physical territory. In those twenty-seven minutes between purple and black, certain alleyways elongated by forty paces; dead-ends dissolved into damp courtyards that no daylight surveyor had ever witnessed; and the iron bridges over the canal leaned toward each other like tired conspirators.

On the third Tuesday of November, he found an arched passage behind the Rue des Poissonniers that bore no name. A faint scent of dried quinces lingered in the cold draft. Delacroix dipped his crow-quill into sepia ink and began to draw.`,
      coverImage: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1200",
      type: ContentType.STORY,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2026-09-18"),
      isFeatured: true,
      readingTimeMinutes: 6,
      authorId: authorHIUHU.id,
      categoryId: categories["short-fiction"].id,
      seoTitle: "The Cartographer of Dusk — Short Story by HIUHU",
      seoDescription: "A tale of a forgotten mapmaker charting the phantom architecture of Paris at twilight.",
      tags: {
        create: [
          { tag: { connect: { id: tags["city-and-shadow"].id } } },
          { tag: { connect: { id: tags["memory"].id } } },
        ],
      },
    },
  });

  // 7. Navigation Items (Clean, focused for individual author)
  await prisma.navigationItem.deleteMany({});

  const navItems = [
    { label: "Books", path: "/books", location: "HEADER", order: 1 },
    { label: "Poetry", path: "/poems", location: "HEADER", order: 2 },
    { label: "Essays", path: "/articles", location: "HEADER", order: 3 },
    { label: "Stories", path: "/stories", location: "HEADER", order: 4 },
    { label: "About", path: "/about", location: "HEADER", order: 5 },
    { label: "Contact", path: "/contact", location: "HEADER", order: 6 },
  ];

  for (const item of navItems) {
    await prisma.navigationItem.create({ data: item });
  }

  // 8. Site Settings
  await prisma.siteSetting.upsert({
    where: { key: "site_name" },
    update: { value: "HIUHU" },
    create: {
      key: "site_name",
      value: "HIUHU",
      description: "Author Platform Name",
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "site_tagline" },
    update: { value: "Where Voices Echo Through Time" },
    create: {
      key: "site_tagline",
      value: "Where Voices Echo Through Time",
      description: "Default Author Motto",
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "site_description" },
    update: { value: "The official literary sanctuary and personal folio of author and poet HIUHU." },
    create: {
      key: "site_description",
      value: "The official literary sanctuary and personal folio of author and poet HIUHU.",
      description: "Author Website Description",
    },
  });

  console.log("🎉 Seeding completed successfully for Author HIUHU!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

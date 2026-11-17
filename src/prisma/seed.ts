import { db } from "./db";

export const DEMO_BOOKS = [
    {
        id: 1,
        title: "The Dead Daffodil",
        genre: "Mysterious",
        author: "Eleanor Vance",
        coverColor: "#3D2B1F",
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2023,
        language: "English",
        pages: 280,
    },
    {
        id: 2,
        title: "Legend of the Lost Realm",
        genre: "Adventure",
        author: "Arthur Pendelton",
        coverColor: "#1A3A2A",
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2022,
        language: "English",
        pages: 350,
    },
    {
        id: 3,
        title: "The Silent Voices",
        genre: "Drama",
        author: "Clara Oswald",
        coverColor: "#3A2A4A",
        coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2024,
        language: "English",
        pages: 310,
    },
    {
        id: 4,
        title: "A Change Encounter",
        genre: "Romance",
        author: "Julian Thorne",
        coverColor: "#4A2A2A",
        coverImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2021,
        language: "English",
        pages: 245,
    },
    {
        id: 5,
        title: "The Corpse in the Veil",
        genre: "Thriller",
        author: "Victor Vance",
        coverColor: "#2C1A1A",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2023,
        language: "English",
        pages: 390,
    },
    {
        id: 6,
        title: "Touch of Terror",
        genre: "Horror",
        author: "Edgar Black",
        coverColor: "#8B0000",
        coverImage: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2020,
        language: "English",
        pages: 295,
    },
    {
        id: 7,
        title: "The Shattered Corpse",
        genre: "Thriller",
        author: "Marcus Sterling",
        coverColor: "#2A3A4A",
        coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2024,
        language: "English",
        pages: 410,
    },
    {
        id: 8,
        title: "Embrace Your Journey",
        genre: "Self-help",
        author: "Maya Lin",
        coverColor: "#2A4A3A",
        coverImage: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=600&auto=format&fit=crop",
        publishedYear: 2023,
        language: "English",
        pages: 215,
    },
];

export const DEMO_CHAPTERS: Array<{
    bookId: number;
    chapterNum: number;
    title: string;
    content: string;
}> = [
    // Book 1: The Dead Daffodil
    {
        bookId: 1,
        chapterNum: 1,
        title: "Chapter 1: The Withered Stem",
        content:
            "Rain struck the windowpane of Blackwood Manor in steady, rhythmic taps. Detective Vance drew his coat tighter as he inspected the solitary flower lying across the velvet armchair. It was a golden daffodil, oddly preserved despite the chill in the air. Yet something about its placement felt deliberate, a silent signature left behind by an unseen visitor.",
    },
    {
        bookId: 1,
        chapterNum: 2,
        title: "Chapter 2: Shadows in the Conservatory",
        content:
            "The glass walls of the conservatory shimmered beneath the pale moonlight. A faint scent of damp soil hung in the air as Vance pressed forward, his lantern casting long shadows against the marble statues. He paused near the iron gate; a fresh set of footprints led straight into the darkened garden beyond.",
    },
    {
        bookId: 1,
        chapterNum: 3,
        title: "Chapter 3: The Forgotten Letter",
        content:
            "Beneath the floorboards of the grand library, Vance uncovered a sealed leather journal bound with copper wire. The pages were yellowed with time, but the ink remained sharp. 'If you are reading this,' the first entry began, 'then the secret of the manor has finally woken from its slumber.'",
    },

    // Book 2: Legend of the Lost Realm
    {
        bookId: 2,
        chapterNum: 1,
        title: "Chapter 1: Map of Eldoria",
        content:
            "The parchment was brittle with age, its edges singed by sea salt and old fires. Arthur held it up against the lantern flame, watching the faded ink lines reveal the contours of the Forgotten Isles. Legends spoke of a realm hidden beneath the tides, waiting for a worthy voyager.",
    },
    {
        bookId: 2,
        chapterNum: 2,
        title: "Chapter 2: Through the Whisper Mountains",
        content:
            "Cold winds howled through the narrow granite pass. Each step forward required immense resolve as snow blinded the expedition party. Yet high above the ridge, the faint glimmer of the Ancient Beacon signaled that they were nearing their destination.",
    },
    {
        bookId: 3,
        chapterNum: 3,
        title: "Chapter 3: The Citadel of Sunken Gold",
        content:
            "As the mist cleared at daybreak, the colossal stone pillars of Eldoria emerged from the valley basin. Towers carved from white marble glistened under the morning sun, untouched by centuries of human isolation.",
    },

    // Book 3: The Silent Voices
    {
        bookId: 3,
        chapterNum: 1,
        title: "Chapter 1: Echoes of the Past",
        content:
            "Clara stood at the window watching evening settle across the city skyline. In her hands she held three unopened letters from a past she had tried desperately to forget. Each envelope bore a stamp from her hometown, carrying memories she wasn't sure she was ready to face.",
    },
    {
        bookId: 3,
        chapterNum: 2,
        title: "Chapter 2: Unspoken Truths",
        content:
            "Family gatherings at the old estate had always been quiet affairs, but tonight the silence felt heavy with unspoken admissions. Across the long dining table, eyes met and quickly looked away, keeping secrets that had endured for over twenty years.",
    },

    // Book 4: A Change Encounter
    {
        bookId: 4,
        chapterNum: 1,
        title: "Chapter 1: Coffee and Rain",
        content:
            "The brass bell above the café door chimed softly as Julian stepped inside to escape the sudden downpour. Shaking the raindrops from his coat, he caught sight of a woman sitting by the window, engrossed in a worn leather notebook.",
    },
    {
        bookId: 4,
        chapterNum: 2,
        title: "Chapter 2: Shared Umbrellas",
        content:
            "Walking together beneath a single canopy of black nylon, the rain seemed less like a nuisance and more like a quiet sanctuary. They talked of simple things—favorite books, autumn evenings, and the unexpected turn of events that had brought them together.",
    },

    // Book 5: The Corpse in the Veil
    {
        bookId: 5,
        chapterNum: 1,
        title: "Chapter 1: The Foggy Pier",
        content:
            "Midnight arrived across the docks like a shroud. Victor adjusted his collar against the biting sea breeze as a lone figure emerged from behind the warehouse stacks, holding a briefcase tight against his chest.",
    },
    {
        bookId: 5,
        chapterNum: 2,
        title: "Chapter 2: Midnight Interrogation",
        content:
            "The basement room was stark, illuminated by a single overhead bulb that hummed softly. Victor leaned over the wooden table, staring into the suspect's eyes. 'The veil is lifting,' he warned quietly. 'Tell me what happened at the docks.'",
    },

    // Book 6: Touch of Terror
    {
        bookId: 6,
        chapterNum: 1,
        title: "Chapter 1: The Old Clocktower",
        content:
            "The bell in the abandoned clocktower rang thirteen times into the midnight air. Edgar froze on the cobblestone street as a bone-chilling gust of wind swept through the alleyways, carrying a sound like faint footsteps behind him.",
    },
    {
        bookId: 6,
        chapterNum: 2,
        title: "Chapter 2: Whispers Behind the Walls",
        content:
            "Rhythmic scratching reverberated from within the Victorian wallpaper. Edgar raised his candle higher, watching the shadows dance across the hallway. The temperature in the room dropped sharply with every passing second.",
    },

    // Book 7: The Shattered Corpse
    {
        bookId: 7,
        chapterNum: 1,
        title: "Chapter 1: Crime at Midnight",
        content:
            "Sirens wailed in the distance as Marcus stepped past the yellow police tape into the alleyway. Rain glinted on the pavement beneath the neon neon signs of the district. The crime scene was chaotic, but Marcus focused on a single clue near the curb.",
    },
    {
        bookId: 7,
        chapterNum: 2,
        title: "Chapter 2: The Missing Ledger",
        content:
            "Searching the victim's office vault revealed a hidden steel compartment behind the bookcase. The lock had been picked with expert precision, and the ledger containing the syndicate's financial records was gone.",
    },

    // Book 8: Embrace Your Journey
    {
        bookId: 8,
        chapterNum: 1,
        title: "Chapter 1: Finding Your Inner Anchor",
        content:
            "Life brings constant waves of change and unexpected challenges. Finding peace does not mean stopping the stormy seas; it means grounding yourself so firmly that no wind can sweep away your purpose.",
    },
    {
        bookId: 8,
        chapterNum: 2,
        title: "Chapter 2: The Habit of Gratitude",
        content:
            "Practicing gratitude daily transforms how we perceive our circumstances. When we focus our awareness on the gifts already present in our lives, scarcity gives way to abundance and clarity.",
    },
    {
        bookId: 8,
        chapterNum: 3,
        title: "Chapter 3: Stepping into Purpose",
        content:
            "Your journey is uniquely yours to shape. Taking small, consistent actions aligned with your values builds momentum and unlocks possibilities you might never have imagined.",
    },
];

export async function seedBooks() {
    console.log("Seeding demo books...");
    for (const book of DEMO_BOOKS) {
        const existing = await db.orm.public.Book.where({ id: book.id }).first();
        if (!existing) {
            await db.orm.public.Book.create(book);
        } else {
            await db.orm.public.Book.where({ id: book.id }).update({
                title: book.title,
                genre: book.genre,
                author: book.author,
                coverColor: book.coverColor,
                coverImage: book.coverImage,
                publishedYear: book.publishedYear,
                language: book.language,
                pages: book.pages,
            });
        }
    }
    console.log("Demo books seeded successfully.");

    console.log("Seeding demo chapters...");
    for (const ch of DEMO_CHAPTERS) {
        const existingChapter = await db.orm.public.Chapter.where({
            bookId: ch.bookId,
            chapterNum: ch.chapterNum,
        }).first();

        if (!existingChapter) {
            await db.orm.public.Chapter.create(ch);
        } else {
            await db.orm.public.Chapter.where({ id: existingChapter.id }).update({
                title: ch.title,
                content: ch.content,
            });
        }
    }
    console.log("Demo chapters seeded successfully.");
}

if (require.main === module) {
    seedBooks().catch((err) => {
        console.error("Failed to seed books and chapters:", err);
        process.exit(1);
    });
}

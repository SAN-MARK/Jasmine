import { Book, JournalEntry } from './types';

export const BOOKS_DATA: Book[] = [
  {
    id: 'mask-of-happiness',
    title: 'The Mask of Happiness',
    category: 'AUTHOR',
    snippet: 'An exploration of human emotions and the facades we wear in a modern world. A deeply personal narrative journey.',
    abstract: "In a world that demands persistent brightness, 'The Mask of Happiness' examines the quiet, sacred corners of human sadness, vulnerability, and authenticity. It is an exploration of how we construct our social self and the silent relief of letting the mask fall away, finding true connection in our shared imperfections.",
    linkText: 'Read Abstract',
    iconName: 'auto_stories',
    pages: [
      "CHAPTER I: THE PORCELAIN FACE\n\nWe begin our lives as mirrors, reflecting the light cast upon us. But as the seasons shift, we learn to craft a second face—one of durable porcelain, unyielding to winter winds or sudden storms. We call this face 'happiness'. It is polite, it is safe, and it is exhausting. We wear it to dinners, in meetings, and across our digital profiles.\n\nYet, the true magic of human intimacy lies not in the perfection of the porcelain, but in its hairline cracks. For it is through those tiny, unpolished fractures that our actual warmth escapes and reaches another soul. In this narrative exploration, we examine why we hide, and what beauty awaits us when we finally dare to let the mask slip.",
      "CHAPTER II: THE COZY COOLDOWN\n\nTo be persistently bright is to deny the soil its seasonal rain. We forget that the most fruitful gardens grow in the cool shade of quiet reflection. In this chapter, we explore the sacred valleys of human sorrow—not as a pathology to be cured, but as a rich, fertile landscape to be honored.\n\nSlowing down the pursuit of happiness allows a quieter contentment to take root. It is the joy of simple tea, the comforting weight of a heavy wool blanket, and the silent understanding that we do not have to be 'fine' to be loved."
    ]
  },
  {
    id: 'foundation-chronicles',
    title: 'Foundation Chronicles',
    category: 'CONTENT',
    snippet: 'Documenting the impactful journeys at Marpu and InAmigos Foundations through storytelling and reports.',
    abstract: 'A collection of stories, narrative reports, and field notes capturing the transfigurative power of creative education. Documenting the collaborative workshops, art sessions, and community revivals across grassroots initiatives supported by Marpu and InAmigos Foundations.',
    linkText: 'View Portfolio',
    iconName: 'edit_square',
    pages: [
      "FIELD NOTES: THE WORKSHOPS OF MARPU\n\nIn the dusty, sunlit classrooms of our collaborative projects, we set up temporary tables for stories. To many, writing is a classroom chore; to these children, it was a sudden window. We handed out fresh notebooks, their pages smelling of wood pulp and promise.\n\nA child named Sai touched the empty page and whispered, 'Can this make my dreams stay forever?' Across the span of three weeks, he wrote a fable about a small paper boat that learned to navigate the monsoon rains by whispering secrets to the frogs. This is not just content—it is the architecture of confidence.",
      "THE EMPOWERED INK: INAMIGOS ALLIANCE\n\nOur creative education labs are designed to show that a story is the ultimate leveler. When a teenager from a marginalized settlement learns to structure their personal hurdles into a Hero's Journey, the hurdle ceases to be a prison; it becomes a threshold.\n\nThrough our documentary reports, we aim to build digital bridges. By publishing these chronicles, we invite readers to witness the immense resilience of young minds who, when given a pen, rewrite their destiny with outstanding clarity."
    ]
  },
  {
    id: 'whispers-of-the-sanctuary',
    title: 'Whispers of the Sanctuary',
    category: 'JOURNAL',
    snippet: 'A series of long-form essays on mindfulness, creativity, and the art of living intentionally.',
    abstract: 'A sensory diary of quiet living. Whispers of the Sanctuary is a continuous meditation on slowing down, tending to one\'s creative fire, finding rhythm in nature, and the high art of making coffee or ink on a rainy Tuesday morning.',
    linkText: 'Enter Archive',
    iconName: 'ink_pen',
    pages: [
      "MEDITATION I: THE KETTLE'S BREATH\n\nThere is a silent communion between the cold morning air and the first steam of the kettle. To watch the vapor rise, curl, and dissipate into the sunbeams is to learn the art of letting go. In these brief, boiling minutes, the mind is clear of deadlines and digital noise.\n\nWe must protect these small pockets of unoptimized time. When we brew our tea or grind our coffee with deliberate slowness, we reclaim our focus from the algorithms of urgency. The steam rises, and so does our presence.",
      "MEDITATION II: THE SENSORY WEIGHT OF PAPER\n\nA blank notebook carries the physical weight of unsaid things. When we press metal nib to cotton fibers, we are converting the fleeting electricity of thought into permanent, physical gravity.\n\nIn this essay, we celebrate the physical. The texture of heavy parchment, the warm smell of old bookstores, and the steady, rhythm of a fountain pen moving across the page. In a world of glass screens, paper remains our most faithful sanctuary."
    ]
  }
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'The Art of Slowing Down in a Rapid World',
    date: 'June 28, 2026',
    category: 'Mindfulness',
    snippet: 'Exploring how micro-moments of deliberate pauses can restore our creative clarity.',
    content: `We live in a culture that treats acceleration as a virtue. Every update is faster, every feed more dense, every day more packed with urgent noise. But creativity does not operate on high-frequency signals. It requires the slow, gentle resonance of quiet hours.

When we constantly rush, we only skim the surface of our minds. The deep, fertile ideas lie at the very bottom, untouched, waiting for the waters of our attention to settle. 

To slow down is not to produce less; it is to create with greater depth and intent. Try setting aside twenty minutes each morning—no screens, no targets—just watching the shadows lengthen or writing a single sentence on a piece of paper. You will be amazed at the clarity that returns to your craft.`,
    readTime: '4 min read'
  },
  {
    id: '2',
    title: 'Grassroots Stories: Writing as Community Medicine',
    date: 'May 14, 2026',
    category: 'Social Impact',
    snippet: 'Reflections on my collaborative workshops with Marpu and InAmigos.',
    content: `In my travel notes from last spring, one realization stands out: a community that cannot tell its own story is a community whose future is written by strangers.

Working alongside Marpu and InAmigos Foundations, our goal was never to teach children how to pass academic exams. It was to show them that their daily experiences—the dusty streets, the shared tea, the monsoon rains—are the stuff of literature.

When we sat in a circle and spoke about fear, hope, and dreams, the atmosphere shifted. By giving these children a safe space to write, we saw their confidence grow. Storytelling is more than expression; it is community medicine. It heals the invisible wounds of being overlooked.`,
    readTime: '6 min read'
  },
  {
    id: '3',
    title: 'Ink, Steam, and Solitude: My Morning Rituals',
    date: 'April 02, 2026',
    category: 'Creative Life',
    snippet: 'A look inside my sensory workstation and how I prep for a day of storytelling.',
    content: `My desk is a simple slab of reclaimed pine. On it sits a ceramic cup, a single fountain pen filled with walnut-brown ink, and a stack of rough-textured paper. This is my sanctuary.

Before a single word is typed or written, there is a ritual. I boil the water, watch the steam ascend in soft waves, and let the warmth of the mug seep into my hands. This sensory grounding is crucial.

Only then do I write. Some days yield a thousand words; other days, only a couple of lines that are immediately scratched out. But the ritual is the victory. It signals to the creative self that it is safe to emerge.`,
    readTime: '3 min read'
  }
];

export const INITIAL_CORRESPONDENCE: { name: string; email: string; story: string; timestamp: string; isPrivate: boolean }[] = [
  {
    name: 'Aarav Mehta',
    email: 'aarav@creativeminds.in',
    story: "Your essay 'The Kettle's Breath' has become my daily reminder to step away from my laptop. I now keep a physical notebook on my desk in Chennai, writing down three sights and sounds before starting work. Thank you for building this sanctuary.",
    timestamp: '2026-06-29T10:30:00.000Z',
    isPrivate: false
  },
  {
    name: 'Elena Rostova',
    email: 'elena.r@literarylink.org',
    story: 'I would love to collaborate on a series of storytelling workshops for young students. Your work with InAmigos is deeply inspiring. Sending warm wishes from a rainy café.',
    timestamp: '2026-06-28T14:45:00.000Z',
    isPrivate: true
  }
];

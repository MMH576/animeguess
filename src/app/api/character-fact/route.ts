import { NextResponse } from "next/server";

// Character appearance descriptions and hints
interface CharacterHint {
  appearance: string;
  ability: string;
  role: string;
  series: string;
}

// Detailed character fact database
const characterHints: Record<string, CharacterHint> = {
  "Monkey D. Luffy": {
    appearance: "Wears a straw hat and red vest",
    ability: "Has rubber-like stretching abilities",
    role: "Captain of the Straw Hat Pirates",
    series: "One Piece"
  },
  "Naruto Uzumaki": {
    appearance: "Wears orange and has whisker marks on face",
    ability: "Uses shadow clone jutsu techniques",
    role: "A ninja who dreams of becoming Hokage",
    series: "Naruto"
  },
  "Goku": {
    appearance: "Has spiky black hair and wears an orange gi",
    ability: "Can transform into different power levels",
    role: "One of the strongest fighters in the universe",
    series: "Dragon Ball"
  },
  "Vegeta": {
    appearance: "Has pointy black hair and often wears armor",
    ability: "Pride-filled warrior with incredible strength",
    role: "Rival and eventual ally to the main hero",
    series: "Dragon Ball"
  },
  "Eren Yeager": {
    appearance: "Dark hair and intense expression",
    ability: "Can transform into a powerful form",
    role: "Former soldier who fights for freedom",
    series: "Attack on Titan"
  },
  "Mikasa Ackerman": {
    appearance: "Has short black hair and wears a red scarf",
    ability: "Extremely skilled with blades and combat",
    role: "Protective and loyal fighter",
    series: "Attack on Titan"
  },
  "Levi Ackerman": {
    appearance: "Short stature with an undercut hairstyle",
    ability: "Known as humanity's strongest soldier",
    role: "Captain with exceptional combat skills",
    series: "Attack on Titan"
  },
  "Edward Elric": {
    appearance: "Blonde hair in a braid and red coat",
    ability: "Can perform alchemy without a transmutation circle",
    role: "Young alchemist searching for the philosopher's stone",
    series: "Fullmetal Alchemist"
  },
  "Alphonse Elric": {
    appearance: "Often seen in distinctive armor",
    ability: "Skilled alchemist with a gentle personality",
    role: "Younger brother with a unique condition",
    series: "Fullmetal Alchemist"
  },
  "Sasuke Uchiha": {
    appearance: "Dark hair with a serious expression",
    ability: "Has special red eyes with unique powers",
    role: "Skilled ninja seeking vengeance",
    series: "Naruto"
  },
  "Kakashi Hatake": {
    appearance: "Wears a mask and has silver hair",
    ability: "Known for copying techniques with his special eye",
    role: "Elite ninja who teaches younger ninjas",
    series: "Naruto"
  },
  "Itachi Uchiha": {
    appearance: "Has lines under his eyes and wears a cloak with red clouds",
    ability: "Master of illusion techniques",
    role: "Mysterious character with hidden motivations",
    series: "Naruto"
  },
  "Gon Freecss": {
    appearance: "Spiky green-tinted hair and usually smiling",
    ability: "Has incredible senses and determination",
    role: "Young hunter searching for his father",
    series: "Hunter x Hunter"
  },
  "Killua Zoldyck": {
    appearance: "Silver-white hair and cat-like eyes",
    ability: "Has lightning-fast reflexes and speed",
    role: "Former assassin with incredible potential",
    series: "Hunter x Hunter"
  },
  "Light Yagami": {
    appearance: "Clean-cut appearance with brown hair",
    ability: "Exceptional intelligence and planning skills",
    role: "Student with a secret double life",
    series: "Death Note"
  },
  "L Lawliet": {
    appearance: "Messy black hair with dark circles under eyes",
    ability: "Genius detective with unusual habits",
    role: "Mysterious figure trying to solve a case",
    series: "Death Note"
  },
  "Spike Spiegel": {
    appearance: "Tall with fluffy dark hair",
    ability: "Expert in martial arts and gunfighting",
    role: "Bounty hunter with a mysterious past",
    series: "Cowboy Bebop"
  },
  "Saitama": {
    appearance: "Bald head and simple expression",
    ability: "Can defeat enemies with a single punch",
    role: "Hero who feels unfulfilled despite strength",
    series: "One Punch Man"
  },
  "Tanjiro Kamado": {
    appearance: "Has a scar on forehead and wears hanafuda earrings",
    ability: "Enhanced sense of smell and swordsmanship",
    role: "Kind-hearted demon slayer on a mission",
    series: "Demon Slayer"
  },
  "Nezuko Kamado": {
    appearance: "Wears a bamboo muzzle and has pink eyes",
    ability: "Has unique abilities unlike others of her kind",
    role: "Protective sister who underwent a transformation",
    series: "Demon Slayer"
  },
  "Ash Ketchum": {
    appearance: "Wears a cap and has a small yellow companion",
    ability: "Skilled trainer who forms bonds with creatures",
    role: "Dreams of becoming the very best",
    series: "Pokémon"
  },
  "Pikachu": {
    appearance: "Yellow with red cheeks and a lightning-shaped tail",
    ability: "Can generate electricity from its body",
    role: "Loyal creature that refuses to evolve",
    series: "Pokémon"
  },
  "Ichigo Kurosaki": {
    appearance: "Orange spiky hair and often carries a large sword",
    ability: "Can see and fight invisible beings",
    role: "High school student with special powers",
    series: "Bleach"
  },
  "Zoro Roronoa": {
    appearance: "Green hair and carries three swords",
    ability: "Unique three-sword fighting style",
    role: "Swordsman with terrible sense of direction",
    series: "One Piece"
  },
  "Sanji Vinsmoke": {
    appearance: "Blonde hair covering one eye and suit",
    ability: "Powerful kick-based fighting style",
    role: "Chef who refuses to use hands in battle",
    series: "One Piece"
  },
  "Nico Robin": {
    appearance: "Dark hair and usually calm demeanor",
    ability: "Can sprout body parts on any surface",
    role: "Archaeologist searching for historical truth",
    series: "One Piece"
  },
  "Tobi": {
    appearance: "Wears an orange spiral mask",
    ability: "Mysterious powers and unpredictable behavior",
    role: "Character with a complex hidden identity",
    series: "Naruto"
  },
  "Rin Nohara": {
    appearance: "Has purple facial markings",
    ability: "Medical ninja with healing skills",
    role: "Important to multiple characters' backstories",
    series: "Naruto"
  },
  // Additional character entries
  "Midoriya Izuku": {
    appearance: "Green curly hair and freckles",
    ability: "Has inherited a powerful quirk",
    role: "Hero student working to master his abilities",
    series: "My Hero Academia"
  },
  "Bakugo Katsuki": {
    appearance: "Spiky blonde hair and intense expression",
    ability: "Creates explosions from his hands",
    role: "Competitive rival with a fierce personality",
    series: "My Hero Academia"
  },
  "Todoroki Shoto": {
    appearance: "Has half red and half white hair with a burn scar",
    ability: "Can control both ice and fire",
    role: "Powerful student with a troubled family history",
    series: "My Hero Academia"
  },
  "Zenitsu Agatsuma": {
    appearance: "Blonde hair and often scared expression",
    ability: "Incredibly fast when utilizing thunder techniques",
    role: "Cowardly friend who shows great power in critical moments",
    series: "Demon Slayer"
  },
  "Inosuke Hashibira": {
    appearance: "Wears a boar mask and has wild appearance",
    ability: "Incredibly flexible with unique sword style",
    role: "Wild and instinctual fighter with keen senses",
    series: "Demon Slayer"
  },
  "Roy Mustang": {
    appearance: "Dark hair and usually wears military uniform",
    ability: "Can create and control fire with a snap",
    role: "Military officer with ambitious goals",
    series: "Fullmetal Alchemist"
  },
  "Winry Rockbell": {
    appearance: "Blonde hair often with mechanical tools",
    ability: "Extremely skilled automail engineer",
    role: "Childhood friend and mechanical expert",
    series: "Fullmetal Alchemist"
  },
  "Hinata Hyuga": {
    appearance: "Dark hair with distinctive pale eyes",
    ability: "Can see through objects with special eye technique",
    role: "Shy ninja with growing confidence",
    series: "Naruto"
  },
  "Rock Lee": {
    appearance: "Bowl cut hair and thick eyebrows",
    ability: "Taijutsu master with incredible speed",
    role: "Hardworking ninja who can't use ninjutsu",
    series: "Naruto"
  },
  "Nami": {
    appearance: "Orange hair and often carries a staff",
    ability: "Expert navigator and weather manipulator",
    role: "Navigator who creates weather-based attacks",
    series: "One Piece"
  },
  "Tony Tony Chopper": {
    appearance: "Small reindeer with a blue nose and hat",
    ability: "Can transform into different forms",
    role: "Doctor with multiple transformation abilities",
    series: "One Piece"
  },
  "Franky": {
    appearance: "Blue hair and robotic body parts",
    ability: "Cyborg with various built-in weapons",
    role: "Shipwright with a modified body",
    series: "One Piece"
  },
  "Brook": {
    appearance: "Tall skeleton with an afro",
    ability: "Can separate soul from body and create ice effects",
    role: "Musician with a unique undead condition",
    series: "One Piece"
  },
  "Gohan": {
    appearance: "Similar to the main hero but with different hair",
    ability: "Has enormous hidden potential",
    role: "Scholar with incredible hidden power",
    series: "Dragon Ball"
  },
  "Piccolo": {
    appearance: "Green skin with antennae and cape",
    ability: "Can stretch limbs and regenerate body parts",
    role: "Former enemy turned mentor and ally",
    series: "Dragon Ball"
  },
  "Bulma": {
    appearance: "Blue hair and stylish clothing",
    ability: "Genius inventor and scientist",
    role: "Brilliant scientist who creates advanced technology",
    series: "Dragon Ball"
  },
  "Ryuk": {
    appearance: "Tall dark figure with unusual features",
    ability: "Can see lifespans and is invisible to most",
    role: "Observer with a taste for apples",
    series: "Death Note"
  }
};

// Anime series visual hints
const animeVisualHints: Record<string, string[]> = {
  "One Piece": [
    "Character has a distinctive scar",
    "Look for pirate-themed clothing or accessories",
    "This character is part of a famous pirate crew",
    "Character has an unusual physical ability",
    "Known for a unique fighting style",
    "This character is searching for a legendary treasure",
    "Character may have eaten a Devil Fruit",
    "This character has a bounty on their head"
  ],
  "Naruto": [
    "Character wears a headband with a symbol",
    "Look for distinctive facial markings",
    "Character might be from a famous ninja clan",
    "Has a special eye technique",
    "Known for a signature jutsu (technique)",
    "Character is from a hidden village",
    "This character might have trained with a legendary ninja",
    "Look for symbols or marks representing their village"
  ],
  "Dragon Ball": [
    "Character has an unusual hair style or color",
    "Watch for distinctive martial arts clothing",
    "Character may have superhuman strength",
    "Known for energy-based attacks",
    "May change appearance during power-ups",
    "This character might be from an alien race",
    "Character trains under extreme conditions",
    "Look for a distinctive aura color when powering up"
  ],
  "Attack on Titan": [
    "Character wears military uniform with gear",
    "Has a serious or intense expression",
    "Character might have battle scars",
    "Associated with a specific military division",
    "Has survived traumatic events",
    "Character uses specialized equipment to move",
    "This character has fought giant humanoid enemies",
    "Look for regiment emblems on their uniform"
  ],
  "Fullmetal Alchemist": [
    "Character may have automail (mechanical limbs)",
    "Look for alchemical symbols or circles",
    "Might have a distinctive clap before using powers",
    "Character may wear gloves with symbols",
    "Part of the military or opposing forces",
    "This character understands the principle of equivalent exchange",
    "Character may have a connection to the philosopher's stone",
    "Look for State Alchemist pocket watches or emblems"
  ],
  "Pokémon": [
    "This is a brightly colored creature with special powers",
    "Character has distinctive clothing or hat",
    "May have a signature Pokémon partner",
    "Character is associated with a specific type of Pokémon",
    "Might have badges or special equipment",
    "This character participates in battles or contests",
    "Character might be a gym leader or trainer",
    "Look for devices used to capture or train creatures"
  ],
  "Demon Slayer": [
    "Character wears distinctive patterned clothing",
    "Has a unique sword with special abilities",
    "Character might have unusual eye colors",
    "Known for a special breathing technique",
    "May have visible scars or markings",
    "This character fights supernatural enemies",
    "Character might have survived a family tragedy",
    "Look for distinctive sword colors or patterns"
  ],
  "Death Note": [
    "Character has a meticulous or careful appearance",
    "May have an intense gaze or expression",
    "Character might have unusual sitting or standing posture",
    "Often seen thinking deeply or analyzing",
    "May carry or be associated with a notebook",
    "This character is involved in a battle of wits",
    "Character might hide their true intentions",
    "Look for signs of strategic thinking or planning"
  ],
  "Hunter x Hunter": [
    "Character might use a specialized weapon",
    "Known for a unique ability called 'Nen'",
    "Character has distinctive eyes or expression",
    "May belong to a famous family or organization",
    "Has undergone special training",
    "This character participates in dangerous tests or missions",
    "Character might be searching for something valuable",
    "Look for distinctive cards or badges they might carry"
  ],
  "My Hero Academia": [
    "Character might have a visible quirk (superpower)",
    "May wear a hero costume or uniform",
    "Character has a distinct appearance related to their powers",
    "Associated with a hero academy or villain group",
    "Known for a special super move",
    "This character attends a school for heroes",
    "Character might have a hero or villain name",
    "Look for distinctive costume designs reflecting their abilities"
  ],
  "Bleach": [
    "Character might carry a distinctive sword",
    "May wear black robes or white uniforms",
    "Character has abilities related to spirits",
    "Could have distinctive hair color or style",
    "Might transform their weapon for special attacks",
    "This character deals with supernatural spirits",
    "Character might belong to a special organization",
    "Look for symbols representing their division or rank"
  ],
  "Cowboy Bebop": [
    "Character has a stylish, noir-inspired appearance",
    "May carry weapons or tech from different eras",
    "Character might have a connection to space travel",
    "Often has a laid-back or cool demeanor",
    "Might have a distinctive ship or vehicle",
    "This character is involved in bounty hunting",
    "Character might have a jazz-inspired theme",
    "Look for retro-futuristic clothing or equipment"
  ],
  "One Punch Man": [
    "Character might wear a hero costume",
    "May have an over-the-top appearance or powers",
    "Character could have a very simple or elaborate design",
    "Associated with a hero ranking system",
    "Might display extreme power or abilities",
    "This character exists in a world of heroes and monsters",
    "Character might belong to the Hero Association",
    "Look for their hero rank or classification"
  ]
};

// Generic appearance hints that don't spoil identity
const genericAppearanceHints = [
  "Notice this character's distinctive hairstyle",
  "Look at the character's unique outfit or clothing",
  "This character has a recognizable facial feature",
  "Pay attention to any accessories or equipment",
  "This character has a memorable color scheme",
  "Notice any symbols or markings on their clothing",
  "This character's expression or pose is distinctive",
  "Look for any weapons or tools they might carry",
  "This character's body type or build is recognizable",
  "Pay attention to their eye color or design",
  "This character has unique clothing patterns",
  "Look for distinctive colors in their outfit",
  "Notice any special items they always carry",
  "This character has a unique silhouette",
  "Look for scars, markings, or other distinctive features",
  "This character has a unique color palette",
  "Notice any badges, emblems, or insignia they wear",
  "Look for unique jewelry or accessories",
  "This character has a distinctive stance or posture",
  "Pay attention to their footwear or gloves"
];

// Character abilities hints that don't reveal identity
const genericAbilityHints = [
  "This character has a unique fighting style",
  "Known for having special powers or abilities",
  "This character has trained extensively in their skills",
  "Has abilities that make them stand out from others",
  "This character possesses skills that few others have",
  "Known for a signature move or technique",
  "This character might transform or change form",
  "Has mastered a specific type of combat",
  "This character uses unusual weapons or tools",
  "Known for their intelligence or strategy",
  "This character has overcome personal limitations",
  "Has abilities that surprise their opponents",
  "This character might control elements or energy",
  "Known for quick reflexes or speed",
  "This character has incredible strength or endurance"
];

// Analyze name to guess anime series
function guessAnimeFromName(name: string): string | null {
  const nameLower = name.toLowerCase();
  
  // Common patterns that might indicate the series
  if (nameLower.includes("uzumaki") || nameLower.includes("uchiha") || nameLower.includes("hatake") || 
      nameLower.includes("naruto") || nameLower.includes("hyuga") || nameLower.includes("hokage")) {
    return "Naruto";
  }
  
  if (nameLower.includes("monkey") || nameLower.includes("luffy") || nameLower.includes("zoro") || 
      nameLower.includes("sanji") || nameLower.includes("piece") || nameLower.includes("straw hat")) {
    return "One Piece";
  }
  
  if (nameLower.includes("goku") || nameLower.includes("vegeta") || nameLower.includes("gohan") || 
      nameLower.includes("dragon") || nameLower.includes("saiyan") || nameLower.includes("ball")) {
    return "Dragon Ball";
  }
  
  if (nameLower.includes("midoriya") || nameLower.includes("bakugo") || nameLower.includes("todoroki") || 
      nameLower.includes("hero") || nameLower.includes("academia") || nameLower.includes("all might")) {
    return "My Hero Academia";
  }
  
  if (nameLower.includes("eren") || nameLower.includes("mikasa") || nameLower.includes("levi") || 
      nameLower.includes("yeager") || nameLower.includes("ackerman") || nameLower.includes("titan")) {
    return "Attack on Titan";
  }
  
  if (nameLower.includes("elric") || nameLower.includes("alphonse") || nameLower.includes("edward") || 
      nameLower.includes("fullmetal") || nameLower.includes("mustang") || nameLower.includes("alchemist")) {
    return "Fullmetal Alchemist";
  }
  
  if (nameLower.includes("tanjiro") || nameLower.includes("nezuko") || nameLower.includes("zenitsu") || 
      nameLower.includes("inosuke") || nameLower.includes("kamado") || nameLower.includes("demon") || 
      nameLower.includes("slayer") || nameLower.includes("hashira")) {
    return "Demon Slayer";
  }
  
  if (nameLower.includes("light") || nameLower.includes("yagami") || nameLower.includes("lawliet") || 
      nameLower.includes("ryuk") || nameLower.includes("death") || nameLower.includes("note")) {
    return "Death Note";
  }
  
  if (nameLower.includes("gon") || nameLower.includes("killua") || nameLower.includes("kurapika") || 
      nameLower.includes("leorio") || nameLower.includes("hunter") || nameLower.includes("freecss") || 
      nameLower.includes("zoldyck")) {
    return "Hunter x Hunter";
  }
  
  if (nameLower.includes("ichigo") || nameLower.includes("rukia") || nameLower.includes("aizen") || 
      nameLower.includes("bleach") || nameLower.includes("kurosaki") || nameLower.includes("kuchiki") || 
      nameLower.includes("shinigami")) {
    return "Bleach";
  }
  
  if (nameLower.includes("saitama") || nameLower.includes("genos") || nameLower.includes("punch") || 
      nameLower.includes("hero") || nameLower.includes("caped")) {
    return "One Punch Man";
  }
  
  // If no match found
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterName = searchParams.get("name");
  
  if (!characterName) {
    return NextResponse.json({ error: "Character name is required" }, { status: 400 });
  }
  
  console.log(`Fetching fact for: ${characterName}`);
  
  // Check if we have detailed hints for this character
  if (characterHints[characterName]) {
    const hint = characterHints[characterName];
    
    // Randomly select one of the hint types to keep it varied
    const hintTypes = ["appearance", "ability", "role"] as const;
    const selectedType = hintTypes[Math.floor(Math.random() * hintTypes.length)];
    
    return NextResponse.json({ fact: hint[selectedType] });
  }
  
  // Try to determine which anime series this character might be from
  const guessSeries = guessAnimeFromName(characterName);
  if (guessSeries && animeVisualHints[guessSeries]) {
    // Return a random hint for this anime series
    const hints = animeVisualHints[guessSeries];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    return NextResponse.json({ fact: randomHint });
  }
  
  // If we can't determine the series, alternate between appearance and ability hints
  const useAbilityHint = Math.random() > 0.5;
  const hintsArray = useAbilityHint ? genericAbilityHints : genericAppearanceHints;
  const randomHint = hintsArray[Math.floor(Math.random() * hintsArray.length)];
  
  return NextResponse.json({ fact: randomHint });
} 
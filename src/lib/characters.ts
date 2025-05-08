export interface Character {
  id: number;
  name: string;
  anime: string;
  image: string;
}

// Local character data (legacy)
export const characters: Character[] = [
  {
    id: 1,
    name: "Naruto Uzumaki",
    anime: "Naruto",
    image: "/images/naruto.png",
  },
  {
    id: 2,
    name: "Luffy",
    anime: "One Piece",
    image: "/images/luffy.png",
  },
  {
    id: 3,
    name: "Tobi",
    anime: "Naruto",
    image: "/images/tobi.png",
  },
  {
    id: 4,
    name: "Rin Nohara",
    anime: "Naruto",
    image: "/images/rin.png",
  }
];

// Character names for AniList API search
export const anilistCharacterPool: string[] = [
  // Original characters
  "Naruto Uzumaki",
  "Monkey D. Luffy",
  "Tobi",
  "Rin Nohara",
  // Additional popular anime characters
  "Eren Yeager",
  "Mikasa Ackerman",
  "Goku",
  "Vegeta",
  "Ichigo Kurosaki",
  "Sasuke Uchiha",
  "Hinata Hyuga",
  "Sakura Haruno",
  "Kakashi Hatake",
  "Itachi Uchiha",
  "Zoro Roronoa",
  "Nami",
  "Nico Robin",
  "Levi Ackerman",
  "Armin Arlert",
  "Edward Elric",
  "Alphonse Elric",
  "Roy Mustang",
  "Gon Freecss",
  "Killua Zoldyck",
  "Kurapika",
  "Leorio Paradinight",
  "Saitama",
  "Genos",
  "Light Yagami",
  "L Lawliet",
  "Ryuk",
  "Nezuko Kamado",
  "Zenitsu Agatsuma",
  "Inosuke Hashibira",
  "Giyuu Tomioka",
  "Jotaro Kujo",
  "Dio Brando",
  "Joseph Joestar",
  "Ash Ketchum",
  "Pikachu",
  "Misty",
  "Brock",
  "Spike Spiegel",
  "Faye Valentine",
  "Jet Black",
  "Natsu Dragneel",
  "Lucy Heartfilia",
  "Gray Fullbuster",
  "Erza Scarlet",
  "Maka Albarn",
  "Soul Eater Evans"
  // Total: 48 characters
]; 
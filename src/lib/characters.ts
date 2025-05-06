export interface Character {
  id: number;
  name: string;
  anime: string;
  image: string;
}

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
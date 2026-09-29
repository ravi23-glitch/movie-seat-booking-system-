export interface SeedMovie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  durationMin: number;
  rating: number;
  genre: string;
  releaseDate: string;
}

export interface SeedTheatre {
  id: string;
  name: string;
  location: string;
  city: string;
}

export interface SeedScreen {
  id: string;
  theatreId: string;
  screenNumber: number;
  totalSeats: number;
  rows: string[];
  seatsPerRow: number;
}

export const INITIAL_MOVIES: SeedMovie[] = [
  {
    id: "movie-1",
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    durationMin: 166,
    rating: 8.8,
    genre: "Sci-Fi / Adventure",
    releaseDate: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "movie-2",
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, examining the moral, ethical, and geopolitical fallout of the Manhattan Project.",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
    durationMin: 180,
    rating: 8.9,
    genre: "Drama / History / Biography",
    releaseDate: "2023-07-21T00:00:00.000Z",
  },
  {
    id: "movie-3",
    title: "Spider-Man: Across the Spider-Verse",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
    posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
    durationMin: 140,
    rating: 8.7,
    genre: "Animation / Action / Adventure",
    releaseDate: "2023-06-02T00:00:00.000Z",
  },
  {
    id: "movie-4",
    title: "Interstellar: 10th Anniversary IMAX",
    description: "When Earth becomes increasingly uninhabitable, a team of courageous explorers and NASA pilots travel through a newly discovered wormhole in search of a new home for human civilization.",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80",
    durationMin: 169,
    rating: 8.9,
    genre: "Sci-Fi / Drama / Adventure",
    releaseDate: "2024-11-01T00:00:00.000Z",
  },
];

export const INITIAL_THEATRES: SeedTheatre[] = [
  {
    id: "theatre-1",
    name: "Starlight IMAX Cinema",
    location: "5th Avenue Arts District, Pavilion 4",
    city: "Metropolis",
  },
  {
    id: "theatre-2",
    name: "CineVerse Luxury Multiplex",
    location: "Uptown Galleria Mall, 3rd Floor",
    city: "Silicon Valley",
  },
];

export const INITIAL_SCREENS: SeedScreen[] = [
  {
    id: "screen-1",
    theatreId: "theatre-1",
    screenNumber: 1,
    totalSeats: 64, // 8 rows x 8 seats
    rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
    seatsPerRow: 8,
  },
  {
    id: "screen-2",
    theatreId: "theatre-1",
    screenNumber: 2,
    totalSeats: 56, // 7 rows x 8 seats
    rows: ["A", "B", "C", "D", "E", "F", "G"],
    seatsPerRow: 8,
  },
  {
    id: "screen-3",
    theatreId: "theatre-2",
    screenNumber: 1,
    totalSeats: 60, // 6 rows x 10 seats
    rows: ["A", "B", "C", "D", "E", "F"],
    seatsPerRow: 10,
  },
];

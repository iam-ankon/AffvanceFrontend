import { Tour, User } from '@/lib/api/types';

const createAuthor = (id: number, firstName: string, lastName: string, email: string): User => ({
  id: id.toString(),
  username: email.split('@')[0].toLowerCase(),
  firstName,
  lastName,
  email,
  role: 'author',
  isVerified: true,
  createdAt: new Date(Date.now() - (100 - id) * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - (100 - id) * 86400000).toISOString(),
  lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString(),
  name: `${firstName} ${lastName}`,
  avatar: '/images/user-placeholder.png'
});

const authors: User[] = [
  createAuthor(1, 'Alex', 'Johnson', 'alex.johnson@example.com'),
  createAuthor(2, 'Sarah', 'Chen', 'sarah.chen@example.com'),
  createAuthor(3, 'Jamal', 'Williams', 'jamal.w@example.com'),
  createAuthor(4, 'Maria', 'Garcia', 'maria.g@example.com'),
  createAuthor(5, 'David', 'Kim', 'david.kim@example.com'),
  createAuthor(6, 'Laura', 'Schmidt', 'laura.schmidt@example.com'),
  createAuthor(7, 'Pedro', 'Alvarez', 'pedro.a@example.com'),
  createAuthor(8, 'Chloe', 'Dubois', 'chloe.d@example.com'),
  createAuthor(9, 'Nikhil', 'Patel', 'nikhil.patel@example.com'),
  createAuthor(10, 'Emma', 'Brown', 'emma.b@example.com')
];

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Spain',
  'South Korea',
  'Germany',
  'Brazil',
  'France',
  'India',
  'Australia',
  'Italy',
  'Poland'
];

const tourTypes = ['Tutorial', 'Guide', 'Article'];

export const mockBlogs: Tour[] = Array.from({ length: 100 }, (_, i) => {
  const author = authors[i % authors.length];
  const country = countries[i % countries.length];
  const tourType = tourTypes[i % tourTypes.length];
  const published = Math.random() > 0.1; // 90% published

  return {
    id: String(i + 1),
    title: `${tourType} #${i + 1}: ${['Next.js', 'React', 'TypeScript', 'Performance', 'Design'][i % 5]} Insights`,
    author,
    publishedDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    country,
    tourType,
    tourDuration: `${Math.floor(Math.random() * 5) + 1} days`,
    tourDescription: `This is a detailed description for the ${tourType.toLowerCase()} about ${['Next.js', 'React', 'TypeScript', 'Performance', 'Design'][i % 5]}.`,
    tourImage: '/images/tour-placeholder.jpg',
    words: Math.floor(Math.random() * 1500) + 800,
    published,
    status: published ? 'published' : 'draft'
  };
});

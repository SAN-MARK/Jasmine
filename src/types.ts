export type BookCategory = 'AUTHOR' | 'CONTENT' | 'JOURNAL';

export interface Book {
  id: string;
  title: string;
  category: BookCategory;
  snippet: string;
  abstract: string;
  linkText: string;
  iconName: 'auto_stories' | 'edit_square' | 'ink_pen';
  fullContent?: string;
  pages?: string[];
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  category: string;
  snippet: string;
  content: string;
  readTime: string;
}

export interface CorrespondenceMessage {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  story: string;
  isPrivate: boolean;
}

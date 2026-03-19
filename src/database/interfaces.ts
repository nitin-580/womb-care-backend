// Blog Interface
export interface Blog {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBlogInput = Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBlogInput = Partial<CreateBlogInput>;

// Common User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  weight: number;
  cycleRegularity: string;
  symptoms: string;
  country: string;
  source: string;
  createdAt: string;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

export interface RegistrationStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Database Adapter Interface
export interface DatabaseAdapter {
  createUser(user: CreateUserInput): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getRegistrationStats(): Promise<RegistrationStats>;
  getPaginatedUsers(page: number, limit: number): Promise<PaginatedResult<User>>;

  // Blog operations
  createBlog(blog: CreateBlogInput): Promise<Blog>;
  getBlogById(id: string): Promise<Blog | null>;
  getPaginatedBlogs(page: number, limit: number): Promise<PaginatedResult<Blog>>;
  updateBlog(id: string, blog: UpdateBlogInput): Promise<Blog>;
  deleteBlog(id: string): Promise<void>;
}

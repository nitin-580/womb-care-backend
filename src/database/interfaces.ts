// Blog Interface
export interface Blog {
  id: string;
  title: string;
  content: string;
  contentType: 'html' | 'json';
  excerpt?: string;
  coverImage?: string;
  authorName: string;
  published: boolean;
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

export interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  requirements: string[]; // Store as JSON array in DB
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateCareerInput = Omit<Career, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCareerInput = Partial<CreateCareerInput>;

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

  // Career operations
  createCareer(career: CreateCareerInput): Promise<Career>;
  getCareerById(id: string): Promise<Career | null>;
  getPaginatedCareers(page: number, limit: number): Promise<PaginatedResult<Career>>;
  updateCareer(id: string, career: UpdateCareerInput): Promise<Career>;
  deleteCareer(id: string): Promise<void>;
}

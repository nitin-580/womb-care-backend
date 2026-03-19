import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseAdapter, User, CreateUserInput, RegistrationStats, PaginatedResult, Blog, CreateBlogInput, UpdateBlogInput, Career, CreateCareerInput, UpdateCareerInput } from './interfaces';
import { env } from '../config/env';

export class SupabaseAdapter implements DatabaseAdapter {
  private supabase: SupabaseClient;
  private readonly tableName = 'early_access_users';
  private readonly blogsTableName = 'blogs';

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  // Map database row to Domain User object
  private mapToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      age: row.age,
      weight: row.weight,
      cycleRegularity: row.cycle_regular,
      symptoms: row.symptoms,
      country: row.country,
      source: row.source,
      createdAt: row.created_at,
    };
  }

  // Map Domain User to Database row object
  private mapToDbRow(user: CreateUserInput) {
    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      age: user.age,
      weight: user.weight,
      cycle_regular: user.cycleRegularity,
      symptoms: user.symptoms,
      country: user.country,
      source: user.source,
    };
  }

  // Map database row to Domain Blog object
  private mapToBlog(row: any): Blog {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      contentType: row.content_type,
      excerpt: row.excerpt,
      coverImage: row.cover_image,
      authorName: row.author_name,
      published: row.published,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Map Domain Blog input to Database row object
  private mapToBlogDbRow(blog: CreateBlogInput | UpdateBlogInput) {
    const row: any = {};
    if (blog.title) row.title = blog.title;
    if (blog.content) row.content = blog.content;
    if (blog.contentType) row.content_type = blog.contentType;
    if (blog.excerpt !== undefined) row.excerpt = blog.excerpt;
    if (blog.coverImage !== undefined) row.cover_image = blog.coverImage;
    if (blog.authorName) row.author_name = blog.authorName;
    if (blog.published !== undefined) row.published = blog.published;
    return row;
  }

  async createUser(user: CreateUserInput): Promise<User> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(this.mapToDbRow(user))
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return this.mapToUser(data);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is multiple (or no) rows returned
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }

    return data ? this.mapToUser(data) : null;
  }

  async getRegistrationStats(): Promise<RegistrationStats> {
    const now = new Date();
    
    // Setting up date boundaries
    const startOfToday = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start 
    startOfWeek.setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // To prevent multiple roundtrips, usually handled by custom SQL, but we'll do separate counts in Supabase for simplicity
    const [totalResp, todayResp, weekResp, monthResp] = await Promise.all([
      this.supabase.from(this.tableName).select('*', { count: 'exact', head: true }),
      this.supabase.from(this.tableName).select('*', { count: 'exact', head: true }).gte('created_at', startOfToday),
      this.supabase.from(this.tableName).select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString()),
      this.supabase.from(this.tableName).select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    ]);

    return {
      total: totalResp.count || 0,
      today: todayResp.count || 0,
      thisWeek: weekResp.count || 0,
      thisMonth: monthResp.count || 0,
    };
  }

  async getPaginatedUsers(page: number, limit: number): Promise<PaginatedResult<User>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch paginated users: ${error.message}`);
    }

    return {
      data: data.map(this.mapToUser),
      total: count || 0,
      page,
      limit,
    };
  }

  // Blog operations implementation
  async createBlog(blog: CreateBlogInput): Promise<Blog> {
    const { data, error } = await this.supabase
      .from(this.blogsTableName)
      .insert(this.mapToBlogDbRow(blog))
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create blog: ${error.message}`);
    }

    return this.mapToBlog(data);
  }

  async getBlogById(id: string): Promise<Blog | null> {
    const { data, error } = await this.supabase
      .from(this.blogsTableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch blog by id: ${error.message}`);
    }

    return data ? this.mapToBlog(data) : null;
  }

  async getPaginatedBlogs(page: number, limit: number): Promise<PaginatedResult<Blog>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from(this.blogsTableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch paginated blogs: ${error.message}`);
    }

    return {
      data: data.map(this.mapToBlog),
      total: count || 0,
      page,
      limit,
    };
  }

  async updateBlog(id: string, blog: UpdateBlogInput): Promise<Blog> {
    const { data, error } = await this.supabase
      .from(this.blogsTableName)
      .update(this.mapToBlogDbRow(blog))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update blog: ${error.message}`);
    }

    return this.mapToBlog(data);
  }

  async deleteBlog(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.blogsTableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete blog: ${error.message}`);
    }
  }

  // Career operations implementation
  private mapToCareer(row: any): Career {
    return {
      id: row.id,
      title: row.title,
      department: row.department,
      location: row.location,
      type: row.type,
      description: row.description,
      requirements: row.requirements || [],
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapToCareerDbRow(career: CreateCareerInput | UpdateCareerInput) {
    const row: any = {};
    if (career.title) row.title = career.title;
    if (career.department) row.department = career.department;
    if (career.location) row.location = career.location;
    if (career.type) row.type = career.type;
    if (career.description) row.description = career.description;
    if (career.requirements) row.requirements = career.requirements;
    if (career.active !== undefined) row.active = career.active;
    return row;
  }

  async createCareer(career: CreateCareerInput): Promise<Career> {
    const { data, error } = await this.supabase
      .from('careers')
      .insert(this.mapToCareerDbRow(career))
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create career: ${error.message}`);
    }

    return this.mapToCareer(data);
  }

  async getCareerById(id: string): Promise<Career | null> {
    const { data, error } = await this.supabase
      .from('careers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch career by id: ${error.message}`);
    }

    return data ? this.mapToCareer(data) : null;
  }

  async getPaginatedCareers(page: number, limit: number): Promise<PaginatedResult<Career>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from('careers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch paginated careers: ${error.message}`);
    }

    return {
      data: data.map(this.mapToCareer),
      total: count || 0,
      page,
      limit,
    };
  }

  async updateCareer(id: string, career: UpdateCareerInput): Promise<Career> {
    const { data, error } = await this.supabase
      .from('careers')
      .update(this.mapToCareerDbRow(career))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update career: ${error.message}`);
    }

    return this.mapToCareer(data);
  }

  async deleteCareer(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('careers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete career: ${error.message}`);
    }
  }
}

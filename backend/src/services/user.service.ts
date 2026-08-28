import { supabase } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, JwtPayload } from '../types';

export class UserService {
  public static async register(username: string, password: string): Promise<{ user: User; token: string }> {
    console.log('📝 Register attempt:', { username });
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      console.log('❌ Username already taken:', username);
      throw new Error('Username already taken');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('🔐 Creating user with:', { username, passwordHash: passwordHash.substring(0, 20) + '...' });

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    if (!user) {
      console.error('❌ No user returned from Supabase');
      throw new Error('Failed to create user: No data returned');
    }

    console.log('✅ User created successfully:', { id: user.id, username: user.username });

    const token = UserService.generateToken(user.id, user.username);

    return { user, token };
  }

  public static async login(username: string, password: string): Promise<{ user: User; token: string }> {
    console.log('🔑 Login attempt:', { username });

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      console.log('❌ User not found:', username);
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', username);
      throw new Error('Invalid credentials');
    }

    console.log('✅ Login successful:', { id: user.id, username: user.username });

    const token = UserService.generateToken(user.id, user.username);

    return { user, token };
  }

  public static async getUserById(userId: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  }

  public static async updateUsername(userId: string, newUsername: string): Promise<User> {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', newUsername)
      .neq('id', userId)
      .single();

    if (existingUser) {
      throw new Error('Username already taken');
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      throw new Error('Failed to update username');
    }

    return user;
  }

  public static async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update password');
    }
  }

  private static generateToken(userId: string, username: string): string {
    const payload: JwtPayload = { userId, username };
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const options = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    return jwt.sign(payload, secret, options as any);
  }
}
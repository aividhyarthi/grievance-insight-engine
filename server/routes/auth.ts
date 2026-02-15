import { Router, type Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { queries } from '../db.js';
import { signToken, requireAuth, type AuthRequest } from '../auth.js';

export const authRouter = Router();

const SignupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/signup
authRouter.post('/auth/signup', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message });
      return;
    }

    const { email, password, name } = parsed.data;

    // Check if user exists
    const existing = queries.getUserByEmail.get(email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Hash password and create user
    const hash = await bcrypt.hash(password, 12);
    const id = uuid();
    queries.createUser.run(id, email.toLowerCase(), hash, name);

    // Return token
    const token = signToken({ userId: id, email: email.toLowerCase() });
    const user = queries.getUserById.get(id) as Record<string, unknown>;

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login
authRouter.post('/auth/login', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message });
      return;
    }

    const { email, password } = parsed.data;
    const user = queries.getUserByEmail.get(email.toLowerCase()) as Record<string, unknown> | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash as string);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id as string, email: user.email as string });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me - get current user info
authRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const user = queries.getUserById.get(req.user!.userId) as Record<string, unknown> | undefined;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      created_at: user.created_at,
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

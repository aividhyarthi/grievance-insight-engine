import { Router } from 'express';
import { z } from 'zod';
import { queries } from '../db.js';
import {
  hashPassword, verifyPassword, generateToken,
  isAdminEmail, requireAuth, verifyToken,
} from '../auth.js';
import type { User, AuthPayload, ApiResponse } from '../../shared/types.js';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  role: z.enum(['publisher', 'regulator']).default('publisher'),
  organization: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ─── Signup ──────────────────────────────────────────────────────────────────

authRouter.post('/signup', (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const existing = queries.getUserByEmail.get(data.email);
    if (existing) {
      res.status(409).json({ success: false, error: 'Email already registered' } satisfies ApiResponse);
      return;
    }

    const role = isAdminEmail(data.email) ? 'admin' : data.role;
    const hash = hashPassword(data.password);

    const result = queries.createUser.run(data.email, hash, data.name, role, data.organization || null);
    const user = queries.getUserById.get(result.lastInsertRowid) as any;
    const token = generateToken(user.id);

    const payload: AuthPayload = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        organization: user.organization,
        createdAt: user.created_at,
      },
    };

    res.status(201).json({ success: true, data: payload } satisfies ApiResponse<AuthPayload>);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0].message } satisfies ApiResponse);
      return;
    }
    res.status(500).json({ success: false, error: 'Server error' } satisfies ApiResponse);
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────

authRouter.post('/login', (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = queries.getUserByEmail.get(data.email) as any;

    if (!user || !verifyPassword(data.password, user.password_hash)) {
      res.status(401).json({ success: false, error: 'Invalid email or password' } satisfies ApiResponse);
      return;
    }

    const token = generateToken(user.id);
    const payload: AuthPayload = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        organization: user.organization,
        createdAt: user.created_at,
      },
    };

    res.json({ success: true, data: payload } satisfies ApiResponse<AuthPayload>);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0].message } satisfies ApiResponse);
      return;
    }
    res.status(500).json({ success: false, error: 'Server error' } satisfies ApiResponse);
  }
});

// ─── Verify Token ────────────────────────────────────────────────────────────

authRouter.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ success: false, error: 'Token required' } satisfies ApiResponse);
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid token' } satisfies ApiResponse);
    return;
  }

  const user = queries.getUserById.get(payload.userId) as any;
  if (!user) {
    res.status(401).json({ success: false, error: 'User not found' } satisfies ApiResponse);
    return;
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        organization: user.organization,
        createdAt: user.created_at,
      },
    },
  } satisfies ApiResponse);
});

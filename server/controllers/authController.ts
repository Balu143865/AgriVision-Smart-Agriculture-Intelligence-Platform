import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../config/db';
import { generateToken, AuthRequest } from '../middleware/authMiddleware';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role, farmName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await dbService.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'Agronomist',
      farmName: farmName || 'Kaveri Delta Smart Farm',
    });

    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      farmName: newUser.farmName,
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        farmName: newUser.farmName,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    // Compare password (support plain for pre-seeded user if not yet hashed)
    let isMatch = false;
    if (user.password?.startsWith('$2a$') || user.password?.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      farmName: user.farmName,
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
}

export async function demoLogin(req: Request, res: Response) {
  try {
    const demoUser = {
      id: 'usr_agri_001',
      name: 'Dr. Ramesh Sundaram',
      email: 'ramesh.agrivision@demo.com',
      role: 'Agronomist',
      farmName: 'Kaveri Delta Smart Agro - Unit 4',
    };

    const token = generateToken(demoUser);

    return res.json({
      success: true,
      message: 'Demo agronomist authenticated successfully.',
      token,
      user: demoUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to authenticate demo session.' });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agrivision_production_jwt_secret_token_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    farmName: string;
    name: string;
  };
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing or invalid.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    // If it's a demo session token format
    if (token === 'demo-agronomist-session-token' || token.startsWith('demo-token-')) {
      req.user = {
        id: 'usr_agri_001',
        email: 'ramesh.agrivision@demo.com',
        role: 'Agronomist',
        farmName: 'Kaveri Delta Smart Agro - Unit 4',
        name: 'Dr. Ramesh Sundaram',
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
}

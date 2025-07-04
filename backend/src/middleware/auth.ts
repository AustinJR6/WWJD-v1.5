import { Request, Response, NextFunction } from 'express';
import { auth } from '../utils/firebase';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    req.userId = decoded.uid;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

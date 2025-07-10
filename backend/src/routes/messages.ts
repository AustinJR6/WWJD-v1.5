import { Router, Response, NextFunction } from 'express';
import { db } from '../utils/firebase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(req.userId!)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = snapshot.docs.map((doc) => doc.data());
    res.json({ messages });
  } catch (err) {
    console.error('messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;

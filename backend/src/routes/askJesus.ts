import { Router, Response, NextFunction } from 'express';
import { getJesusReply } from '../utils/openai';
import { db } from '../utils/firebase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.post('/askJesus', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { message } = req.body as { message?: string };
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const reply = await getJesusReply(message);

    await db
      .collection('users')
      .doc(req.userId!)
      .collection('messages')
      .add({ message, reply, createdAt: new Date() });

    res.json({ reply });
  } catch (err) {
    console.error('askJesus error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;

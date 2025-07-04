import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import askJesusRouter from './routes/askJesus';
import messagesRouter from './routes/messages';
import './utils/firebase';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use(askJesusRouter);
app.use(messagesRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomUUID } from 'node:crypto';

const router = express.Router();

const DEFAULT_MINT_AMOUNT = 10;
const MAX_TRANSACTIONS = 100;

let balance = 100;
let transactions = [
  { id: randomUUID(), timestamp: new Date().toISOString(), amount: 100, type: 'credit', note: 'Initial funding' }
];

function validationMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}

router.get('/wallet', (_req, res) => {
  res.json({ balance, transactions });
});

router.post(
  '/mint',
  [
    body('amount')
      .optional()
      .isInt({ gt: 0 })
      .withMessage('amount must be a positive integer')
      .toInt(),
    body('note')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('note must be a string up to 200 characters')
  ],
  validationMiddleware,
  (req, res) => {
    const amount = req.body?.amount ?? DEFAULT_MINT_AMOUNT;
    const note = req.body?.note || 'Minted credits';

    balance += amount;
    const transaction = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      amount,
      type: 'mint',
      note
    };
    transactions = [transaction, ...transactions].slice(0, MAX_TRANSACTIONS);

    return res.status(201).json({ balance, transaction });
  }
);

router.post(
  '/spend',
  [
    body('amount')
      .exists()
      .withMessage('amount is required')
      .isInt({ gt: 0 })
      .withMessage('amount must be a positive integer')
      .toInt(),
    body('note')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('note must be a string up to 200 characters')
  ],
  validationMiddleware,
  (req, res) => {
    const amount = req.body.amount;
    if (amount > balance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    balance -= amount;
    const transaction = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      amount: -amount,
      type: 'debit',
      note: req.body?.note || 'Spent credits'
    };
    transactions = [transaction, ...transactions].slice(0, MAX_TRANSACTIONS);

    return res.status(201).json({ balance, transaction });
  }
);

export default router;

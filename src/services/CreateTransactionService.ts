import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category?: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError(
        "Invalid transaction type. Type needs to be an 'income' or 'outcome'.",
      );
    }

    if (!Number.isFinite(value)) {
      throw new AppError('Invalid value type. Value needs to be a number.');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let transactionCategory;
    let transactionDetails;

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Not enough balance to perform this transaction.');
    }

    if (category === '') {
      transactionDetails = {
        title,
        type,
        value,
      };
    } else {
      transactionCategory = await categoriesRepository.findOne({
        where: {
          title: category,
        },
      });

      if (!transactionCategory) {
        transactionCategory = categoriesRepository.create({
          title: category,
        });

        await categoriesRepository.save(transactionCategory);
      }

      transactionDetails = {
        title,
        type,
        value,
        category: transactionCategory,
      };
    }

    const transaction = transactionsRepository.create(transactionDetails);

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

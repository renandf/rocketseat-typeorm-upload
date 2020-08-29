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
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    let transactionCategory;
    let transactionDetails;

    if (category === '') {
      transactionDetails = {
        title,
        type,
        value,
      };
    } else {
      transactionCategory = await categoryRepository.findOne({
        where: {
          title: category,
        },
      });

      if (!transactionCategory) {
        transactionCategory = categoryRepository.create({
          title: category,
        });

        await categoryRepository.save(transactionCategory);
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

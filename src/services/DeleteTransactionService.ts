import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<number> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const deleteTransaction = await transactionsRepository.delete(id);

    if (deleteTransaction.affected === 0) {
      throw new AppError("Transaction ID doesn't exist in the database.");
    }

    const responseStatus = 204;

    return responseStatus;
  }
}

export default DeleteTransactionService;

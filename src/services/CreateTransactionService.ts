import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import FindOrCreateCategoryService from './FindOrCreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Você não tem saldo suficiente');
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Tipo da categoria deve ser income ou outcome.');
    }

    let category_id;

    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      const { id } = await categoriesRepository.save(newCategory);
      category_id = id;
    } else {
      category_id = categoryExists.id;
    }

    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.create({
      title,
      type,
      value,
      category_id, // : transactionCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

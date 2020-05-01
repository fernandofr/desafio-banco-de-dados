import { getRepository } from 'typeorm';

import Category from '../models/Category';

interface Request {
  category: string;
}

class FindOrCreateCategoryService {
  public async execute({ category: title }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const findCategory = await categoryRepository.findOne({
      where: { title },
    });

    if (!findCategory) {
      const category = await categoryRepository.create({
        title,
      });

      await categoryRepository.save(category);

      return category;
    }

    return findCategory;
  }
}

export default FindOrCreateCategoryService;

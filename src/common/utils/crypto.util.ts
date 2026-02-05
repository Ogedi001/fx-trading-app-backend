import bcrypt from 'bcryptjs';
import { InternalServerException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/constants/error-codes';

export const encrypt = {
  password: async (password: string): Promise<string> => {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      throw new InternalServerException(
        ErrorCodes.PASSWORD_HASH_FAILED,
        'Failed to hash password',
        error,
      );
    }
  },
};

export const compare = {
  password: async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new InternalServerException(
        ErrorCodes.PASSWORD_COMPARE_FAILED,
        'Failed to compare password',
        error,
      );
    }
  },
};

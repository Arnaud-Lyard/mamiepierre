import { object, string, TypeOf, z } from 'zod';

export const updateUserSchema = object({
  body: object({
    username: string({}),
    email: string({}).email('Invalid email address'),
    twitter: string({}).optional(),
    esl: string({}).optional(),
    stormgate: string({}).optional(),
  }),
});

export type UpdateUserInput = TypeOf<typeof updateUserSchema>['body'];

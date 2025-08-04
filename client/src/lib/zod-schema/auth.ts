import z from 'zod';

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    email: z.email(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    repassword: z.string().min(6, 'Re-entered password must match'),
  })
  .refine((data) => data.password === data.repassword, {
    message: 'Passwords must match',
    path: ['repassword'],
  });

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const ChangePasswordSchema = z
  .object({
    email: z.email(),
    oldPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    newPassword: z.string().min(6, 'New Password must be at least 6 characters long'),
    newRepassword: z.string().min(6, 'Re-entered password must match'),
  })
  .refine((data) => data.newPassword === data.newRepassword, {
    message: 'Passwords must match',
    path: ['newRepassword'],
  });

  export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;

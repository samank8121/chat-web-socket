import React, { useEffect } from 'react';
import { useState } from 'react';
import { setUser, useUserStore, type User } from '@/lib/store/user';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordSchema, type ChangePasswordSchemaType } from '@/lib/zod-schema/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchUtil } from '@/lib/utils';
import type { AccessTokenType } from '@/types/access-token';

const ChangePassword = () => {
  const user: User = useUserStore((state) => state.user);
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    newRepassword: '',
  });

  useEffect(() => {
    setFormData({ ...formData, email: user?.email ?? '' });
  }, [user]);

  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = ChangePasswordSchema.safeParse(formData);
    if (!result.success) {
      const flatternError = result.error.flatten().fieldErrors;
      setErrors(flatternError);
      return;
    }
    setErrors(null);
    try {
      const token = await fetchUtil<AccessTokenType>(
        `${import.meta.env.VITE_APP_API_URL}/auth/change-password`,
        {
          method: 'POST',
          body: {
            email: formData.email,
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
          },
        }
      );
      if (token.access_token) {
        setUser({
          token: token.access_token,
          email: formData.email,
          storeTime: Date.now(),
        });
        navigate('/');
      }
    } catch (error) {
      toast('Error', { description: (error as Error).message });
    }
  };
  const renderFieldError = (field: keyof ChangePasswordSchemaType) => {
    return errors && errors[field] ? (
      <span className='error'>{errors[field][0]}</span>
    ) : null;
  };
  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <Input
        type='email'
        placeholder='Email'
        value={formData.email}
        readOnly
      />
      {renderFieldError('email')}

      <Input
        type='password'
        placeholder='Old Password'
        value={formData.oldPassword}
        onChange={(e) =>
          setFormData({ ...formData, oldPassword: e.target.value })
        }
      />
      {renderFieldError('oldPassword')}
      <Input
        type='password'
        placeholder='New Password'
        value={formData.newPassword}
        onChange={(e) =>
          setFormData({ ...formData, newPassword: e.target.value })
        }
      />
      {renderFieldError('newPassword')}
      <Input
        type='password'
        placeholder='Re-enter New Password'
        value={formData.newRepassword}
        onChange={(e) =>
          setFormData({ ...formData, newRepassword: e.target.value })
        }
      />
      {renderFieldError('newRepassword')}
      <br />
      <Button type='submit'>Change</Button>
    </form>
  );
};

export default ChangePassword;

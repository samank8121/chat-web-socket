import React from 'react';
import { useState } from 'react';
import { setUser } from '@/lib/store/user';
import { useNavigate } from 'react-router-dom';
import { SignInSchema, type SignInSchemaType } from '@/lib/zod-schema/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchUtil } from '@/lib/utils';
import type { AccessTokenType } from '@/types/access-token';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = SignInSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    try {
      const response = await fetchUtil<AccessTokenType>(
        `${import.meta.env.VITE_APP_API_URL}/auth/signin`,
        {
          method: 'POST',
          body: {
            email: formData.email,
            password: formData.password,
          },
        }
      );
      if (response.access_token) {
        setUser({
          token: response.access_token,
          email: formData.email,
          storeTime: Date.now(),
        });
        navigate('/');
      }
    } catch (error) {
      toast('Error', { description: (error as Error).message });
    }
  };
  const renderFieldError = (field: keyof SignInSchemaType) => {
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
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {renderFieldError('email')}
      <Input
        type='password'
        placeholder='Password'
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {renderFieldError('password')}
      <br/>
      <a href='/signup'>Don't have an account? Sign up</a>
      <Button type='submit'>Sign In</Button>
    </form>
  );
};

export default SignIn;

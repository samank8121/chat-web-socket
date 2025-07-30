import React from 'react';
import { useState } from 'react';
import { setUser } from '@/lib/store/user';
import { useNavigate } from 'react-router-dom';
import { SignInSchema, SignInSchemaType } from '@/lib/zod-schema/auth';

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

    const token = await fetch(`${process.env.REACT_APP_API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    }).then((response) => {
      return response.json();
    });
    if (token.access_token) {
      setUser({ token: token.access_token, email: formData.email });
      navigate('/');
    } else {
      alert('Sign in failed. Please check your credentials.');
      console.error('Error signing in:', token.error);
    }
  };
  const renderFieldError = (field: keyof SignInSchemaType) => {
    return errors && errors[field] ? (
      <span className='error'>{errors[field][0]}</span>
    ) : null;
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        placeholder='Email'
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {renderFieldError('email')}
      <input
        type='password'
        placeholder='Password'
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {renderFieldError('password')}
      <br/>
      <a href='/signup'>Don't have an account? Sign up</a>
      <button type='submit'>Sign In</button>
    </form>
  );
};

export default SignIn;

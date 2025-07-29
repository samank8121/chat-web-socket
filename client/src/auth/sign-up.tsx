import React from 'react';
import { useState } from 'react';
import { setUser } from '../lib/store/user';
import { useNavigate } from 'react-router-dom';
import { SignUpSchema, SignUpSchemaType } from '../lib/zod-schema/auth';

;
const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = SignUpSchema.safeParse(formData);
    if (!result.success) {
      console.error('Validation errors:', result.error);
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    setErrors(null);
    const token = await fetch(`${process.env.REACT_APP_API_URL}/auth/signup`, {
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
      alert('Sign up failed. Please check your credentials.');
    }
  };
  const renderFieldError = (field: keyof SignUpSchemaType) => {
    return errors && errors[field] ? (
      <span className="error">{errors[field][0]}</span>
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
      <input
        type='password'
        placeholder='Re-enter Password'
        value={formData.repassword}
        onChange={(e) =>
          setFormData({ ...formData, repassword: e.target.value })
        }
      />
     {renderFieldError('repassword')}
     <br />
      <a href='/signin'>Already have an account? Sign in</a>
      <button type='submit'>Sign Up</button>
    </form>
  );
};

export default SignUp;

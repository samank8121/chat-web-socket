import Home from '@/pages/home';
import SignIn from '@/pages/auth/sign-in';
import SignUp from '@/pages/auth/sign-up';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import { getUser, resetUser, useUserStore } from '@/lib/store/user';
import { useEffect } from 'react';

const Layout = () => {
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  
  const navigate = useNavigate();
  useEffect(() => {
    if (!hasHydrated) return;

    const user = getUser();
    console.log('User:', user);
    if (user === null || user.token === '' || !user.storeTime || user.storeTime - Date.now() < 0) {
      console.log('User is not authenticated or token is expired');
      resetUser();
      navigate('/signin');
      return;
    }
  }, [hasHydrated, navigate]);
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <div className='flex flex-col min-h-screen p-2 container mx-auto'>
        <main>
          <Header />
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
      </Route>
    </Routes>
  );
}

export default App;

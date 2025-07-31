import Home from '@/pages/home';
import SignIn from '@/pages/auth/sign-in';
import SignUp from '@/pages/auth/sign-up';
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import { getUser, resetUser, useUserStore } from '@/lib/store/user';
import { useEffect } from 'react';
import { isExpired } from './lib/utils';

const Layout = () => {
  const hasHydrated = useUserStore((s) => s.hasHydrated);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!hasHydrated) return;

    if (location.pathname === '/signin' || location.pathname === '/signup') {
      return;
    }
    const user = getUser();
    if (
      user === null ||
      user.token === '' ||
      !user.storeTime      
    ) {
      console.log('User is not authenticated or token is expired');
      navigate('/signin');
      return;
    }
    else if( isExpired(user.storeTime, '1h') ) {
      resetUser();
      navigate('/signin');
      return;
    }
  }, [hasHydrated, location.pathname, navigate]);
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

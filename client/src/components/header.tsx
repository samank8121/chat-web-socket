import { ModeToggle } from '@/components/mode-toggle-theme';
import { resetUser, useUserStore, type User } from '@/lib/store/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircleUserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const user: User = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const logout = () => {
    resetUser();
    navigate('/signin');
  };
  const ChangePassword = () => {
    navigate('/change-password');
  };
  return (
    <header className='flex items-center justify-between p-4'>
      {user && user.token ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CircleUserRound className='h-[1.5rem] w-[1.5rem] scale-100' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>{user.email || 'Anonymous'}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => ChangePassword()}>
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span>Guest</span>
      )}
      <ModeToggle />
    </header>
  );
};

export default Header;

import { ModeToggle } from "@/components/mode-toggle-theme";
import { useUserStore, type User } from "@/lib/store/user";

const Header = () => {  
  const user: User = useUserStore((state) => state.user);
  console.log('Header user:', user);
  return (
    <header className='flex items-center justify-between p-4'>
      {user && user.token ? <span>Welcome: <span>{user.email}</span></span> : <span>Guest</span>}
      <ModeToggle />
    </header>
  );
};

export default Header;

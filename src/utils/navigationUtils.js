// navigationUtils.js
import { useRouter } from 'next/router';

// Custom hook to navigate to a route
export const useNavigateToRoute = () => {
  const router = useRouter();

  const navigateToRoute = (route) => {
    router.push(route);
  };

  return navigateToRoute;
};

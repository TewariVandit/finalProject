import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';
import GlobalApiLoader from 'components/GlobalApiLoader';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <ScrollTop>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
        <GlobalApiLoader />
      </ScrollTop>
    </ThemeCustomization>
  );
}

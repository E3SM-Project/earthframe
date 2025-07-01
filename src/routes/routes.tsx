// src/routes/routes.tsx

import { RouteObject } from 'react-router-dom';

import Browse from '@/pages/Browse/Browse';
import Compare from '@/pages/Compare/Compare';
import Submit from '@/pages/Submit/Submit';
import Docs from '@/pages/Docs/Docs';
import { Navigate } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/browse" replace />,
  },
  {
    path: '/browse',
    element: <Browse />,
  },
  {
    path: '/compare',
    element: <Compare />,
  },
  {
    path: '/submit',
    element: <Submit />,
  },
  {
    path: '/docs',
    element: <Docs />,
  },
  {
    path: '*',
    element: <div>404 - Page not found</div>,
  },
];

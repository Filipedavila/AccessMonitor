import './styles/theme.css';
import './styles/fontStyle.css';
import './styles/main.css';

import '@a12e/accessmonitor-ds/dist/index.css';

import { useState, useEffect } from 'react';
import type { FC } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Resume from './pages/Resume';
import Detail from './pages/Details';
import PageCode from './pages/PageCode';
import Error from './pages/Error';
import './i18n';
import type { EvaluationData } from './types';

export const pathURL: string = import.meta.env.VITE_BASE_URL || '/';

export const App: FC = () => {
  const [allData, setAllData] = useState<EvaluationData | null>(null);
  const [, setEle] = useState<string>('');

  /* Update year in footer until dynamic year is implemented in design system */
  useEffect(() => {
    const footerEl = document.querySelector('footer .ama-typography-body');
    if (footerEl && footerEl.textContent) {
      footerEl.textContent = footerEl.textContent.replace(
        /\b\d{4}\b/,
        new Date().getFullYear().toString(),
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path={`${pathURL}`} element={<Home />} />

              <Route
                path={`${pathURL}results/:content`}
                element={<Resume setAllData={setAllData} setEle={setEle} />}
              />

              <Route
                path={`${pathURL}results/:content/:details`}
                element={<Detail setAllData={setAllData} allData={allData} />}
              />

              <Route
                path={`${pathURL}results/:content/code`}
                element={<PageCode />}
              />

              {/* Error fallback route must be last */}
              <Route path={`${pathURL}*`} element={<Error />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

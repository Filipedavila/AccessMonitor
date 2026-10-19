import type { FC, ReactNode } from 'react';
import { Footer, Header } from '@a12e/accessmonitor-ds';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../context/ThemeContext';
import { pathURL } from '../../App';
import './styles.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const mainDarkClass = theme === 'light' ? '' : 'main_dark';
  const isHomePage = location.pathname === pathURL;
  const logoSrc =
    theme === 'light'
      ? `${pathURL}img/logo.svg`
      : `${pathURL}img/logo-dark.svg`;

  const toggleLanguage = (): void => {
    const nextLang = i18n.language === 'en' ? 'pt' : 'en';
    const htmlLang = nextLang === 'pt' ? 'pt-PT' : 'en';

    i18n.changeLanguage(nextLang);
    document.querySelector('html')?.setAttribute('lang', htmlLang);
  };

  return (
    <>
      <Header
        darkTheme={theme}
        logo={logoSrc}
        description={t('HEADER.line_text')}
        homePage={isHomePage}
        language={i18n.language}
        changeLanguage={toggleLanguage}
        changeTheme={toggleTheme}
        linkTo={pathURL}
        ariaLabel={t('HEADER.header_arial_label')}
        altLogo="AccessMonitor, WCAG 2.1"
      />
      <main
        className={`main ${mainDarkClass}`}
        id="content"
        aria-label={t('HOME_PAGE.main_aria')}
      >
        {children}
      </main>
      <Footer darkTheme={theme} />
    </>
  );
};

export default Layout;

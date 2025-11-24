// frontend/src/components/Header.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'Orders', href: '/orders' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const navigate = useNavigate();
  const { user, openLoginModal, requireAuth } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when clicking outside or on a link
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleNavClick = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIconClick = (path, needsAuth = true) => event => {
    event.preventDefault();
    if (needsAuth) {
      if (requireAuth(() => navigate(path))) return;
    } else {
      navigate(path);
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b border-[#f1e7dc]/30 transition-all duration-300 ${
        isScrolled ? 'bg-white/30 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-0">
        <Link 
          to="/" 
          className="font-display text-lg sm:text-xl md:text-2xl uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] text-charcoal flex-shrink-0"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span>6</span>
          <span className="text-[#ff0000]">XO BAGS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-gray-600">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `tracking-widest uppercase ${isActive ? 'text-charcoal' : 'hover:text-charcoal'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Search Icon - Minimalist outline */}
          <button
            type="button"
            onClick={handleIconClick('/products', false)}
            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-charcoal hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation"
            aria-label="Search Products"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current sm:w-5 sm:h-5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Heart Icon (Wishlist) - Minimalist outline */}
          <button
            type="button"
            onClick={handleIconClick('/wishlist')}
            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-charcoal hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation"
            aria-label="Wishlist"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current sm:w-5 sm:h-5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
          </button>

          {/* User/Profile Icon - Minimalist outline */}
          <button
            type="button"
            onClick={handleIconClick('/account')}
            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-charcoal hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation"
            aria-label="Account"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current sm:w-5 sm:h-5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* Cart Icon - Minimalist outline */}
          <button
            type="button"
            onClick={handleIconClick('/cart')}
            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-charcoal hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation"
            aria-label="Shopping Cart"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current sm:w-5 sm:h-5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>

          {/* Mobile Menu Button (Hamburger) - After Cart Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-charcoal hover:opacity-70 active:opacity-50 transition-opacity touch-manipulation"
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top duration-200">
          <nav className="mx-auto max-w-6xl px-4 py-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left text-sm font-medium text-gray-600 tracking-widest uppercase hover:text-charcoal active:text-charcoal transition-colors py-3 px-2 rounded-md hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

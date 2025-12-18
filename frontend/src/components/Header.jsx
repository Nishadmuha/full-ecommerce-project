import { motion, AnimatePresence } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
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
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: [0, -5, 5, -5, 0], transition: { duration: 0.4 } },
    tap: { scale: 0.95 },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const navItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-soft border-gray-200' 
          : 'bg-white/80 backdrop-blur-sm border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className="font-display text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wider text-charcoal flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              6
            </motion.span>
            <motion.span
              className="text-primary-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              XO
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              BAGS
            </motion.span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.5 }}
            >
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `relative text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-charcoal' : 'text-gray-600 hover:text-charcoal'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-3 md:gap-4">
          {[
            { icon: 'search', path: '/products', auth: false, label: 'Search Products' },
            { icon: 'heart', path: '/wishlist', auth: true, label: 'Wishlist' },
            { icon: 'user', path: '/account', auth: true, label: 'Account' },
            { icon: 'cart', path: '/cart', auth: false, label: 'Shopping Cart' },
          ].map(({ icon, path, auth, label }, index) => (
            <motion.button
              key={icon}
              type="button"
              onClick={handleIconClick(path, auth)}
              variants={iconVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index + 0.6, type: 'spring', stiffness: 200 }}
              className="relative h-10 w-10 flex items-center justify-center text-charcoal hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
              aria-label={label}
            >
              {icon === 'search' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              {icon === 'heart' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              {icon === 'user' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              {icon === 'cart' && (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {/* Cart Badge - Add if you have cart count */}
                </>
              )}
            </motion.button>
          ))}

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden h-10 w-10 flex items-center justify-center text-charcoal rounded-full hover:bg-gray-100"
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
          >
            <motion.div
              animate={isMobileMenuOpen ? 'open' : 'closed'}
              className="relative w-6 h-6"
            >
              <motion.span
                className="absolute top-0 left-0 w-full h-0.5 bg-current"
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: 45, y: 8 },
                }}
              />
              <motion.span
                className="absolute top-2 left-0 w-full h-0.5 bg-current"
                variants={{
                  closed: { opacity: 1 },
                  open: { opacity: 0 },
                }}
              />
              <motion.span
                className="absolute top-4 left-0 w-full h-0.5 bg-current"
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: -45, y: -8 },
                }}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden border-t border-gray-200 bg-white overflow-hidden"
          >
            <nav className="mx-auto max-w-7xl px-4 py-6 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.href}
                  custom={i}
                  variants={navItemVariants}
                  initial="closed"
                  animate="open"
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left text-base font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600 hover:bg-gray-50 transition-colors py-3 px-4 rounded-lg"
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

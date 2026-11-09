/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store, useAppSelector } from './store/index.ts';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { AdminHomeDashboard } from './components/dashboard/AdminHomeDashboard.tsx';
import { ProductsPage } from './components/products/ProductsPage.tsx';
import { OrdersPage } from './components/orders/OrdersPage.tsx';
import { CustomersPage } from './components/customers/CustomersPage.tsx';
import { CategoriesPage } from './components/categories/CategoriesPage.tsx';
import { CouponsPage } from './components/coupons/CouponsPage.tsx';
import { AnalyticsPage } from './components/analytics/AnalyticsPage.tsx';
import { ProductFormModal } from './components/products/ProductFormModal.tsx';
import { PublicHomePage } from './components/auth/PublicHomePage.tsx';
import { AdminSignInPage } from './components/auth/AdminSignInPage.tsx';
import { AdminSignUpPage } from './components/auth/AdminSignUpPage.tsx';
import { authService, AdminUser } from './api/services/authService.ts';
import { productService } from './api/services/productService.ts';
import { categoryService } from './api/services/otherServices.ts';
import { replaceProducts } from './store/productsSlice.ts';
import { replaceCategories } from './store/categoriesAndCouponsSlice.ts';

function apiErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The catalog could not be loaded.';
}

function AdminContent({ user, onSignOut }: { user: AdminUser; onSignOut: () => void }) {
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = store.dispatch;

  const loadCatalog = useCallback(async () => {
    setCatalogError('');
    setIsLoading(true);
    try {
      const [products, categories] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      dispatch(replaceProducts(products));
      dispatch(replaceCategories(categories));
    } catch (error) {
      setCatalogError(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminHomeDashboard />;
      case 'products':
        return <ProductsPage />;
      case 'orders':
        return <OrdersPage />;
      case 'customers':
        return <CustomersPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'coupons':
        return <CouponsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <AdminHomeDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Permanent / Responsive Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          user={user}
          onSignOut={onSignOut}
          onOpenAddProductModal={() => setIsAddProductOpen(true)}
        />

        {/* Dynamic Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {catalogError && (
              <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <span>{catalogError}</span>
                <button onClick={() => void loadCatalog()} className="font-semibold underline">Retry</button>
              </div>
            )}
            {isLoading && <p className="mb-5 text-sm text-slate-500">Loading catalog…</p>}
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Quick Add Product Modal */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AdminRouter />
    </Provider>
  );
}

function AdminRouter() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const navigate = useCallback((nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
    setPath(nextPath);
  }, []);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    const handleUnauthorized = () => {
      setUser(null);
      navigate('/sign-in');
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('zenvy:unauthorized', handleUnauthorized);
    authService.getCurrentUser()
      .then((currentUser) => {
        if (currentUser.role === 'admin') setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode !== 401) {
          setSessionError(apiErrorMessage(error));
        }
      })
      .finally(() => setIsCheckingSession(false));
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('zenvy:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      setSessionError(apiErrorMessage(error));
    } finally {
      setUser(null);
      navigate('/');
    }
  };

  const isPublicRoute = path === '/' || path === '/sign-in' || path === '/sign-up';
  if (isCheckingSession && !isPublicRoute) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking administrator session…</div>;
  }

  if (user?.role === 'admin') {
    return <AdminContent user={user} onSignOut={() => void handleSignOut()} />;
  }

  if (path === '/sign-in' || path === '/sign-up') {
    const AuthPage = path === '/sign-up' ? AdminSignUpPage : AdminSignInPage;
    return (
      <>
        {sessionError && <p role="alert" className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{sessionError}</p>}
        <AuthPage
          onNavigate={navigate}
          onAuthenticated={(authenticatedUser) => {
            setSessionError('');
            setUser(authenticatedUser);
            navigate('/');
          }}
        />
      </>
    );
  }

  if (path !== '/' && path !== '/sign-in' && path !== '/sign-up') {
    if (!isCheckingSession) navigate('/sign-in');
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Redirecting to sign in…</div>;
  }

  return (
    <>
      {sessionError && <p role="alert" className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{sessionError}</p>}
      <PublicHomePage onNavigate={navigate} />
    </>
  );
}

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { toggleDarkMode, setMobileSidebarOpen, setActiveTab } from '../../store/uiSlice.ts';
import { setSelectedProduct } from '../../store/productsSlice.ts';
import { Sun, Moon, Menu, Plus, ShoppingBag, ExternalLink } from 'lucide-react';
import { ASSET_ADMIN_AVATAR } from '../../store/mockData.ts';
import { AdminUser } from '../../api/services/authService.ts';

interface HeaderProps {
  onOpenAddProductModal?: () => void;
  user: AdminUser;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddProductModal, user, onSignOut }) => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const totalProducts = useAppSelector((state) => state.products.items.length);
  const totalOrders = useAppSelector((state) => state.orders.items.length);

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'overview':
        return 'Executive Overview';
      case 'products':
        return `Product Catalog (${totalProducts})`;
      case 'orders':
        return `Order Fulfillment (${totalOrders})`;
      case 'customers':
        return 'Customer Intelligence';
      case 'categories':
        return 'Store Taxonomy';
      case 'coupons':
        return 'Discounts & Promotions';
      case 'analytics':
        return 'Sales & Performance Reports';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          aria-label="Open mobile navigation menu"
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-slate-100 hidden sm:inline">Zenvy Admin</span>
          <span aria-hidden="true" className="hidden sm:inline">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{getBreadcrumbLabel()}</span>
        </div>
      </div>

      {/* Right: Quick Action, Theme Switch, Admin Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Quick Add Product CTA */}
        {onOpenAddProductModal && (
          <button
            onClick={onOpenAddProductModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">New</span>
          </button>
        )}

        {/* View Store Mock Link */}
        <button
          onClick={() => dispatch(setActiveTab('products'))}
          title="Browse Product Catalog"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Live Catalog</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button onClick={onSignOut} className="rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          Sign out
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={ASSET_ADMIN_AVATAR}
            alt="Admin Profile"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user.firstName} {user.lastName}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
};

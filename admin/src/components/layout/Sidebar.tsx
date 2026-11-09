import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { setActiveTab, setMobileSidebarOpen, toggleSidebar } from '../../store/uiSlice.ts';
import { ActiveTab } from '../../types/index.ts';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Tag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const mobileSidebarOpen = useAppSelector((state) => state.ui.mobileSidebarOpen);
  const orders = useAppSelector((state) => state.orders.items);
  const products = useAppSelector((state) => state.products.items);

  const pendingOrdersCount = orders.filter((o) => o.fulfillmentStatus === 'unfulfilled' || o.fulfillmentStatus === 'processing').length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeType?: 'warning' | 'info';
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="w-4 h-4 shrink-0" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeType: 'warning',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4 shrink-0" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeType: 'info',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <FolderTree className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: <Tag className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    dispatch(setActiveTab(tab));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-slate-900 font-bold text-base tracking-wider flex items-center justify-center">
            Z
          </div>
          {(!sidebarCollapsed || mobileSidebarOpen) && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white uppercase">Zenvy</span>
              <span className="text-[10px] text-slate-400 -mt-0.5">Admin Workspace</span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        {mobileSidebarOpen && (
          <button
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            aria-label="Close navigation"
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav aria-label="Main Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {(!sidebarCollapsed || mobileSidebarOpen) && 'Management'}
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={sidebarCollapsed && !mobileSidebarOpen ? item.label : undefined}
            >
              <span className={isActive ? 'text-slate-900' : 'text-slate-400'}>{item.icon}</span>

              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Collapse Toggle */}
      <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-800">
        {!sidebarCollapsed && (
          <span className="text-[11px] text-slate-500">Admin workspace</span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors ml-auto"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 border-r border-slate-800 ${
          sidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

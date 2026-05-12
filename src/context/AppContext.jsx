import { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { USERS_SEED, STORES_SEED, SUPPLIERS_SEED, makeProds, SEED_ORDERS, CATALOG_SEED, SUBSCRIPTIONS_SEED, PAYMENTS_SEED, PRICING_PLANS } from '../utils/seedData';
import { getProductImageUrl } from '../utils/helpers';

const AppContext = createContext(null);

const initialState = {
  session: null,
  users: USERS_SEED,
  stores: STORES_SEED,
  suppliers: SUPPLIERS_SEED,
  allProducts: STORES_SEED.flatMap(s => makeProds(s.id)),
  allOrders: SEED_ORDERS,
  catalog: CATALOG_SEED.map(p => ({ ...p, imageUrl: getProductImageUrl(p.name) })),
  subscriptions: SUBSCRIPTIONS_SEED,
  payments: PAYMENTS_SEED,
  syncingIds: new Set(),
  toasts: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };

    case 'LOGOUT':
      return { ...state, session: null };

    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };

    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u) };

    case 'ADD_ORDER':
      return { ...state, allOrders: [action.payload, ...state.allOrders] };

    case 'UPDATE_ORDER':
      return { ...state, allOrders: state.allOrders.map(o => o.id === action.payload.id ? { ...o, ...action.payload } : o) };

    case 'ADD_PRODUCT':
      return { ...state, allProducts: [...state.allProducts, action.payload] };

    case 'UPDATE_PRODUCT':
      return { ...state, allProducts: state.allProducts.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };

    case 'UPDATE_PRODUCT_TAG':
      return { ...state, allProducts: state.allProducts.map(p => p.id === action.payload.productId ? { ...p, tag: { ...p.tag, ...action.payload.tagData } } : p) };

    case 'ADD_CATALOG_PRODUCT':
      return { ...state, catalog: [action.payload, ...state.catalog] };

    case 'UPDATE_CATALOG_PRODUCT':
      return { ...state, catalog: state.catalog.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };

    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [...state.subscriptions, action.payload] };

    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscriptions: state.subscriptions.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) };

    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };

    case 'SYNC_TAG':
      return { ...state, syncingIds: new Set([...state.syncingIds, action.payload]) };

    case 'SYNC_TAG_COMPLETE':
      const newSyncingIds = new Set(state.syncingIds);
      newSyncingIds.delete(action.payload);
      return {
        ...state,
        syncingIds: newSyncingIds,
        allProducts: state.allProducts.map(p => p.id === action.payload ? { ...p, tag: { ...p.tag, synced: true, lastSync: 'just now', displayPrice: p.price, displayName: p.name } } : p)
      };

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const toast = useCallback((msg, color = '#2ecc71') => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'ADD_TOAST', payload: { id, msg, color } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3200);
  }, []);

  const setupSocket = useCallback(() => {
    try {
      socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      socketRef.current.on('tag:sync', (data) => {
        console.log('Received tag sync:', data);
        dispatch({
          type: 'UPDATE_PRODUCT_TAG',
          payload: data
        });
      });

      socketRef.current.on('tag:deleted', (data) => {
        console.log('Tag deleted:', data);
      });

      socketRef.current.on('tag-synced', (data) => {
        console.log('Tag synced:', data);
        dispatch({
          type: 'UPDATE_PRODUCT_TAG',
          payload: data
        });
      });

    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }, []);

  const joinStore = useCallback((storeId) => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('join-store', storeId);
    }
  }, [socketConnected]);

  const joinSupplier = useCallback((supplierId) => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('join-supplier', supplierId);
    }
  }, [socketConnected]);

  const emitSyncTag = useCallback((storeId, productId, tagData) => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('sync-tag', { storeId, productId, tagData });
    }
  }, [socketConnected]);

  useEffect(() => {
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setupSocket]);

  const login = useCallback((email, password) => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (!user) return false;
    dispatch({ type: 'SET_SESSION', payload: { user } });

    if (user.storeId) {
      joinStore(user.storeId);
    } else if (user.supplierId) {
      joinSupplier(user.supplierId);
    }

    return true;
  }, [state.users, joinStore, joinSupplier]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const register = useCallback((data) => {
    const exists = state.users.find(u => u.email === data.email);
    if (exists) return false;
    const newUser = { id: `u${Date.now()}`, status: 'pending', ...data };
    dispatch({ type: 'ADD_USER', payload: newUser });
    return true;
  }, [state.users]);

  const createSubscription = useCallback((userId, planId, billingCycle) => {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) return false;
    const sub = {
      id: `sub${Date.now()}`,
      userId,
      planId,
      billingCycle,
      amount: billingCycle === 'monthly' ? plan.monthly : plan.yearly,
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      paymentMethod: 'Card ending in ****'
    };
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: sub });
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, subscriptionId: sub.id } });
    return true;
  }, []);

  const updateSubscription = useCallback((subId, planId) => {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) return false;
    const sub = state.subscriptions.find(s => s.id === subId);
    if (!sub) return false;
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: {
        id: subId,
        planId,
        amount: sub.billingCycle === 'monthly' ? plan.monthly : plan.yearly
      }
    });
    toast('Subscription updated');
    return true;
  }, [state.subscriptions, toast]);

  const cancelSubscription = useCallback((subId) => {
    dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: { id: subId, status: 'cancelled' }
    });
    toast('Subscription cancelled', '#f39c12');
  }, [toast]);

  const syncTag = useCallback((id) => {
    dispatch({ type: 'SYNC_TAG', payload: id });
    setTimeout(() => {
      dispatch({ type: 'SYNC_TAG_COMPLETE', payload: id });
      toast('Tag synced');
    }, 1800);
  }, [toast]);

  const addOrder = useCallback((order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  }, []);

  const updateOrder = useCallback((order) => {
    dispatch({ type: 'UPDATE_ORDER', payload: order });
  }, []);

  const addProductToStore = useCallback((product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  }, []);

  const updateStoreProduct = useCallback((product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  }, []);

  const addCatalogProduct = useCallback((product) => {
    dispatch({ type: 'ADD_CATALOG_PRODUCT', payload: product });
  }, []);

  const updateCatalogProduct = useCallback((product) => {
    dispatch({ type: 'UPDATE_CATALOG_PRODUCT', payload: product });
  }, []);

  const addPayment = useCallback((payment) => {
    dispatch({ type: 'ADD_PAYMENT', payload: payment });
  }, []);

  const value = {
    ...state,
    plans: PRICING_PLANS,
    toast,
    login,
    logout,
    register,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    syncTag,
    addOrder,
    updateOrder,
    addProductToStore,
    updateStoreProduct,
    addCatalogProduct,
    updateCatalogProduct,
    addPayment,
    socketConnected,
    joinStore,
    joinSupplier,
    emitSyncTag,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useAuth() {
  const { session, login, logout, register } = useApp();
  return {
    session,
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'admin',
    isSupplier: session?.user?.role === 'supplier',
    isStore: session?.user?.role === 'store',
    login,
    logout,
    register,
  };
}

export function useStore() {
  const { allProducts, stores, suppliers, catalog, syncingIds, syncTag, addProductToStore, updateStoreProduct, addCatalogProduct, updateCatalogProduct, joinStore, emitSyncTag } = useApp();
  const { session } = useApp();
  const storeId = session?.user?.storeId;
  const storeProducts = allProducts.filter(p => p.storeId === storeId);
  const supplierId = session?.user?.supplierId;
  const supplierCatalog = catalog.filter(p => p.supplierId === supplierId);

  useEffect(() => {
    if (storeId && session?.user?.role === 'store') {
      joinStore(storeId);
    }
  }, [storeId, session, joinStore]);

  return {
    allProducts,
    storeProducts,
    stores,
    suppliers,
    catalog,
    supplierCatalog,
    syncingIds,
    syncTag,
    addProductToStore,
    updateStoreProduct,
    addCatalogProduct,
    updateCatalogProduct,
    emitSyncTag,
  };
}

export function useOrders() {
  const { allOrders, addOrder, updateOrder, session } = useApp();
  const storeId = session?.user?.storeId;
  const supplierId = session?.user?.supplierId;
  const storeOrders = allOrders.filter(o => o.storeId === storeId);
  const supplierOrders = allOrders.filter(o => o.supplierId === supplierId);

  return {
    allOrders,
    storeOrders,
    supplierOrders,
    addOrder,
    updateOrder,
  };
}

export function useSubscriptions() {
  const { subscriptions, payments, createSubscription, updateSubscription, cancelSubscription, addPayment, session } = useApp();
  const userSubscription = subscriptions.find(s => s.userId === session?.user?.id);
  const userPayments = payments.filter(p => p.userId === session?.user?.id);

  return {
    subscriptions,
    userSubscription,
    payments,
    userPayments,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    addPayment,
  };
}

export function useUsers() {
  const { users, updateUser } = useApp();
  return {
    users,
    updateUser,
    pendingUsers: users.filter(u => u.status === 'pending'),
    activeUsers: users.filter(u => u.status === 'active'),
  };
}

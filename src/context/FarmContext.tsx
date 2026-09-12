import React, { createContext, useContext, useState } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  time: string;
  read: boolean;
  crop?: string;
}

interface FarmContextType {
  selectedFarm: string;
  setSelectedFarm: (farm: string) => void;
  farms: string[];
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'High Blight Warning',
    message: 'Tomato Block 4A canopy showed early alternaria spots via drone scan.',
    type: 'danger',
    time: '15m ago',
    read: false,
    crop: 'Tomato',
  },
  {
    id: 'notif_02',
    title: 'Irrigation Window Approaching',
    message: 'Soil moisture at 68% - automated drip scheduled in ~6 hours for Sector B.',
    type: 'warning',
    time: '45m ago',
    read: false,
    crop: 'Rice',
  },
  {
    id: 'notif_03',
    title: 'Market Spike Alert',
    message: 'Tomato APMC price surged +14.2% to ₹1,850 / Quintal at Kolar Mandi.',
    type: 'success',
    time: '2h ago',
    read: false,
    crop: 'Tomato',
  },
  {
    id: 'notif_04',
    title: 'Monsoon Front Tracked',
    message: '14.5mm rainfall expected in next 48h. Evaporation rate projected to drop.',
    type: 'info',
    time: '4h ago',
    read: true,
  },
];

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farms] = useState<string[]>([
    'Kaveri Delta Smart Agro - Unit 4',
    'Punjab Green Fields - Unit 2',
    'Nashik Horticultural Hub - Sector 1',
    'Guntur Precision Spice Plots',
  ]);
  const [selectedFarm, setSelectedFarm] = useState<string>(farms[0]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <FarmContext.Provider
      value={{
        selectedFarm,
        setSelectedFarm,
        farms,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = (): FarmContextType => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

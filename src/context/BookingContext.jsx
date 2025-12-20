import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { get, post } from '../services/api';
import { useAuth } from './AuthContext';

const BookingContext = createContext(null);

const normalizeBooking = (booking) => {
  if (!booking || typeof booking !== 'object') {
    return null;
  }
  const normalized = { ...booking };
  if (booking._id && !booking.id) {
    normalized.id = booking._id.toString();
  }
  delete normalized._id;
  delete normalized.__v;
  return normalized;
};

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setBookings([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await get('/bookings');
      const list = Array.isArray(data?.bookings)
        ? data.bookings.map((item) => normalizeBooking(item)).filter(Boolean)
        : [];
      setBookings(list);
    } catch (err) {
      console.error('Failed to load bookings', err);
      setError(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = useCallback(
    async (payload) => {
      const response = await post('/bookings', payload);
      const created = normalizeBooking(response?.booking);
      if (created) {
        setBookings((prev) => [created, ...prev]);
      }
      return created;
    },
    []
  );

  const updateBooking = useCallback((bookingId, updater) => {
    setBookings((prev) =>
      prev.map((item) => {
        if (item.id !== bookingId) {
          return item;
        }
        const next = typeof updater === 'function' ? updater(item) : updater;
        return { ...item, ...next };
      })
    );
  }, []);

  const getBooking = useCallback((bookingId) => {
    return bookings.find((item) => item.id === bookingId) || null;
  }, [bookings]);

  const fetchBookingById = useCallback(
    async (bookingId) => {
      if (!bookingId) {
        return null;
      }
      try {
        const data = await get(`/bookings/${bookingId}`);
        const booking = normalizeBooking(data?.booking);
        if (booking) {
          setBookings((prev) => {
            const exists = prev.some((item) => item.id === booking.id);
            if (exists) {
              return prev.map((item) => (item.id === booking.id ? booking : item));
            }
            return [booking, ...prev];
          });
        }
        return booking;
      } catch (err) {
        console.error('Failed to fetch booking by id', err);
        throw err;
      }
    },
    []
  );

  const cancelBooking = useCallback(
    async (bookingId, reason) => {
      if (!bookingId) {
        return null;
      }
      const response = await post(`/bookings/${bookingId}/cancel`, { reason });
      const updated = normalizeBooking(response?.booking);
      if (updated) {
        setBookings((prev) =>
          prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
        );
      }
      return updated;
    },
    []
  );

  const value = useMemo(
    () => ({
      bookings,
      loading,
      error,
      addBooking,
      updateBooking,
      getBooking,
      fetchBookings,
      fetchBookingById,
      cancelBooking
    }),
    [bookings, loading, error, addBooking, updateBooking, getBooking, fetchBookings, fetchBookingById, cancelBooking]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookings must be used within BookingProvider');
  }
  return ctx;
};

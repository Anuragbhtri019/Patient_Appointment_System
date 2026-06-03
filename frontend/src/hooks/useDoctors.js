import { useState, useEffect, useCallback, useRef } from 'react';
import { doctorApi } from '../api/doctor.api';

export const useDoctors = (initialParams = {}) => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialParamsRef = useRef(initialParams);

  useEffect(() => {
    initialParamsRef.current = initialParams;
  }, [initialParams]);

  const refetch = useCallback(
    async (params = initialParamsRef.current) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await doctorApi.getAllDoctors(params);
        const payload = response.data?.data || response.data;
        const nextDoctors = Array.isArray(payload?.doctors)
          ? payload.doctors
          : Array.isArray(payload)
            ? payload
            : [];
        setDoctors(nextDoctors);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch doctors');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { doctors, isLoading, error, refetch };
};

import { useState, useEffect, useCallback } from 'react';
import APIClient from './apiClient';

const apiClient = new APIClient();

function useAPI(endpoint, method = 'GET', dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const unsubscribeStatus = apiClient.statusManager.subscribe(newStatus => {
      setStatus(newStatus);
    });

    const unsubscribeError = apiClient.errorHandler.subscribe(errorData => {
      setError(errorData);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeError();
    };
  }, []);

  const execute = useCallback(async (payload = null) => {
    try {
      setError(null);
      let response;

      switch (method.toUpperCase()) {
        case 'GET':
          response = await apiClient.get(endpoint);
          break;
        case 'POST':
          response = await apiClient.post(endpoint, payload);
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, payload);
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Méthode HTTP non supportée: ${method}`);
      }

      setData(response);
      return response;
    } catch (err) {
      return null;
    }
  }, [endpoint, method]);

  return { data, error, status, execute };
}

export default useAPI;

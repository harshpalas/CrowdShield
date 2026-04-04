import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const useGeolocation = () => {
  const setUserLocation = useStore((state) => state.setUserLocation);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      console.log('User Location Updated:', { lat: latitude, lng: longitude });
    };

    const handleError = (error: GeolocationPositionError) => {
      let message = 'Error getting location';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied. Please enable it in browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out.';
          break;
      }
      toast.error(message, { id: 'geo-error' });
      console.error('Geolocation Error:', error.message);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [setUserLocation]);
};

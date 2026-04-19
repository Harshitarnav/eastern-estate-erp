import { HinglishRouteLoader } from '@/components/HinglishRouteLoader';

export default function BookingsLoading() {
  return <HinglishRouteLoader variant="table" context="bookings" rows={6} />;
}

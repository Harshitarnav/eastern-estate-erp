import { HinglishRouteLoader } from '@/components/HinglishRouteLoader';

export default function DemandDraftsLoading() {
  return <HinglishRouteLoader variant="table" context="finance" rows={8} />;
}

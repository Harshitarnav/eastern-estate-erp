import { HinglishLoader } from '@/components/HinglishLoader';

export default function PortalLoading() {
  return (
    <div className="py-10">
      <HinglishLoader context="portal" label="Aapka portal khul raha hai" />
    </div>
  );
}

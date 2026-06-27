import { useParams } from 'react-router-dom';
import { VendorProductFormPage } from '@/features/vendor/pages/VendorProductFormPage';

export function VendorProductEditPage() {
  const { id } = useParams();
  return <VendorProductFormPage productId={Number(id)} />;
}

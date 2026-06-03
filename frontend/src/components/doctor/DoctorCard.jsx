import { StarIcon } from '@heroicons/react/24/solid';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';

export default function DoctorCard({ doctor, onBookClick, isLoading }) {
  if (isLoading) {
    return <Skeleton variant="card" />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar name={doctor?.name || 'Doctor'} size="lg" src={doctor?.image} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{doctor?.name}</h3>
            <Badge variant="teal" className="mt-2">
              {doctor?.specialization}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-900">Branch:</span> {doctor?.branch}
          </p>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900">Rating:</span>
            <div className="flex items-center gap-0.5">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span>{doctor?.rating?.toFixed(1) || 'N/A'}</span>
            </div>
            {doctor?.reviews_count && (
              <span className="text-gray-500">({doctor?.reviews_count} reviews)</span>
            )}
          </div>
        </div>

        <Button
          onClick={() => onBookClick?.(doctor)}
          fullWidth
          variant="primary"
          size="sm"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}

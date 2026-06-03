import { StarIcon } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export default function DoctorTable({ doctors, onEdit, onDelete }) {
  const doctorList = Array.isArray(doctors) ? doctors : [];

  if (doctorList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No doctors found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Doctor</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">
              Specialization
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Branch</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Rating</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctorList.map((doctor) => (
            <tr key={doctor._id || doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={doctor.name}
                    size="sm"
                    src={doctor.imageUrl || doctor.image}
                  />
                  <span className="font-medium text-gray-900">{doctor.name}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant="teal">{doctor.specialization}</Badge>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {doctor.hospitalBranch || doctor.branch}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>{(doctor.averageRating ?? doctor.rating)?.toFixed?.(1) || 'N/A'}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(doctor)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-4 h-4 text-teal-600" />
                  </button>
                  <button
                    onClick={() => onDelete(doctor._id || doctor.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

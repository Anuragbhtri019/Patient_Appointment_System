import { formatDate, formatTime } from '../../utils/dateUtils';
import Badge from '../common/Badge';

export default function SlotPicker({ slots, selectedSlot, onSelectSlot }) {
  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No available slots found
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(groupedSlots).sort();
  const selectedDate = selectedSlot?.date?.split('T')[0] || dates[0];

  const getStatusVariant = (status) => {
    if (status === 'available') return 'green';
    if (status === 'booked') return 'red';
    return 'gray';
  };

  return (
    <div>
      {/* Date tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => {
              if (groupedSlots[date][0]) {
                onSelectSlot(groupedSlots[date][0]);
              }
            }}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedDate === date
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      {/* Slot grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {groupedSlots[selectedDate]?.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.status === 'available' && onSelectSlot(slot)}
            disabled={slot.status === 'booked'}
            className={`p-4 rounded-lg border-2 font-medium transition-all ${
              selectedSlot?.id === slot.id
                ? 'border-teal-600 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${slot.status === 'booked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="font-semibold text-lg">{formatTime(slot.time)}</div>
            <Badge variant={getStatusVariant(slot.status)} className="mt-2">
              {slot.consultation_type}
            </Badge>
            <div className="text-xs mt-2 text-gray-600">
              {slot.status === 'available' ? 'Available' : 'Booked'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { StarIcon } from "@heroicons/react/24/solid";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Skeleton from "../common/Skeleton";
import { useAuth } from "../../hooks/useAuth";

export default function DoctorCard({ doctor, onBookClick, isLoading }) {
  const { user, isAuthenticated } = useAuth();

  if (isLoading) {
    return <Skeleton variant="card" />;
  }

  const isPatient = user?.role === "patient";
  const isAdmin = user?.role === "admin";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar
            name={doctor?.name || "Doctor"}
            size="lg"
            src={doctor?.imageUrl}
          />

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">
              {doctor?.name}
            </h3>

            <Badge variant="teal" className="mt-2">
              {doctor?.specialization}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-900">Hospital:</span>{" "}
            {doctor?.hospitalBranch}
          </p>

          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900">Rating:</span>

            <div className="flex items-center gap-0.5">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span>{doctor?.averageRating?.toFixed(1) || "N/A"}</span>
            </div>

            {doctor?.totalRatings && (
              <span className="text-gray-500">
                ({doctor?.totalRatings}{" "}
                {doctor?.totalRatings === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>
        </div>

        {/* Guest User */}
        {!isAuthenticated && (
          <Button
            onClick={() => onBookClick?.(doctor)}
            fullWidth
            variant="primary"
            size="sm"
          >
            Login to Book
          </Button>
        )}

        {/* Patient */}
        {isAuthenticated && isPatient && (
          <Button
            onClick={() => onBookClick?.(doctor)}
            fullWidth
            variant="primary"
            size="sm"
          >
            Book Appointment
          </Button>
        )}

        {/* Admin */}
        {isAuthenticated && isAdmin && (
          <Button disabled fullWidth variant="secondary" size="sm">
            Admin Cannot Book
          </Button>
        )}
      </div>
    </div>
  );
}

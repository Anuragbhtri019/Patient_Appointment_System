import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import {
  SPECIALIZATIONS,
  BRANCHES,
  CONSULTATION_TYPES,
} from "../../utils/constants";
import Button from "../common/Button";

export default function SearchFilterBar({ onFilterChange }) {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [hospitalBranch, setHospitalBranch] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const debouncedName = useDebounce(name, 400);

  useEffect(() => {
    const filters = {
      ...(debouncedName && { name: debouncedName }),
      ...(specialization && { specialization }),

      ...(hospitalBranch && { hospitalBranch }),

      ...(consultationType && { consultationType }),
    };

    onFilterChange(filters);
  }, [
    debouncedName,
    specialization,
    hospitalBranch,
    consultationType,
    onFilterChange,
  ]);

  const handleClearFilters = () => {
    setName("");
    setSpecialization("");
    setHospitalBranch("");
    setConsultationType("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Search Filters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Name search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Doctor Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="">All Specializations</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Hospital Branch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hospital Branch
          </label>
          <select
            value={hospitalBranch}
            onChange={(e) => setHospitalBranch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="">All Branches</option>
            {BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Consultation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consultation Type
          </label>
          <select
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="">All Types</option>
            {CONSULTATION_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

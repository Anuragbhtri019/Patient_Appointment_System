import { useState } from "react";
import { SPECIALIZATIONS, BRANCHES } from "../../utils/constants";
import Button from "../common/Button";
import Avatar from "../common/Avatar";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png";

export default function DoctorForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) {
  const [formData, setFormData] = useState(
    initialData
      ? {
          ...initialData,
          branch: initialData.hospitalBranch || initialData.branch || "",
          image: null,
          imagePreview: initialData.imageUrl || null,
        }
      : {
          name: "",
          specialization: "",
          branch: "",
          image: null,
          imagePreview: null,
        },
  );
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.specialization)
      newErrors.specialization = "Specialization is required";
    if (!formData.branch.trim()) newErrors.branch = "Branch is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG and PNG images are accepted",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        image: `Image must be smaller than ${MAX_FILE_SIZE_MB} MB`,
      }));
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Doctor Image
        </label>
        <div className="flex items-center gap-4">
          {formData.imagePreview && (
            <Avatar
              src={formData.imagePreview}
              name={formData.name}
              size="lg"
            />
          )}
          <div className="flex-1">
            <input
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG or PNG, max {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        </div>
        {errors.image && (
          <p className="text-red-600 text-sm mt-1">{errors.image}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Doctor name"
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Specialization */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialization *
        </label>
        <select
          name="specialization"
          value={formData.specialization}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
            errors.specialization ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select specialization</option>
          {SPECIALIZATIONS.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
        {errors.specialization && (
          <p className="text-red-600 text-sm mt-1">{errors.specialization}</p>
        )}
      </div>

      {/* Branch */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Branch *
        </label>
        <input
          type="text"
          name="branch"
          value={formData.branch}
          onChange={handleInputChange}
          list="branches"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none ${
            errors.branch ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Select or enter branch"
        />
        <datalist id="branches">
          {BRANCHES.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        {errors.branch && (
          <p className="text-red-600 text-sm mt-1">{errors.branch}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          fullWidth
        >
          Save Doctor
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          fullWidth
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

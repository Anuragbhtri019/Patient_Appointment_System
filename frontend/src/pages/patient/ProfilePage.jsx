import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import {
  EnvelopeIcon,
  KeyIcon,
  PhotoIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { authApi } from "../../api/auth.api";

// Email availability check hook
// FIX: Added useRef import to this function
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [profileTab, setProfileTab] = useState("info");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Email availability check state
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profileImage: null,
    profileImagePreview: user?.profileImage || null,
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        profileImagePreview: user.profileImage || null,
      }));
    }
  }, [user]);

  //  Email Availability Check

  // Real-time email availability check
  const checkEmailAvailability = useCallback(
    async (email) => {
      // Don't check if email is same as current or empty
      if (!email || email === user?.email) {
        setEmailAvailable(null);
        return;
      }

      // Don't check invalid email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailAvailable(false);
        return;
      }

      setEmailCheckLoading(true);
      try {
        const response = await authApi.checkEmailAvailability({ email });
        setEmailAvailable(response.data.data.available);
      } catch (error) {
        console.error("Email check failed:", error);
        setEmailAvailable(null); // Don't block submission on check failure
      } finally {
        setEmailCheckLoading(false);
      }
    },
    [user?.email],
  );

  // Debounced email check
  const debouncedEmailCheck = useDebounce(checkEmailAvailability, 500);

  // Profile Form Handlers

  const validateProfileForm = () => {
    const errors = {};
    if (!profileForm.name.trim()) errors.name = "Name is required";
    if (!profileForm.email.trim()) errors.email = "Email is required";
    if (
      profileForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)
    ) {
      errors.email = "Invalid email format";
    }

    // Check email availability before submission
    if (profileForm.email !== user?.email && emailAvailable === false) {
      errors.email = "This email is already taken";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));

    // Check email availability when user changes email
    if (name === "email") {
      debouncedEmailCheck(value);
    }

    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setProfileErrors((prev) => ({
        ...prev,
        profileImage: "Only JPG and PNG images are accepted",
      }));
      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setProfileErrors((prev) => ({
        ...prev,
        profileImage: "Image must be smaller than 2 MB",
      }));
      e.target.value = "";
      return;
    }

    setProfileErrors((prev) => ({ ...prev, profileImage: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({
        ...prev,
        profileImage: file,
        profileImagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setIsLoadingProfile(true);
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      if (profileForm.profileImage) {
        formData.append("profileImage", profileForm.profileImage);
      }

      const result = await updateProfile(formData);
      if (result.success) {
        showSuccess("Profile updated successfully!");
        setEmailAvailable(null); // Reset email check state
      } else {
        showError(result.message || "Failed to update profile");
      }
    } catch (error) {
      showError("An error occurred while updating profile");
      console.error(error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  //  Password Form Handlers

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.oldPassword)
      errors.oldPassword = "Current password is required";
    if (!passwordForm.newPassword)
      errors.newPassword = "New password is required";
    if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (
      passwordForm.oldPassword &&
      passwordForm.newPassword &&
      passwordForm.oldPassword === passwordForm.newPassword
    ) {
      errors.newPassword =
        "New password must be different from current password";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsLoadingPassword(true);
    try {
      const result = await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      if (result.success) {
        showSuccess("Password changed successfully!");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showError(result.message || "Failed to change password");
      }
    } catch (error) {
      showError("An error occurred while changing password");
      console.error(error);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information and security
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setProfileTab("info")}
            className={`pb-4 font-medium transition-colors flex items-center gap-2 ${
              profileTab === "info"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <PhotoIcon className="w-5 h-5" />
            Profile Information
          </button>
          <button
            onClick={() => setProfileTab("password")}
            className={`pb-4 font-medium transition-colors flex items-center gap-2 ${
              profileTab === "password"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <KeyIcon className="w-5 h-5" />
            Change Password
          </button>
        </div>
      </div>

      {/* Profile Information Tab */}
      {profileTab === "info" && (
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Profile Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <Avatar
                    src={profileForm.profileImagePreview}
                    name={profileForm.name}
                    size="lg"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleProfileImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    JPG or PNG, max 2 MB. Click to change your profile picture.
                  </p>
                  {profileErrors.profileImage && (
                    <p className="text-red-600 text-sm mt-2">
                      {profileErrors.profileImage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition ${
                  profileErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Your full name"
              />
              {profileErrors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {profileErrors.name}
                </p>
              )}
            </div>

            {/* Email Field with Availability Check */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition pr-10 ${
                    profileErrors.email
                      ? "border-red-500"
                      : emailAvailable === false
                        ? "border-orange-500"
                        : emailAvailable === true
                          ? "border-green-500"
                          : "border-gray-300"
                  }`}
                  placeholder="your@email.com"
                />

                {/* Email availability indicators */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {emailCheckLoading && (
                    <div className="animate-spin">
                      <div className="h-4 w-4 border-2 border-gray-300 border-t-teal-600 rounded-full"></div>
                    </div>
                  )}
                  {!emailCheckLoading && emailAvailable === true && (
                    <CheckIcon
                      className="w-5 h-5 text-green-600"
                      title="Email is available"
                    />
                  )}
                  {!emailCheckLoading && emailAvailable === false && (
                    <XMarkIcon
                      className="w-5 h-5 text-red-600"
                      title="Email is already taken"
                    />
                  )}
                </div>
              </div>

              {/* Helper text and error messages */}
              {profileForm.email === user?.email && (
                <p className="text-xs text-gray-500 mt-1">
                  This is your current email address
                </p>
              )}
              {profileErrors.email ? (
                <p className="text-red-600 text-sm mt-1">
                  {profileErrors.email}
                </p>
              ) : emailAvailable === false &&
                profileForm.email !== user?.email ? (
                <p className="text-orange-600 text-sm mt-1">
                  ⚠️ This email is already in use by another account
                </p>
              ) : emailAvailable === true &&
                profileForm.email !== user?.email ? (
                <p className="text-green-600 text-sm mt-1">
                  ✓ This email is available
                </p>
              ) : null}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoadingProfile}
                disabled={
                  isLoadingProfile ||
                  (profileForm.email !== user?.email &&
                    emailAvailable === false)
                }
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save Changes
              </Button>
              {profileForm.email !== user?.email &&
                emailAvailable === false && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Please choose a different email address to continue
                  </p>
                )}
            </div>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {profileTab === "password" && (
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition ${
                  passwordErrors.oldPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              {passwordErrors.oldPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {passwordErrors.oldPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition ${
                  passwordErrors.newPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters, must be different from current password
              </p>
              {passwordErrors.newPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition ${
                  passwordErrors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoadingPassword}
                disabled={isLoadingPassword}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

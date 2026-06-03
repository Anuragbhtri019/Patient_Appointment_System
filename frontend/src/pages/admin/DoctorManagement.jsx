import { useEffect, useState } from 'react';
import { doctorApi } from '../../api/doctor.api';
import { useDoctors } from '../../hooks/useDoctors';
import DoctorTable from '../../components/doctor/DoctorTable';
import DoctorForm from '../../components/doctor/DoctorForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function DoctorManagement() {
  const { doctors, isLoading, refetch } = useDoctors();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const { showSuccess, showError } = useToast();

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setIsFormModalOpen(true);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsFormModalOpen(true);
  };

  const handleDeleteDoctor = (doctorId) => {
    setDeleteConfirm(doctorId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeletingId(deleteConfirm);
    try {
      await doctorApi.deleteDoctor(deleteConfirm);
      showSuccess('Doctor deleted successfully');
      refetch();
    } catch (error) {
      showError('Failed to delete doctor');
    } finally {
      setDeleteConfirm(null);
      setIsDeletingId(null);
    }
  };

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('specialization', formData.specialization);
      submitData.append('hospitalBranch', formData.branch);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (selectedDoctor?.id) {
        await doctorApi.updateDoctor(selectedDoctor.id, submitData);
        showSuccess('Doctor updated successfully');
      } else {
        await doctorApi.createDoctor(submitData);
        showSuccess('Doctor added successfully');
      }

      setIsFormModalOpen(false);
      setSelectedDoctor(null);
      refetch();
    } catch (error) {
      showError(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
          <p className="text-gray-600 mt-1">Manage all doctors in the system</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddDoctor}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Doctor
        </Button>
      </div>

      {/* Doctor table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading doctors...</div>
        ) : (
          <DoctorTable
            doctors={doctors}
            onEdit={handleEditDoctor}
            onDelete={handleDeleteDoctor}
          />
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedDoctor(null);
        }}
        title={selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        size="md"
      >
        <DoctorForm
          initialData={selectedDoctor}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setIsFormModalOpen(false);
            setSelectedDoctor(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete"
          size="sm"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this doctor? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={confirmDelete}
              isLoading={isDeletingId === deleteConfirm}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

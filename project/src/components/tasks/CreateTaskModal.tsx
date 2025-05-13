import { useEffect, useState } from 'react';
import { X, Calendar, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTaskStore } from '../../stores/taskStore';
import { useUserStore } from '../../stores/userStore';
import { TaskStatus } from '../../types';

interface CreateTaskFormData {
  title: string;
  description: string;
  dueDate: string;
  assignedTo: number;
}

interface CreateTaskModalProps {
  onClose: () => void;
}

const CreateTaskModal = ({ onClose }: CreateTaskModalProps) => {
  const { createTask } = useTaskStore();
  const { users, getUsers, loading: usersLoading } = useUserStore();
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormData>();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL for image files
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      // In a real app, you would upload the file to a storage service
      // and get back a URL to store in the task
      let attachmentUrl = undefined;
      
      if (file) {
        // Mock URL for demonstration
        attachmentUrl = URL.createObjectURL(file);
      }
      
      await createTask({
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        assignedTo: Number(data.assignedTo),
        status: TaskStatus.PENDING,
        completionPercentage: 0,
        attachmentUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-lg max-w-lg w-full mx-4 sm:mx-auto shadow-xl transform transition-all z-10 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Task Title
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Description is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="dueDate"
                  {...register('dueDate', { required: 'Due date is required' })}
                  className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-sm text-error-600">{errors.dueDate.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                id="assignedTo"
                {...register('assignedTo', { required: 'Please select a user' })}
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select a user</option>
                {usersLoading ? (
                  <option disabled>Loading users...</option>
                ) : (
                  users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))
                )}
              </select>
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-error-600">{errors.assignedTo.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachment (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              
              {filePreviewUrl && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                  <div className="relative w-20 h-20">
                    <img
                      src={filePreviewUrl}
                      alt="File preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm text-gray-400 hover:text-gray-500"
                      onClick={() => {
                        setFile(null);
                        setFilePreviewUrl(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {file && !filePreviewUrl && (
                <div className="mt-3 flex items-center">
                  <div className="flex-1 text-sm text-gray-500 truncate">
                    {file.name}
                  </div>
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-gray-500"
                    onClick={() => {
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
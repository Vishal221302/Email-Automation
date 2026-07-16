import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { User, KeyRound, Save, Mail, MapPin, Globe, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { TIMEZONES, LANGUAGES } from '../constants/mockData';
import { updateProfile, changePassword } from '../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // Profile Form (Automatically populates using state.auth.user)
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    values: {
      name: user?.name || '',
      email: user?.email || '',
      timezone: user?.timezone || 'Asia/Kolkata',
      language: user?.language || 'en-US'
    }
  });

  // Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsPhotoUploading(true);
      setTimeout(() => {
        setProfilePhoto(URL.createObjectURL(file));
        setIsPhotoUploading(false);
        toast.success('Photo Uploaded', 'Your profile image has been updated.');
      }, 1000);
    }
  };

  const onProfileSubmit = async (data) => {
    setIsProfileSaving(true);
    try {
      const result = await dispatch(updateProfile(data)).unwrap();
      toast.success('Profile Saved', 'Personal settings updated successfully.');
    } catch (err) {
      toast.error('Save Failed', err || 'Failed to update settings');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Password Mismatch', 'New passwords do not match.');
      return;
    }
    
    setIsPasswordSaving(true);
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })).unwrap();
      toast.success('Password Updated', 'Your security password was changed successfully.');
      resetPassword();
    } catch (err) {
      toast.error('Update Failed', err || 'Current password is incorrect');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // Get Initials for Profile Circle
  const getInitials = (fullName) => {
    if (!fullName) return 'AH';
    const parts = fullName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
          User Settings
        </h1>
        <p className="text-sm text-slate-450 dark:text-slate-400 mt-1">
          Configure profile details and sign-in credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Photo */}
        <Card className="flex flex-col items-center text-center gap-4 relative overflow-hidden h-fit">
          <div className="w-full h-24 bg-gradient-to-r from-primary to-secondary absolute top-0 left-0" />
          
          <div className="relative mt-10">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-3xl shadow-md border-4 border-white dark:border-slate-800">
                {getInitials(user?.name)}
              </div>
            )}
            
            <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white border border-white dark:border-slate-850 hover:bg-primary-hover shadow-sm cursor-pointer transition-colors">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              {isPhotoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5" />}
            </label>
          </div>

          <div className="flex flex-col mt-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{user?.name || 'Workspace Member'}</span>
            <span className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">SaaS Administrator</span>
          </div>

          <div className="w-full border-t border-slate-100 dark:border-slate-800/80 my-2" />

          <div className="w-full flex flex-col gap-2.5 text-xs text-slate-500 text-left">
            <div className="flex gap-2.5 items-center">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email || 'No email synced'}</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Location: Remote</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Timezone: {user?.timezone || 'Asia/Kolkata'}</span>
            </div>
          </div>
        </Card>

        {/* Edit profile form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
            <Card className="flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
                <User className="w-4.5 h-4.5 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Personal Profile</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Alex Harrison"
                  error={profileErrors.name?.message}
                  {...registerProfile('name', { required: 'Name is required' })}
                />
                
                <Input
                  label="Email Address"
                  placeholder="alex.harrison.dev@gmail.com"
                  error={profileErrors.email?.message}
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email'
                    }
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timezone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Default Timezone
                  </label>
                  <select
                    {...registerProfile('timezone')}
                    className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-705 dark:text-slate-200 font-semibold"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Interface Language
                  </label>
                  <select
                    {...registerProfile('language')}
                    className="w-full py-2 px-3 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-705 dark:text-slate-200 font-semibold"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
                <Button type="submit" variant="primary" size="md" isLoading={isProfileSaving} icon={Save}>
                  Save Profile Settings
                </Button>
              </div>
            </Card>
          </form>

          {/* Change Password Card */}
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
            <Card className="flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
                <KeyRound className="w-4.5 h-4.5 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="password"
                  label="Current Password"
                  placeholder="••••••••"
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                />
                
                <Input
                  type="password"
                  label="New Password"
                  placeholder="••••••••"
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Min length 6 characters' }
                  })}
                />
                
                <Input
                  type="password"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword', { required: 'Please confirm password' })}
                />
              </div>

              <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
                <Button type="submit" variant="outline" size="md" isLoading={isPasswordSaving} icon={Save}>
                  Update Password
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAppContext } from './AppContext';
import { User, Camera, X } from 'lucide-react';

const UserProfile = () => {
    const { user, db, storage, navigate, updateUserProfile } = useAppContext();
    const [profile, setProfile] = useState({
        name: '',
        nickname: '',
        avatarUrl: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [message, setMessage] = useState(null);
    const [originalProfile, setOriginalProfile] = useState({});
    const fileInputRef = useRef(null);

    // Load user profile data
    useEffect(() => {
        if (user) {
            loadUserProfile();
        }
    }, [user]);

    const loadUserProfile = async () => {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const profileData = {
                    name: userData.name || '',
                    nickname: userData.nickname || '',
                    avatarUrl: userData.avatarUrl || ''
                };
                setProfile(profileData);
                setOriginalProfile(profileData);
            } else {
                // Create new user profile
                const newProfile = {
                    name: '',
                    nickname: '',
                    avatarUrl: '',
                    email: user.email,
                    createdAt: new Date()
                };
                await setDoc(userRef, newProfile);
                setProfile({ name: '', nickname: '', avatarUrl: '' });
                setOriginalProfile({ name: '', nickname: '', avatarUrl: '' });
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const startEditing = () => {
        setIsEditing(true);
        setMessage(null);
    };

    const cancelEditing = () => {
        setProfile(originalProfile);
        setIsEditing(false);
        setMessage(null);
    };

    const saveProfile = async () => {
        if (!user) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                ...profile,
                email: user.email,
                updatedAt: new Date()
            }, { merge: true });

            setOriginalProfile(profile);
            setIsEditing(false);
            updateUserProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = () => {
        return profile.name !== originalProfile.name || 
               profile.nickname !== originalProfile.nickname ||
               profile.avatarUrl !== originalProfile.avatarUrl;
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file.' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
            return;
        }

        setIsUploadingAvatar(true);
        setMessage(null);

        try {
            const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const updatedProfile = {
                ...profile,
                avatarUrl: downloadURL
            };
            setProfile(updatedProfile);
            updateUserProfile(updatedProfile);
            setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setMessage({ type: 'error', text: 'Failed to upload avatar. Please try again.' });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const removeAvatar = () => {
        const updatedProfile = {
            ...profile,
            avatarUrl: ''
        };
        setProfile(updatedProfile);
        updateUserProfile(updatedProfile);
        setMessage({ type: 'success', text: 'Avatar removed successfully!' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate('products')} 
                        className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        &larr; Back to Products
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your account information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    {message && (
                        <div className={`p-4 rounded-md mb-6 ${
                            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Avatar Section */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                                {profile.avatarUrl ? (
                                    <img 
                                        src={profile.avatarUrl} 
                                        alt="User Avatar" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600 ${profile.avatarUrl ? 'hidden' : ''}`}>
                                    {getInitials(profile.name)}
                                </div>
                            </div>
                            
                            {/* Avatar Upload Overlay */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        className="text-white hover:text-gray-200 disabled:opacity-50"
                                    >
                                        {isUploadingAvatar ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <Camera size={32} />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Avatar Actions */}
                        {isEditing && (
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm"
                                >
                                    {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                                </button>
                                {profile.avatarUrl && (
                                    <button
                                        onClick={removeAvatar}
                                        disabled={isUploadingAvatar}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                                    >
                                        <X size={16} />
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={user?.email || ''} 
                            disabled 
                            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Name Field */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                            Full Name
                        </label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                id="name"
                                value={profile.name} 
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <div className="w-full px-3 py-2 border rounded-lg bg-gray-50">
                                {profile.name || <span className="text-gray-400">No name set</span>}
                            </div>
                        )}
                    </div>

                    {/* Nickname Field */}
                    <div className="mb-8">
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="nickname">
                            Nickname
                        </label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                id="nickname"
                                value={profile.nickname} 
                                onChange={(e) => handleInputChange('nickname', e.target.value)}
                                placeholder="Enter your nickname"
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <div className="w-full px-3 py-2 border rounded-lg bg-gray-50">
                                {profile.nickname || <span className="text-gray-400">No nickname set</span>}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={saveProfile}
                                    disabled={isSaving || !hasChanges()}
                                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Saving...' : 'Update Profile'}
                                </button>
                                <button 
                                    onClick={cancelEditing}
                                    disabled={isSaving}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 disabled:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={startEditing}
                                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Profile Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Account Created:</span>
                                <p>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
                            </div>
                            <div>
                                <span className="font-medium">Last Sign In:</span>
                                <p>{user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

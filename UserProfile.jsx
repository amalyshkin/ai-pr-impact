import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppContext } from './AppContext';

const UserProfile = () => {
    const { user, db, navigate } = useAppContext();
    const [profile, setProfile] = useState({
        name: '',
        nickname: '',
        avatarUrl: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [originalProfile, setOriginalProfile] = useState({});
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = () => {
        return profile.name !== originalProfile.name || profile.nickname !== originalProfile.nickname;
    };

    const handleAvatarSelect = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setSelectedAvatar(null);
            return;
        }

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select a valid image file.' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setMessage({ type: 'error', text: 'Image file size must be less than 5MB.' });
            return;
        }

        setSelectedAvatar(file);
        setMessage(null);
    };

    const uploadAvatar = async () => {
        if (!selectedAvatar) return;

        setIsUploadingAvatar(true);
        setMessage(null);

        try {
            // Convert image to base64 for storage
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64Image = e.target.result;
                    
                    // Update profile with new avatar
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, {
                        ...profile,
                        avatarUrl: base64Image,
                        email: user.email,
                        updatedAt: new Date()
                    }, { merge: true });

                    setProfile(prev => ({ ...prev, avatarUrl: base64Image }));
                    setOriginalProfile(prev => ({ ...prev, avatarUrl: base64Image }));
                    setSelectedAvatar(null);
                    
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }

                    setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
                } catch (error) {
                    console.error('Error uploading avatar:', error);
                    setMessage({ type: 'error', text: 'Failed to upload avatar. Please try again.' });
                } finally {
                    setIsUploadingAvatar(false);
                }
            };
            reader.readAsDataURL(selectedAvatar);
        } catch (error) {
            console.error('Error processing avatar:', error);
            setMessage({ type: 'error', text: 'Error processing image file.' });
            setIsUploadingAvatar(false);
        }
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
                    <div className="mb-8 text-center">
                        <div className="flex flex-col items-center">
                            {/* Avatar Display */}
                            <div className="mb-4">
                                {profile.avatarUrl ? (
                                    <img 
                                        src={profile.avatarUrl} 
                                        alt="User Avatar" 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Avatar Upload */}
                            <div className="space-y-3">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleAvatarSelect}
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Choose Avatar
                                </button>
                                
                                {selectedAvatar && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">
                                            Selected: {selectedAvatar.name}
                                        </p>
                                        <button 
                                            onClick={uploadAvatar}
                                            disabled={isUploadingAvatar}
                                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300 transition-colors"
                                        >
                                            {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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

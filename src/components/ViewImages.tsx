import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ImageData {
    id: string;
    file_path: string;
    created_at: string;
}

// Component for viewing images
interface ViewImagesProps {
    entryId: string;
    images: ImageData[];
}

export function ViewImages({ images }: ViewImagesProps) {
    const getImageUrl = (filePath: string) => {
        return supabase.storage
            .from('entry-images')
            .getPublicUrl(filePath).data.publicUrl;
    };

    if (images.length === 0) return null;

    return (
        <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attached Images
            </h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image) => (
                    <div key={image.id} className="relative group">
                        <img
                            src={getImageUrl(image.file_path)}
                            alt="Entry attachment"
                            className="h-32 w-full object-cover rounded-lg"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Component for editing images
interface EditImagesProps {
    entryId: string;
    images: ImageData[];
    onImagesChange: () => void;
}

export function EditImages({ entryId, images, onImagesChange }: EditImagesProps) {
    const getImageUrl = (filePath: string) => {
        return supabase.storage
            .from('entry-images')
            .getPublicUrl(filePath).data.publicUrl;
    };

    const handleDelete = async (image: ImageData) => {
        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('entry-images')
                .remove([image.file_path]);

            if (storageError) throw storageError;

            // Delete from database
            const { error: dbError } = await supabase
                .from('entry_images')
                .delete()
                .eq('id', image.id);

            if (dbError) throw dbError;

            toast.success('Image deleted successfully');
            onImagesChange();
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        }
    };

    return (
        <div className="space-y-4">
            <ImageUploader
                files={[]}
                onChange={(files) => {
                    // This will be handled by the parent component
                    console.log('New files:', files);
                }}
            />

            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative group">
                            <img
                                src={getImageUrl(image.file_path)}
                                alt="Entry attachment"
                                className="h-32 w-full object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => handleDelete(image)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
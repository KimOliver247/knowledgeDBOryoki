import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ImageUploader } from './ImageUploader';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

interface ImageData {
    id: string;
    file_path: string;
    created_at: string;
}

interface EditImagesProps {
    entryId: string;
    images: ImageData[];
    onImagesChange: () => void;
}

export function EditImages({ entryId, images, onImagesChange }: EditImagesProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const getImageUrl = (filePath: string) => {
        return supabase.storage
            .from('entry-images')
            .getPublicUrl(filePath).data.publicUrl;
    };

    const handleDelete = async (image: ImageData, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the image when clicking delete

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

    const handleNewImages = async (files: File[]) => {
        setIsUploading(true);
        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${entryId}/${Date.now()}.${fileExt}`;

                // Upload to storage
                const { error: uploadError } = await supabase.storage
                    .from('entry-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Create database entry
                const { error: dbError } = await supabase
                    .from('entry_images')
                    .insert([{
                        entry_id: entryId,
                        file_path: fileName,
                        created_at: new Date().toISOString()
                    }]);

                if (dbError) throw dbError;
            }

            toast.success('Images uploaded successfully');
            onImagesChange();
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className={`${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ImageUploader
                        files={[]}
                        onChange={handleNewImages}
                        maxFiles={5}
                    />
                </div>

                {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="relative group cursor-pointer"
                                onClick={() => setSelectedImage(image.file_path)}
                            >
                                <div className="overflow-hidden rounded-lg">
                                    <img
                                        src={getImageUrl(image.file_path)}
                                        alt="Entry attachment"
                                        className="h-32 w-full object-cover rounded-lg transition-all duration-300 transform group-hover:scale-110"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => handleDelete(image, e)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full-size image modal */}
            {selectedImage && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative w-screen h-screen flex items-center justify-center p-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={getImageUrl(selectedImage)}
                            alt="Full size view"
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
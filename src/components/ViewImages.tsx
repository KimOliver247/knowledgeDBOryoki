import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createPortal } from 'react-dom';

interface ImageData {
    id: string;
    file_path: string;
    created_at: string;
}

interface ViewImagesProps {
    images: ImageData[];
}

export function ViewImages({ images }: ViewImagesProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const getImageUrl = (filePath: string) => {
        return supabase.storage
            .from('entry-images')
            .getPublicUrl(filePath).data.publicUrl;
    };

    if (images.length === 0) return null;

    return (
        <>
            <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attached Images
                </h4>
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
                        </div>
                    ))}
                </div>
            </div>

            {/* Full-size image modal - rendered at root level */}
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
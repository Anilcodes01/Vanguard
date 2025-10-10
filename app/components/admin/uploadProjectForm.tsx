"use client";

import { useState } from 'react';

const projectDomains = [
  "Web Development", "Mobile Development", "Machine Learning", "AI / NLP",
  "Data Analytics", "UI/UX Design", "DevOps", "Game Development",
];

export default function UploadProjectForm() {
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsUploading(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        
        const file = formData.get('coverImage') as File;
        if (!file || file.size === 0) {
            setMessage({ type: 'error', text: 'Please select a cover image.' });
            setIsUploading(false);
            return;
        }

        try {
            const response = await fetch('/api/admin/uploadProject', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            setMessage({ type: 'success', text: result.message });
            (event.target as HTMLFormElement).reset(); 
        } catch (error) {
            if (error instanceof Error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'An unknown error occurred.' });
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-[#3b3b3b] p-8 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-center text-white mb-4">Upload New Project</h2>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Project Name</label>
                <input type="text" name="name" id="name" required className="mt-1 block w-full bg-[#262626] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-300">Domain</label>
                <select name="domain" id="domain" required className="mt-1 block w-full bg-[#262626] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a domain</option>
                    {projectDomains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="maxTime" className="block text-sm font-medium text-gray-300">{'Max Time (e.g., "5 days")'}</label>
                <input type="text" name="maxTime" id="maxTime" required className="mt-1 block w-full bg-[#262626] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                <textarea name="description" id="description" rows={4} required className="mt-1 block w-full bg-[#262626] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            
            <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300">Cover Image</label>
                <input 
                    type="file" 
                    name="coverImage" 
                    id="coverImage" 
                    required
                    accept="image/png, image/jpeg, image/webp"
                    className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            <button type="submit" disabled={isUploading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isUploading ? 'Uploading...' : 'Upload Project'}
            </button>
            
            {message && (
                <p className={`mt-4 text-center text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.text}
                </p>
            )}
        </form>
    );
}
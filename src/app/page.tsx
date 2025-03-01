'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { MessageInput } from '@/types/message';

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
};

export default function Home() {
  const [formData, setFormData] = useState<MessageInput>({
    name: '',
    content: '',
    dream: '',
  });
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const messageData = {
      ...formData,
      image: image || undefined,
    };

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        setFormData({ name: '', content: '', dream: '' });
        setImage(null);
        alert('留言已送出！');
      } else {
        throw new Error('送出失敗');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('發送失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-teal-500 p-4">
      <div className="max-w-md mx-auto bg-white/90 rounded-lg p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center mb-6">BNI富揚白金名人堂分會</h1>
        <h2 className="text-xl text-center mb-8">留言牆</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">您的姓名</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="請輸入您的名字"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">我想要對富揚說</label>
            <textarea
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="分享您對富揚的話"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">我的夢幻引薦</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.dream}
              onChange={(e) => setFormData({ ...formData, dream: e.target.value })}
              placeholder="描述您的夢幻引薦"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">上傳圖片</label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500"
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={image}
                    alt="Uploaded preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <p className="text-gray-500">點擊或拖曳圖片至此處上傳</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '送出中...' : '送出留言'}
          </button>
        </form>
      </div>
    </main>
  );
}

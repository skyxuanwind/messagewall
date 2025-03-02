import dynamic from 'next/dynamic';

const WallClient = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => (
    <main className="relative min-h-screen bg-gradient-to-b from-blue-900 to-teal-500 overflow-hidden">
      <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white opacity-20 whitespace-nowrap">
        BNI富揚白金名人堂留言牆
      </h1>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        正在載入...
      </div>
    </main>
  ),
});

export default function Wall() {
  return <WallClient />;
} 
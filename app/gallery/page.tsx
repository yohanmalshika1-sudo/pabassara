import { supabase } from '@/lib/supabase';

export const revalidate = 60;

export default async function GalleryPage() {
  let photos: Array<{ id: number; title: string; category: string | null; image_url: string }> = [];
  let galleryError = '';

  if (supabase) {
    const result = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    photos = result.data ?? [];
    galleryError = result.error?.message ?? '';
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-8">ඡායාරූප ගැලරිය</h1>
      {galleryError && (
        <p className="text-center text-red-500 mb-6">Gallery data could not be loaded. Check the Supabase table and policies.</p>
      )}
      {photos.length === 0 ? (
        <p className="text-center text-slate-500">Gallery items are not available yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-slate-500">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
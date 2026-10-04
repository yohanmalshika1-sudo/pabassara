import { supabase } from '@/lib/supabase';
import { SiteImage } from '@/lib/site-image';

export const revalidate = 0;

export default async function GalleryPage() {
  let photos: Array<{ id: number; title: string; category: string | null; description?: string; image_url: string }> = [];
  let galleryError = '';

  if (supabase) {
    const result = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    photos = result.data ?? [];
    galleryError = result.error?.message ?? '';
  }
  const gridColumnsClass = photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-8">ඡායාරූප ගැලරිය</h1>
      {galleryError && (
        <p className="text-center text-red-500 mb-6">Gallery data could not be loaded. Check the Supabase table and policies.</p>
      )}
      {photos.length === 0 ? (
        <p className="text-center text-slate-500">Gallery items are not available yet.</p>
      ) : (
        <div className={`grid ${gridColumnsClass} gap-2 sm:gap-6`}>
          {photos.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <SiteImage src={item.image_url} alt={item.title} loading="lazy" decoding="async" className="h-20 w-full bg-slate-950 object-contain sm:h-48" />
              <div className="p-1.5 sm:p-4">
                <h3 className="line-clamp-2 text-[10px] font-semibold leading-tight sm:text-base">{item.title}</h3>
                <span className="text-[9px] text-slate-500 sm:text-xs">{item.category}</span>
                {item.description && <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-slate-600 sm:mt-2 sm:text-sm">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
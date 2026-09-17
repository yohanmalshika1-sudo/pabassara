import { supabase } from '@/lib/supabase';

export const revalidate = 60;

export default async function GalleryPage() {
  const { data: photos } = await supabase.from('gallery').select('*');

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-8">ඡායාරූප ගැලරිය</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos?.map((item) => (
          <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
            <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <span className="text-xs text-slate-500">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
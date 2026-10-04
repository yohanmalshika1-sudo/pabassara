import Image, { type ImageProps } from 'next/image';

type SiteImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

const IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

function canOptimizeImage(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === 'https:'
      && url.hostname.endsWith('.supabase.co')
      && url.pathname.startsWith('/storage/v1/object/public/');
  } catch {
    return src.startsWith('/') && !src.startsWith('//');
  }
}

export function SiteImage({ src, alt, unoptimized, ...props }: SiteImageProps) {
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      width={props.width ?? 1200}
      height={props.height ?? 800}
      sizes={props.sizes ?? IMAGE_SIZES}
      quality={props.quality ?? 75}
      unoptimized={unoptimized ?? !canOptimizeImage(src)}
    />
  );
}

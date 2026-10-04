import { ImageResponse } from 'next/og';

export const alt = 'Sri Bodhirukkarama Temple, Ganihimulla, Devalapola';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at 50% 35%, #253322 0%, #0b1514 55%, #050a0b 100%)',
          color: '#fff7df',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 28,
            border: '2px solid rgba(245, 196, 81, 0.55)',
            borderRadius: 28,
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 70 }}>
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 56,
              border: '3px solid #f5c451',
              color: '#f5c451',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 58,
              marginBottom: 34,
            }}
          >
            ☸
          </div>
          <div style={{ color: '#f5c451', fontSize: 26, letterSpacing: 8, marginBottom: 18 }}>
            SRI BODHIRUKKARAMA TEMPLE
          </div>
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.15 }}>
            PABASSARA
          </div>
          <div style={{ color: '#eadcb9', fontSize: 28, marginTop: 22 }}>
            GANIHIMULLA · DEVALAPOLA · SRI LANKA
          </div>
        </div>
      </div>
    ),
    size,
  );
}

import { Suspense, lazy, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'

const CreditCard3D = lazy(() => import('./CreditCard3D'))
const ParticleField = lazy(() => import('./ParticleField'))

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#7C3AED" />
      <pointLight position={[-3, -2, 4]} intensity={0.6} color="#F59E0B" />
      <pointLight position={[0, 3, 3]} intensity={0.3} color="#ffffff" />
      <Suspense fallback={null}>
        <CreditCard3D />
        <ParticleField />
        <Environment preset="city" />
      </Suspense>
    </>
  )
}

function CSSFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-[320px] h-[200px] rounded-2xl shadow-2xl shadow-[#7C3AED]/20"
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)',
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        <div className="p-5 h-full flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold tracking-tight">CreditCheck</span>
            <div className="w-6 h-6 rounded-full bg-white/20" />
          </div>
          <div>
            <div className="w-10 h-7 rounded bg-amber-400/80 mb-4" />
            <p className="text-sm tracking-[0.2em] opacity-80">
              ••••  ••••  ••••  4242
            </p>
          </div>
          <div className="flex justify-between text-xs opacity-60">
            <span>JOHN DOE</span>
            <span>12/28</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroScene() {
  const [canRender3D, setCanRender3D] = useState(true)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 4) {
      setCanRender3D(false)
    }
  }, [])

  if (!canRender3D) {
    return <CSSFallback />
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  )
}

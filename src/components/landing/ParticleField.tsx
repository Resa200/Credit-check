import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 60

export default function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4 - 1
      ),
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.04,
      isAmber: i % 5 === 0,
    }))
  }, [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(t * p.speed + p.offset) * 0.3,
        p.position.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.2,
        p.position.z + Math.sin(t * p.speed * 0.5 + p.offset) * 0.15
      )
      const pulse = 1 + Math.sin(t * 2 + p.offset) * 0.3
      dummy.scale.setScalar(p.scale * pulse)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {/* Violet particles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </instancedMesh>

      {/* A few larger accent orbs */}
      {[
        { pos: [2.5, 1.2, -1] as [number, number, number], color: '#F59E0B', size: 0.06 },
        { pos: [-2.8, -0.8, -0.5] as [number, number, number], color: '#F59E0B', size: 0.05 },
        { pos: [1.5, -1.5, -1.5] as [number, number, number], color: '#7C3AED', size: 0.08 },
        { pos: [-1.8, 1.5, -2] as [number, number, number], color: '#A78BFA', size: 0.07 },
      ].map((orb, i) => (
        <mesh key={i} position={orb.pos}>
          <sphereGeometry args={[orb.size, 16, 16]} />
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </>
  )
}

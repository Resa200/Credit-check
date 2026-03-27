import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

export default function CreditCard3D() {
  const groupRef = useRef<THREE.Group>(null)
  const { pointer } = useThree()
  const targetRotation = useRef({ x: 0, y: 0 })

  // Chip geometry
  const chipGeometry = useMemo(() => new THREE.PlaneGeometry(0.4, 0.3), [])
  const chipMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D4A843',
        metalness: 0.9,
        roughness: 0.2,
      }),
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    // Gentle float
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.15

    // Mouse-follow tilt
    targetRotation.current.x = pointer.y * 0.15
    targetRotation.current.y = pointer.x * 0.25 + t * 0.15

    // Lerp to target
    groupRef.current.rotation.x +=
      (targetRotation.current.x - groupRef.current.rotation.x) * 0.05
    groupRef.current.rotation.y +=
      (targetRotation.current.y - groupRef.current.rotation.y) * 0.05
  })

  return (
    <group ref={groupRef}>
      {/* Card body */}
      <RoundedBox args={[3.4, 2.1, 0.06]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial
          color="#7C3AED"
          metalness={0.6}
          roughness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Violet gradient overlay - subtle lighter panel */}
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[3.2, 1.9]} />
        <meshStandardMaterial
          color="#8B5CF6"
          transparent
          opacity={0.15}
          roughness={0.5}
        />
      </mesh>

      {/* Chip */}
      <mesh
        position={[-0.8, 0.3, 0.035]}
        geometry={chipGeometry}
        material={chipMaterial}
      />

      {/* Chip lines */}
      {[0, 1, 2].map((i) => (
        <mesh key={`h${i}`} position={[-0.8, 0.3 + (i - 1) * 0.08, 0.036]}>
          <planeGeometry args={[0.38, 0.005]} />
          <meshBasicMaterial color="#C49B35" />
        </mesh>
      ))}
      <mesh position={[-0.8, 0.3, 0.036]}>
        <planeGeometry args={[0.005, 0.28]} />
        <meshBasicMaterial color="#C49B35" />
      </mesh>

      {/* CreditCheck branding */}
      <Text
        position={[-0.9, 0.78, 0.035]}
        fontSize={0.18}
        color="white"
        anchorX="left"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"
      >
        CreditCheck
      </Text>

      {/* Card number */}
      <Text
        position={[0, -0.15, 0.035]}
        fontSize={0.2}
        color="rgba(255,255,255,0.85)"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"
      >
        ••••  ••••  ••••  4242
      </Text>

      {/* Cardholder */}
      <Text
        position={[-0.9, -0.7, 0.035]}
        fontSize={0.12}
        color="rgba(255,255,255,0.7)"
        anchorX="left"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"
      >
        Theresa Sunday
      </Text>

      {/* Expiry */}
      <Text
        position={[0.9, -0.7, 0.035]}
        fontSize={0.12}
        color="rgba(255,255,255,0.7)"
        anchorX="right"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"
      >
        12/28
      </Text>

      {/* Shield icon - simple geometric shape */}
      <mesh position={[1.2, 0.7, 0.035]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}

import { useRef, useReducer, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, useTexture, RoundedBox } from '@react-three/drei'
import { Vector3, MathUtils, RepeatWrapping } from 'three'
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier'
import { easing } from 'maath'

import './index.css'

const accents = ['#ff0000', '#00ff00', '#0000ff', '#aa00ff', '#00ffff', '#ffff00', '#999999']
const shuffle = (accent = 0) => [
  { color: '#444', roughness: 0.01, metalness: 0.9 },
  { color: '#444', roughness: 0.01, metalness: 0.9 },
  { color: '#444', roughness: 0.01, metalness: 0.9 },
  { color: 'white', roughness: 0.01, metalness: 0.1 },
  { color: 'white', roughness: 0.01, metalness: 0.1 },
  { color: 'white', roughness: 0.01, metalness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: '#222', roughness: 0.01 },
  { color: '#222', roughness: 0.03 },
  { color: '#222', roughness: 0.03 },
  { color: '#ff00aa', roughness: 0.01 },
  { color: '#ff00aa', roughness: 0.02 },
  { color: '#ff00aa', roughness: 0.01 },
  { color: accents[accent], roughness: 0.01, accent: true, transparent: true, opacity: 0.5 },
  { color: accents[accent], roughness: 0.03, accent: true },
  { color: accents[accent], roughness: 0.01, accent: true }
]

export default function App(props) {
  const [accent, click] = useReducer((state) => ++state % accents.length, 0)
  const connectors = useMemo(() => shuffle(accent), [accent])

  return (
  <>

  <Canvas 
  flat 
  shadows 
  onClick={click} 
  dpr={[1, 1.5]} 
  gl={{ antialias: true }} 
  camera={{ position: [0, 0, 30], 
    fov: 17.5, 
    near: 1, 
    far: 1000 }} 
  {...props}>

      <color attach="background" args={[0x999999]} />

      <OrbitControls />

      <Physics 
        timeStep="vary" 
        gravity={[0, 0, 0]}>
        {connectors.map((props, i) => (
        
        <Sphere 
        key={i} 
        {...props} />
        ))}
      </Physics>
      
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={100} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="ring" color="#4060ff" intensity={80} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[10, 10, 0]} scale={10} />
        </group>
      </Environment>
    </Canvas>
  </>
  )
}

function Sphere({ position, children, vec = new Vector3(), scale, r = MathUtils.randFloatSpread, accent, color = 'white', ...props }) {
  
  const api = useRef()
  const ref = useRef()
  const pos = useMemo(() => position || [r(10), r(10), r(10)], [])

  const [normalMap01, normalMap02, normalMap03, normalMap04, normalMap05, roughnessMap] = useTexture([
      './textures/Metal_scratched_02.jpg',
      './textures/Metal_scratched_003.jpg',
      './textures/scratches_04.jpg',
      './textures/Surface_Imperfections_001.jpg',
      './textures/SurfaceImperfections003_1K_Normal.jpg',      
      './textures/SurfaceImperfections003_1K_var1.jpg',      
    ])

  normalMap05.wrapS = RepeatWrapping
  normalMap05.wrapT = RepeatWrapping
  roughnessMap.wrapT = RepeatWrapping
  roughnessMap.wrapT = RepeatWrapping
  
  useFrame((state, delta) => {
    delta = Math.min(0.1, delta)
    api.current?.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(0.2))
    easing.dampC(ref.current.material.color, color, 0.2, delta)
  })
  
  return (
    <RigidBody 
      linearDamping={4} 
      angularDamping={1} 
      friction={0.1} 
      position={pos} 
      ref={api} 
      colliders={false}>
      <CuboidCollider args={[1, 1, 1]} />
      <RoundedBox
      args={[2, 2, 2]}
      radius={0.03}
      ref={ref} 
      castShadow 
      receiveShadow>
        {/* <boxGeometry args={[2, 2, 2]} /> */}
        <meshStandardMaterial 
        {...props} 
        normalMap = {normalMap05}
        normalScale = {0.18}
        roughnessMap = {roughnessMap}
        />
        {children}
      </RoundedBox>
    </RigidBody>
  )
}

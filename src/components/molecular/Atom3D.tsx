import React, { useRef, useState } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { Atom } from '../../types/molecular';
import { useMolecularStore } from '../../store/molecularStore';

interface Atom3DProps {
  atom: Atom;
  moleculeId: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onDrag?: (position: [number, number, number]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const Atom3D: React.FC<Atom3DProps> = ({
  atom,
  moleculeId,
  isSelected = false,
  onSelect,
  onDrag,
}) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { showLabels, viewMode } = useMolecularStore();
  const { camera, gl } = useThree();

  // Animation for floating effect
  useFrame((state) => {
    if (meshRef.current && !isDragging) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const getScale = () => {
    switch (viewMode) {
      case 'spheres':
        return atom.radius * 2;
      case 'sticks':
        return 0.1;
      case 'ballAndStick':
        return atom.radius * 0.8;
      case 'spaceFill':
        return atom.radius * 3;
      default:
        return atom.radius;
    }
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    onSelect?.();
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = hovered ? 'pointer' : 'auto';
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isDragging && onDrag) {
      const newPosition: [number, number, number] = [
        event.point.x,
        event.point.y,
        event.point.z,
      ];
      onDrag(newPosition);
    }
  };

  return (
    <group position={atom.position}>
      <mesh
        ref={meshRef}
        scale={getScale()}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => {
          setHovered(true);
          gl.domElement.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          gl.domElement.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial
          color={atom.color}
          emissive={isSelected ? '#333333' : hovered ? '#111111' : '#000000'}
          shininess={100}
          transparent
          opacity={viewMode === 'sticks' ? 0.3 : 1}
        />
      </mesh>

      {/* Glow effect for selected atoms */}
      {isSelected && (
        <mesh scale={getScale() * 1.3}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={atom.color}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Atom labels */}
      {showLabels && (
        <Html
          position={[0, getScale() + 0.5, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="atom-label bg-card/80 px-2 py-1 rounded text-xs border">
            {atom.element}
            {atom.charge && (
              <span className="text-accent">
                {atom.charge > 0 ? `+${atom.charge}` : atom.charge}
              </span>
            )}
          </div>
        </Html>
      )}

      {/* Hover tooltip */}
      {hovered && !isDragging && (
        <Html
          position={[getScale() + 1, 0, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="bg-popover border rounded-lg p-3 shadow-lg max-w-xs">
            <div className="font-semibold text-popover-foreground">
              {atom.element}
            </div>
            <div className="text-sm text-muted-foreground">
              Position: ({atom.position[0].toFixed(2)}, {atom.position[1].toFixed(2)}, {atom.position[2].toFixed(2)})
            </div>
            <div className="text-sm text-muted-foreground">
              Radius: {atom.radius.toFixed(2)} Å
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
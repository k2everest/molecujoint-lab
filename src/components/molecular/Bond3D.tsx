import React, { useMemo } from 'react';
import { Bond, Atom } from '../../types/molecular';
import { useMolecularStore } from '../../store/molecularStore';
import * as THREE from 'three';

interface Bond3DProps {
  bond: Bond;
  atoms: Atom[];
}

export const Bond3D: React.FC<Bond3DProps> = ({ bond, atoms }) => {
  const { viewMode, showBonds } = useMolecularStore();

  const bondData = useMemo(() => {
    const atom1 = atoms.find(a => a.id === bond.atom1Id);
    const atom2 = atoms.find(a => a.id === bond.atom2Id);
    
    if (!atom1 || !atom2) return null;

    const start = new THREE.Vector3(...atom1.position);
    const end = new THREE.Vector3(...atom2.position);
    const direction = end.clone().sub(start);
    const distance = direction.length();
    const midpoint = start.clone().add(end).multiplyScalar(0.5);

    // Create rotation to align cylinder with bond direction
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );

    return {
      position: midpoint,
      quaternion,
      length: distance,
      start,
      end,
    };
  }, [bond, atoms]);

  if (!bondData || !showBonds || viewMode === 'spheres') return null;

  const getBondRadius = () => {
    switch (viewMode) {
      case 'sticks':
        return 0.15;
      case 'ballAndStick':
        return 0.08;
      default:
        return 0.1;
    }
  };

  const getBondColor = () => {
    switch (bond.bondType) {
      case 'double':
        return '#FFD700';
      case 'triple':
        return '#FF6B6B';
      default:
        return '#CCCCCC';
    }
  };

  const renderSingleBond = () => (
    <mesh
      position={bondData.position.toArray()}
      quaternion={bondData.quaternion.toArray()}
    >
      <cylinderGeometry args={[getBondRadius(), getBondRadius(), bondData.length, 8]} />
      <meshPhongMaterial
        color={getBondColor()}
        shininess={50}
      />
    </mesh>
  );

  const renderDoubleBond = () => {
    const offset = getBondRadius() * 2;
    const perpendicular = new THREE.Vector3(1, 0, 0);
    const direction = bondData.end.clone().sub(bondData.start).normalize();
    perpendicular.cross(direction).normalize().multiplyScalar(offset);

    return (
      <>
        <mesh
          position={bondData.position.clone().add(perpendicular).toArray()}
          quaternion={bondData.quaternion.toArray()}
        >
          <cylinderGeometry args={[getBondRadius() * 0.7, getBondRadius() * 0.7, bondData.length, 8]} />
          <meshPhongMaterial color={getBondColor()} shininess={50} />
        </mesh>
        <mesh
          position={bondData.position.clone().sub(perpendicular).toArray()}
          quaternion={bondData.quaternion.toArray()}
        >
          <cylinderGeometry args={[getBondRadius() * 0.7, getBondRadius() * 0.7, bondData.length, 8]} />
          <meshPhongMaterial color={getBondColor()} shininess={50} />
        </mesh>
      </>
    );
  };

  const renderTripleBond = () => {
    const offset = getBondRadius() * 2.5;
    const direction = bondData.end.clone().sub(bondData.start).normalize();
    const perpendicular1 = new THREE.Vector3(1, 0, 0).cross(direction).normalize().multiplyScalar(offset);
    const perpendicular2 = new THREE.Vector3(0, 0, 1).cross(direction).normalize().multiplyScalar(offset);

    return (
      <>
        {/* Center bond */}
        <mesh
          position={bondData.position.toArray()}
          quaternion={bondData.quaternion.toArray()}
        >
          <cylinderGeometry args={[getBondRadius() * 0.6, getBondRadius() * 0.6, bondData.length, 8]} />
          <meshPhongMaterial color={getBondColor()} shininess={50} />
        </mesh>
        {/* Side bonds */}
        <mesh
          position={bondData.position.clone().add(perpendicular1).toArray()}
          quaternion={bondData.quaternion.toArray()}
        >
          <cylinderGeometry args={[getBondRadius() * 0.6, getBondRadius() * 0.6, bondData.length, 8]} />
          <meshPhongMaterial color={getBondColor()} shininess={50} />
        </mesh>
        <mesh
          position={bondData.position.clone().add(perpendicular2).toArray()}
          quaternion={bondData.quaternion.toArray()}
        >
          <cylinderGeometry args={[getBondRadius() * 0.6, getBondRadius() * 0.6, bondData.length, 8]} />
          <meshPhongMaterial color={getBondColor()} shininess={50} />
        </mesh>
      </>
    );
  };

  return (
    <group>
      {bond.bondType === 'single' && renderSingleBond()}
      {bond.bondType === 'double' && renderDoubleBond()}
      {bond.bondType === 'triple' && renderTripleBond()}
    </group>
  );
};
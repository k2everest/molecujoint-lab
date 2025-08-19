import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import { Atom3D } from './Atom3D';
import { Bond3D } from './Bond3D';
import { useMolecularStore } from '../../store/molecularStore';
import { Atom } from '../../types/molecular';

export const MoleculeViewer3D: React.FC = () => {
  const {
    molecules,
    activeMoleculeId,
    showHydrogens,
    updateAtomPosition,
  } = useMolecularStore();

  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [draggedAtomId, setDraggedAtomId] = useState<string | null>(null);

  const activeMolecule = molecules.find(m => m.id === activeMoleculeId);

  const handleAtomDrag = useCallback((atomId: string, position: [number, number, number]) => {
    if (activeMoleculeId) {
      updateAtomPosition(activeMoleculeId, atomId, position);
    }
  }, [activeMoleculeId, updateAtomPosition]);

  const filteredAtoms = activeMolecule?.atoms.filter(atom => 
    showHydrogens || atom.element !== 'H'
  ) || [];

  if (!activeMolecule) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-muted-foreground mb-4">
            Nenhuma molécula carregada
          </div>
          <div className="text-muted-foreground">
            Carregue uma molécula ou crie uma nova para começar
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full molecule-container">
      <Canvas
        camera={{ 
          position: [10, 10, 10], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        className="bg-background"
      >
        <Suspense fallback={
          <Html center>
            <div className="animate-orbital-pulse text-primary">
              Carregando molécula...
            </div>
          </Html>
        }>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4A90E2" />
          <pointLight position={[10, -10, 10]} intensity={0.3} color="#50E3C2" />

          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Grid for reference */}
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#333333"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#666666"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />

          {/* Render atoms */}
          {filteredAtoms.map((atom) => (
            <Atom3D
              key={atom.id}
              atom={atom}
              moleculeId={activeMolecule.id}
              isSelected={selectedAtomId === atom.id}
              onSelect={() => setSelectedAtomId(atom.id)}
              onDrag={(position) => handleAtomDrag(atom.id, position)}
              onDragStart={() => setDraggedAtomId(atom.id)}
              onDragEnd={() => setDraggedAtomId(null)}
            />
          ))}

          {/* Render bonds */}
          {activeMolecule.bonds.map((bond) => (
            <Bond3D
              key={bond.id}
              bond={bond}
              atoms={filteredAtoms}
            />
          ))}

          {/* Controls */}
          <OrbitControls
            enabled={!draggedAtomId}
            enablePan={!draggedAtomId}
            enableZoom={!draggedAtomId}
            enableRotate={!draggedAtomId}
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={100}
          />
        </Suspense>
      </Canvas>

      {/* Molecule info overlay */}
      {activeMolecule && (
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur border rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold text-card-foreground mb-2">
            {activeMolecule.name}
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Átomos: {activeMolecule.atoms.length}</div>
            <div>Ligações: {activeMolecule.bonds.length}</div>
            {activeMolecule.formula && (
              <div>Fórmula: {activeMolecule.formula}</div>
            )}
            {activeMolecule.energy && (
              <div>Energia: {activeMolecule.energy.toFixed(2)} kcal/mol</div>
            )}
            {activeMolecule.dipoleMoment && (
              <div>Momento dipolar: {activeMolecule.dipoleMoment.toFixed(2)} D</div>
            )}
          </div>
        </div>
      )}

      {/* Selected atom info */}
      {selectedAtomId && (
        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur border rounded-lg p-4 shadow-lg">
          <div className="font-semibold text-accent-foreground mb-2">
            Átomo Selecionado
          </div>
          {(() => {
            const atom = filteredAtoms.find(a => a.id === selectedAtomId);
            if (!atom) return null;
            
            return (
              <div className="text-sm text-accent-foreground space-y-1">
                <div>Elemento: {atom.element}</div>
                <div>Posição: ({atom.position[0].toFixed(2)}, {atom.position[1].toFixed(2)}, {atom.position[2].toFixed(2)})</div>
                <div>Raio: {atom.radius.toFixed(2)} Å</div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
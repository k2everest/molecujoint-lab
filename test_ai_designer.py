
import random
import math

class DesignedMolecule:
    def __init__(self, id, name, smiles, formula, molecularWeight, logP, hbd, hba, tpsa, drugLikeness, synthesisScore, novelty, targetAffinity, admetScore, mechanism, advantages, concerns, structure):
        self.id = id
        self.name = name
        self.smiles = smiles
        self.formula = formula
        self.molecularWeight = molecularWeight
        self.logP = logP
        self.hbd = hbd
        self.hba = hba
        self.tpsa = tpsa
        self.drugLikeness = drugLikeness
        self.synthesisScore = synthesisScore
        self.novelty = novelty
        self.targetAffinity = targetAffinity
        self.admetScore = admetScore
        self.mechanism = mechanism
        self.advantages = advantages
        self.concerns = concerns
        self.structure = structure

class ImprovedAIMoleculeDesignerSimulator:
    def __init__(self):
        self.molecule_templates = [
            {
                'type': 'benzene_derivative',
                'baseStructure': 'C1=CC=CC=C1',
                'variations': ['substituted', 'fused_rings', 'heteroaromatic']
            },
            {
                'type': 'heterocycle',
                'baseStructure': 'C1=CN=CC=C1',
                'variations': ['pyridine', 'pyrimidine', 'quinoline', 'indole']
            },
            {
                'type': 'aliphatic_chain',
                'baseStructure': 'CCCCCC',
                'variations': ['branched', 'cyclic', 'unsaturated']
            },
            {
                'type': 'peptide_mimic',
                'baseStructure': 'NC(=O)C',
                'variations': ['beta_sheet', 'alpha_helix', 'turn_mimic']
            },
            {
                'type': 'natural_product',
                'baseStructure': 'C1CC2CCC1C2',
                'variations': ['steroid', 'terpene', 'alkaloid', 'flavonoid']
            }
        ]

    def calculate_drug_likeness(self, mw, logP, hbd, hba, tpsa):
        score = 1.0
        if mw > 500: score -= 0.2
        if logP > 5: score -= 0.2
        if hbd > 5: score -= 0.2
        if hba > 10: score -= 0.2
        if tpsa > 140: score -= 0.1
        return max(0, min(1, score))

    def generate_functional_groups(self, type, variation):
        groups = {
            'benzene_derivative': ['hydroxyl', 'methyl', 'amino', 'carboxyl'],
            'heterocycle': ['amino', 'carbonyl', 'hydroxyl', 'methoxy'],
            'aliphatic_chain': ['hydroxyl', 'amino', 'carboxyl', 'ester'],
            'peptide_mimic': ['amide', 'amino', 'carboxyl', 'hydroxyl'],
            'natural_product': ['hydroxyl', 'methyl', 'carbonyl', 'ether']
        }
        available_groups = groups.get(type, groups['benzene_derivative'])
        count = 1 + math.floor(random.random() * 3)
        return random.sample(available_groups, min(count, len(available_groups)))

    def generate_molecule_name(self, type, variation, index):
        prefixes = ['Neo', 'Iso', 'Meta', 'Para', 'Ortho', 'Cyclo', 'Tetra', 'Penta']
        suffixes = ['ine', 'ole', 'ane', 'ide', 'ate', 'yl', 'one', 'al']
        prefix = random.choice(prefixes)
        suffix = random.choice(suffixes)
        base = type.split('_')[0]
        return f"{prefix}{base}{suffix}-{index}"

    def generate_smiles(self, template, variation):
        variations = {
            'substituted': 'C1=CC(C)=CC(O)=C1',
            'fused_rings': 'C1=CC=C2C=CC=CC2=C1',
            'heteroaromatic': 'C1=CN=CC=C1',
            'pyridine': 'C1=CC=NC=C1',
            'pyrimidine': 'C1=CN=CN=C1',
            'quinoline': 'C1=CC=C2N=CC=CC2=C1',
            'indole': 'C1=CC=C2C(=C1)C=CN2',
            'branched': 'CC(C)CC(C)C',
            'cyclic': 'C1CCCCC1',
            'unsaturated': 'C=CC=CC=C',
            'beta_sheet': 'NC(=O)C(N)C(=O)N',
            'alpha_helix': 'NC(C)C(=O)NC(C)C(=O)N',
            'steroid': 'C1CC2CCC3C(CCC4CCCCC34)C2CC1',
            'terpene': 'CC(C)=CCCC(C)=C',
            'alkaloid': 'CN1CCC2=CC=CC=C2C1',
            'flavonoid': 'C1=CC(=CC=C1C2=CC(=O)C3=C(C=C(C=C3O2)O)O)O'
        }
        return variations.get(variation, template['baseStructure'])

    def generate_formula(self, mw):
        carbon_count = math.floor(mw / 20)
        hydrogen_count = math.floor(carbon_count * 1.5)
        oxygen_count = math.floor(random.random() * 4)
        nitrogen_count = math.floor(random.random() * 3)
        formula = f"C{carbon_count}H{hydrogen_count}"
        if nitrogen_count > 0: formula += f"N{nitrogen_count}"
        if oxygen_count > 0: formula += f"O{oxygen_count}"
        return formula

    def generate_mechanism(self, protein, mechanism):
        if mechanism: return mechanism
        mechanisms = [
            'Inibição competitiva do sítio ativo',
            'Modulação alostérica positiva',
            'Antagonismo de receptor',
            'Inibição enzimática reversível',
            'Bloqueio de canal iônico',
            'Ativação de receptor acoplado à proteína G',
            'Inibição da síntese proteica',
            'Modulação da expressão gênica'
        ]
        return random.choice(mechanisms)

    def generate_advantages(self, type, drug_likeness, novelty):
        advantages = []
        if drug_likeness > 0.8: advantages.append('Excelente drug-likeness')
        if novelty > 0.7: advantages.append('Estrutura altamente inovadora')
        if type == 'natural_product': advantages.append('Baseado em produto natural')
        if type == 'heterocycle': advantages.append('Boa solubilidade aquosa')
        if type == 'peptide_mimic': advantages.append('Alta seletividade')
        advantages.append('Potencial para otimização')
        advantages.append('Síntese viável')
        return random.sample(advantages, min(3, len(advantages)))

    def generate_concerns(self, logP, mw, tpsa):
        concerns = []
        if logP > 5: concerns.append('Alta lipofilicidade')
        if mw > 500: concerns.append('Peso molecular elevado')
        if tpsa > 140: concerns.append('TPSA alta - possível baixa permeabilidade')
        if logP < 0: concerns.append('Baixa lipofilicidade')
        if not concerns: concerns.append('Necessita validação experimental')
        return random.sample(concerns, min(2, len(concerns)))

    def generate_diverse_molecules(self, molecule_count=5):
        molecules = []
        for i in range(molecule_count):
            template = random.choice(self.molecule_templates)
            variation = random.choice(template['variations'])

            molecular_weight = 150 + random.random() * 400
            logP = -2 + random.random() * 8
            hbd = math.floor(random.random() * 6)
            hba = math.floor(random.random() * 10)
            tpsa = 20 + random.random() * 140

            drug_likeness = self.calculate_drug_likeness(molecular_weight, logP, hbd, hba, tpsa)
            synthesis_score = 0.3 + random.random() * 0.7
            novelty = 0.4 + random.random() * 0.6
            target_affinity = 0.5 + random.random() * 0.5
            admet_score = 0.4 + random.random() * 0.6

            rings = math.floor(1 + random.random() * 4)
            aromatic_rings = math.floor(random.random() * rings)
            heteroatoms = math.floor(random.random() * 8)
            functional_groups = self.generate_functional_groups(template['type'], variation)

            molecule = DesignedMolecule(
                id=f"ai_mol_{i + 1}_{random.randint(1000, 9999)}",
                name=self.generate_molecule_name(template['type'], variation, i + 1),
                smiles=self.generate_smiles(template, variation),
                formula=self.generate_formula(molecular_weight),
                molecularWeight=round(molecular_weight * 100) / 100,
                logP=round(logP * 100) / 100,
                hbd=hbd,
                hba=hba,
                tpsa=round(tpsa * 100) / 100,
                drugLikeness=drug_likeness,
                synthesisScore=synthesis_score,
                novelty=novelty,
                targetAffinity=target_affinity,
                admetScore=admet_score,
                mechanism=self.generate_mechanism(None, None),
                advantages=self.generate_advantages(template['type'], drug_likeness, novelty),
                concerns=self.generate_concerns(logP, molecular_weight, tpsa),
                structure={
                    'rings': rings,
                    'aromaticRings': aromatic_rings,
                    'heteroatoms': heteroatoms,
                    'functionalGroups': functional_groups
                }
            )
            molecules.append(molecule)
        return sorted(molecules, key=lambda x: x.drugLikeness, reverse=True)

if __name__ == '__main__':
    simulator = ImprovedAIMoleculeDesignerSimulator()
    generated_molecules = simulator.generate_diverse_molecules(molecule_count=5)

    print("\n--- Moléculas Geradas ---")
    for mol in generated_molecules:
        print(f"Nome: {mol.name}")
        print(f"SMILES: {mol.smiles}")
        print(f"Fórmula: {mol.formula}")
        print(f"MW: {mol.molecularWeight}, LogP: {mol.logP}, DrugLikeness: {mol.drugLikeness:.2f}")
        print(f"Mecanismo: {mol.mechanism}")
        print(f"Vantagens: {', '.join(mol.advantages)}")
        print(f"Preocupações: {', '.join(mol.concerns)}")
        print(f"Estrutura: Anéis={mol.structure['rings']}, Aromáticos={mol.structure['aromaticRings']}, Heteroátomos={mol.structure['heteroatoms']}, Grupos Funcionais={', '.join(mol.structure['functionalGroups'])}")
        print("------------------------")

    # Verificar diversidade
    smiles_set = set(mol.smiles for mol in generated_molecules)
    print(f"\nNúmero de SMILES únicos: {len(smiles_set)}")
    if len(smiles_set) == len(generated_molecules):
        print("✅ As moléculas geradas possuem SMILES únicos, indicando diversidade estrutural.")
    else:
        print("❌ Algumas moléculas geradas possuem SMILES duplicados.")

    names_set = set(mol.name for mol in generated_molecules)
    print(f"Número de Nomes únicos: {len(names_set)}")
    if len(names_set) == len(generated_molecules):
        print("✅ As moléculas geradas possuem nomes únicos.")
    else:
        print("❌ Algumas moléculas geradas possuem nomes duplicados.")

    print("\nTeste de geração de moléculas concluído.")



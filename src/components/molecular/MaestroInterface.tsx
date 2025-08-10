import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  Atom, 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  Target, 
  Beaker, 
  BarChart3,
  Settings,
  Play,
  Pause,
  Download,
  Upload,
  FileText,
  Brain,
  Microscope,
  FlaskConical
} from 'lucide-react';
import { toast } from 'sonner';

interface MaterialProperty {
  name: string;
  value: number;
  unit: string;
  accuracy: number;
}

interface Workflow {
  id: string;
  name: string;
  type: 'dft' | 'md' | 'ml' | 'qmc' | 'analysis';
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedTime: string;
}

export const MaestroInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('modeling');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'DFT Optimization',
      type: 'dft',
      status: 'running',
      progress: 67,
      estimatedTime: '45 min'
    },
    {
      id: '2',
      name: 'Molecular Dynamics',
      type: 'md',
      status: 'completed',
      progress: 100,
      estimatedTime: '0 min'
    },
    {
      id: '3',
      name: 'ML Property Prediction',
      type: 'ml',
      status: 'idle',
      progress: 0,
      estimatedTime: '15 min'
    }
  ]);

  const [properties] = useState<MaterialProperty[]>([
    { name: 'Band Gap', value: 2.34, unit: 'eV', accuracy: 0.95 },
    { name: 'Bulk Modulus', value: 185.7, unit: 'GPa', accuracy: 0.88 },
    { name: 'Formation Energy', value: -3.21, unit: 'eV/atom', accuracy: 0.92 },
    { name: 'Thermal Conductivity', value: 12.8, unit: 'W/mK', accuracy: 0.76 }
  ]);

  const handleRunWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'running', progress: 0 }
        : w
    ));
    
    toast.success('Workflow iniciado!', {
      description: `Executando ${workflows.find(w => w.id === workflowId)?.name}`
    });

    // Simulate progress
    const interval = setInterval(() => {
      setWorkflows(prev => prev.map(w => {
        if (w.id === workflowId && w.status === 'running') {
          const newProgress = Math.min(w.progress + Math.random() * 10, 100);
          return {
            ...w,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'running'
          };
        }
        return w;
      }));
    }, 1000);

    setTimeout(() => clearInterval(interval), 10000);
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'dft': return <Atom className="w-4 h-4" />;
      case 'md': return <Layers className="w-4 h-4" />;
      case 'ml': return <Brain className="w-4 h-4" />;
      case 'qmc': return <Zap className="w-4 h-4" />;
      case 'analysis': return <BarChart3 className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-[400px] bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="w-5 h-5 text-primary" />
          MS Maestro - Materials Discovery
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8 text-xs">
            <TabsTrigger value="modeling" className="text-xs">Modeling</TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs">Workflows</TabsTrigger>
            <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="modeling" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Material System</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select material..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silicon">Silicon (Si)</SelectItem>
                  <SelectItem value="graphene">Graphene</SelectItem>
                  <SelectItem value="perovskite">Perovskite (CaTiO₃)</SelectItem>
                  <SelectItem value="mof">MOF-5</SelectItem>
                  <SelectItem value="polymer">PEDOT:PSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Theory Level</Label>
                <Select defaultValue="dft-pbe">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dft-pbe">DFT-PBE</SelectItem>
                    <SelectItem value="dft-hse">DFT-HSE06</SelectItem>
                    <SelectItem value="gw">G₀W₀</SelectItem>
                    <SelectItem value="ccsd">CCSD(T)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Basis Set</Label>
                <Select defaultValue="plane-wave">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plane-wave">Plane Wave</SelectItem>
                    <SelectItem value="6-31g">6-31G*</SelectItem>
                    <SelectItem value="def2-tzvp">def2-TZVP</SelectItem>
                    <SelectItem value="cc-pvtz">cc-pVTZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Calculation Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Optimization
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Single Point
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Layers className="w-3 h-3 mr-1" />
                  Band Structure
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Phonons
                </Button>
              </div>
            </div>

            <Button className="w-full h-8 text-sm">
              <Play className="w-4 h-4 mr-2" />
              Start Calculation
            </Button>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Active Workflows</Label>
              <Button variant="outline" size="sm" className="h-6 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Configure
              </Button>
            </div>

            <div className="space-y-2">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border border-border/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getWorkflowIcon(workflow.type)}
                      <span className="font-medium text-sm">{workflow.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)}`} />
                      <Badge variant="secondary" className="text-xs h-5">
                        {workflow.status}
                      </Badge>
                    </div>
                  </div>

                  {workflow.status === 'running' && (
                    <div className="space-y-1">
                      <Progress value={workflow.progress} className="w-full h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{workflow.progress.toFixed(0)}%</span>
                        <span>ETA: {workflow.estimatedTime}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-xs flex-1"
                      onClick={() => handleRunWorkflow(workflow.id)}
                      disabled={workflow.status === 'running'}
                    >
                      {workflow.status === 'running' ? (
                        <Pause className="w-3 h-3 mr-1" />
                      ) : (
                        <Play className="w-3 h-3 mr-1" />
                      )}
                      {workflow.status === 'running' ? 'Pause' : 'Run'}
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 text-xs flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Results
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full h-8 text-sm">
              <Database className="w-4 h-4 mr-2" />
              Create Custom Workflow
            </Button>
          </TabsContent>

          <TabsContent value="properties" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Calculated Properties</Label>
              
              <div className="space-y-2">
                {properties.map((prop, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <span className="font-medium">{prop.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {prop.value.toFixed(2)} {prop.unit}
                      </span>
                      <Badge 
                        variant={prop.accuracy > 0.9 ? "default" : "secondary"} 
                        className="text-xs h-4"
                      >
                        {(prop.accuracy * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">Experimental Validation</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="font-semibold">MAE</div>
                  <div className="text-muted-foreground">0.12 eV</div>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="font-semibold">R²</div>
                  <div className="text-muted-foreground">0.94</div>
                </div>
              </div>
            </div>

            <Button className="w-full h-8 text-sm">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Analysis Tools</Label>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Microscope className="w-3 h-3 mr-1" />
                  DOS/PDOS
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Charge Analysis
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Layers className="w-3 h-3 mr-1" />
                  Surface Analysis
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Vibrational
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">Machine Learning</Label>
              <div className="space-y-2">
                <Button variant="outline" className="w-full h-8 text-sm justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  Property Prediction Model
                </Button>
                <Button variant="outline" className="w-full h-8 text-sm justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Materials Discovery
                </Button>
                <Button variant="outline" className="w-full h-8 text-sm justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  High-Throughput Screening
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">Data Management</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
                  <Upload className="w-3 h-3 mr-1" />
                  Import
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs flex-1">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
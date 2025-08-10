import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Brain, Target, Zap, Database, ChartLine, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'generative';
  accuracy: number;
  trainingData: number;
  status: 'training' | 'ready' | 'optimizing';
}

interface ActiveLearningConfig {
  targetProperty: string;
  modelType: string;
  samplingStrategy: string;
  batchSize: number;
  acquisitionFunction: string;
  uncertaintyThreshold: number;
}

export const ActiveLearningPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState<ActiveLearningConfig>({
    targetProperty: 'binding_affinity',
    modelType: 'random_forest',
    samplingStrategy: 'uncertainty',
    batchSize: 100,
    acquisitionFunction: 'expected_improvement',
    uncertaintyThreshold: 0.8
  });

  const [models] = useState<MLModel[]>([
    {
      id: '1',
      name: 'Binding Affinity Predictor',
      type: 'regression',
      accuracy: 0.87,
      trainingData: 2500,
      status: 'ready'
    },
    {
      id: '2',
      name: 'ADMET Classifier',
      type: 'classification',
      accuracy: 0.92,
      trainingData: 1800,
      status: 'training'
    },
    {
      id: '3',
      name: 'Lead Optimization Model',
      type: 'generative',
      accuracy: 0.73,
      trainingData: 950,
      status: 'optimizing'
    }
  ]);

  const [trainingProgress, setTrainingProgress] = useState(67);
  const [predictions] = useState([
    { compound: 'ZINC000001', score: 8.3, confidence: 0.95 },
    { compound: 'ZINC000002', score: 7.8, confidence: 0.89 },
    { compound: 'ZINC000003', score: 9.1, confidence: 0.92 },
    { compound: 'ZINC000004', score: 6.4, confidence: 0.78 }
  ]);

  const handleStartTraining = () => {
    toast.success('Iniciando treinamento do modelo de active learning...');
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success('Modelo treinado com sucesso!');
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 500);
  };

  const handleGeneratePredictions = () => {
    toast.success('Gerando predições para biblioteca molecular...');
  };

  const handleOptimizeModel = () => {
    toast.success('Otimizando hiperparâmetros do modelo...');
  };

  return (
    <Card className="w-96 bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-primary" />
          Active Learning Platform
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8 text-xs">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="models" className="text-xs">Models</TabsTrigger>
            <TabsTrigger value="training" className="text-xs">Training</TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted/50 p-2 rounded">
                <div className="text-muted-foreground text-xs">Active Models</div>
                <div className="font-semibold text-lg">{models.filter(m => m.status === 'ready').length}</div>
              </div>
              <div className="bg-muted/50 p-2 rounded">
                <div className="text-muted-foreground text-xs">Training Data</div>
                <div className="font-semibold text-lg">{models.reduce((sum, m) => sum + m.trainingData, 0)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Target Property</Label>
              <Select value={config.targetProperty} onValueChange={(value) => setConfig({...config, targetProperty: value})}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binding_affinity">Binding Affinity</SelectItem>
                  <SelectItem value="admet">ADMET Properties</SelectItem>
                  <SelectItem value="toxicity">Toxicity</SelectItem>
                  <SelectItem value="selectivity">Selectivity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Model Type</Label>
              <Select value={config.modelType} onValueChange={(value) => setConfig({...config, modelType: value})}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random_forest">Random Forest</SelectItem>
                  <SelectItem value="neural_network">Neural Network</SelectItem>
                  <SelectItem value="gradient_boosting">Gradient Boosting</SelectItem>
                  <SelectItem value="ensemble">Ensemble</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleStartTraining} className="w-full h-8 text-sm">
              <Target className="w-4 h-4 mr-2" />
              Start Active Learning
            </Button>
          </TabsContent>

          <TabsContent value="models" className="space-y-3">
            <div className="space-y-2">
              {models.map((model) => (
                <div key={model.id} className="border border-border/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{model.name}</div>
                    <Badge variant={model.status === 'ready' ? 'default' : 'secondary'} className="text-xs">
                      {model.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Accuracy: {(model.accuracy * 100).toFixed(1)}%</span>
                    <span>Data: {model.trainingData}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-6 text-xs flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 text-xs flex-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleOptimizeModel} className="w-full h-8 text-sm">
              <ChartLine className="w-4 h-4 mr-2" />
              Optimize Models
            </Button>
          </TabsContent>

          <TabsContent value="training" className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>Training Progress</Label>
                <span className="text-muted-foreground">{Math.round(trainingProgress)}%</span>
              </div>
              <Progress value={trainingProgress} className="w-full" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Batch Size</Label>
                <Input
                  type="number"
                  value={config.batchSize}
                  onChange={(e) => setConfig({...config, batchSize: parseInt(e.target.value)})}
                  className="h-7 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Uncertainty Threshold</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={config.uncertaintyThreshold}
                  onChange={(e) => setConfig({...config, uncertaintyThreshold: parseFloat(e.target.value)})}
                  className="h-7 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Sampling Strategy</Label>
              <Select value={config.samplingStrategy} onValueChange={(value) => setConfig({...config, samplingStrategy: value})}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncertainty">Uncertainty Sampling</SelectItem>
                  <SelectItem value="diversity">Diversity Sampling</SelectItem>
                  <SelectItem value="expected_improvement">Expected Improvement</SelectItem>
                  <SelectItem value="thompson">Thompson Sampling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Acquisition Function</Label>
              <Select value={config.acquisitionFunction} onValueChange={(value) => setConfig({...config, acquisitionFunction: value})}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expected_improvement">Expected Improvement</SelectItem>
                  <SelectItem value="probability_improvement">Probability of Improvement</SelectItem>
                  <SelectItem value="upper_confidence">Upper Confidence Bound</SelectItem>
                  <SelectItem value="entropy">Predictive Entropy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Top Predictions</Label>
                <Button onClick={handleGeneratePredictions} variant="outline" size="sm" className="h-6 text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  Generate
                </Button>
              </div>
              
              <div className="space-y-1">
                {predictions.map((pred, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <span className="font-mono">{pred.compound}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pred.score}</span>
                      <Badge variant="outline" className="text-xs">
                        {(pred.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">Virtual Library Stats</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="font-semibold">2.1M</div>
                  <div className="text-muted-foreground">Compounds</div>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <div className="font-semibold">15K</div>
                  <div className="text-muted-foreground">Predicted</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Contractor {
  id: string;
  name: string;
  role: string;
  rate: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface ProjectAssignment {
  contractorId: string;
  hours: number;
}

interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  status: 'active' | 'completed' | 'paused';
  assignments: ProjectAssignment[];
  expenses: Expense[];
  createdAt: string;
}

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Интернет-магазин электроники',
      client: 'ООО "ТехноМир"',
      budget: 500000,
      status: 'active',
      assignments: [
        { contractorId: '1', hours: 80 },
        { contractorId: '2', hours: 40 },
      ],
      expenses: [
        { id: 'e1', description: 'Хостинг на год', amount: 12000, category: 'Инфраструктура', date: '2024-01-15' },
        { id: 'e2', description: 'Лицензия на плагины', amount: 8000, category: 'ПО', date: '2024-01-20' },
      ],
      createdAt: '2024-01-10',
    },
    {
      id: '2',
      name: 'Корпоративный сайт юридической компании',
      client: 'АО "ПравоКонсалт"',
      budget: 300000,
      status: 'active',
      assignments: [
        { contractorId: '1', hours: 60 },
        { contractorId: '3', hours: 30 },
      ],
      expenses: [
        { id: 'e3', description: 'Покупка премиум-темы', amount: 15000, category: 'Дизайн', date: '2024-02-01' },
      ],
      createdAt: '2024-02-01',
    },
  ]);

  const [contractors, setContractors] = useState<Contractor[]>([
    { id: '1', name: 'Алексей Петров', role: 'Frontend Developer', rate: 2500 },
    { id: '2', name: 'Мария Сидорова', role: 'UI/UX Designer', rate: 2000 },
    { id: '3', name: 'Дмитрий Иванов', role: 'Backend Developer', rate: 3000 },
  ]);

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const getContractorById = (id: string) => contractors.find(c => c.id === id);

  const calculateProjectCosts = (project: Project) => {
    const contractorsCost = project.assignments.reduce((sum, assignment) => {
      const contractor = getContractorById(assignment.contractorId);
      return sum + (contractor ? contractor.rate * assignment.hours : 0);
    }, 0);

    const expensesCost = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const totalCost = contractorsCost + expensesCost;
    const profit = project.budget - totalCost;
    const profitMargin = project.budget > 0 ? ((profit / project.budget) * 100).toFixed(1) : '0';

    return { contractorsCost, expensesCost, totalCost, profit, profitMargin };
  };

  const getTotalStats = () => {
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalCosts = projects.reduce((sum, p) => sum + calculateProjectCosts(p).totalCost, 0);
    const totalProfit = totalBudget - totalCosts;
    
    const contractorEarnings = contractors.map(contractor => {
      const earnings = projects.reduce((sum, project) => {
        const assignment = project.assignments.find(a => a.contractorId === contractor.id);
        return sum + (assignment ? contractor.rate * assignment.hours : 0);
      }, 0);
      return { ...contractor, earnings };
    }).sort((a, b) => b.earnings - a.earnings);

    return { totalBudget, totalCosts, totalProfit, contractorEarnings };
  };

  const stats = getTotalStats();

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'completed':
        return 'Завершен';
      case 'paused':
        return 'На паузе';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Система учета проектов</h1>
            <p className="text-muted-foreground">Управление разработкой, исполнителями и финансами</p>
          </div>
          <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Icon name="Plus" size={20} />
                Новый проект
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Добавить новый проект</DialogTitle>
                <DialogDescription>Заполните информацию о новом проекте</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Название проекта</Label>
                  <Input id="project-name" placeholder="Интернет-магазин одежды" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Заказчик</Label>
                  <Input id="client" placeholder="ООО 'Компания'" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Бюджет (₽)</Label>
                  <Input id="budget" type="number" placeholder="500000" />
                </div>
                <Button className="w-full" onClick={() => {
                  toast.success('Проект добавлен');
                  setIsAddProjectOpen(false);
                }}>
                  Создать проект
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего проектов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="FolderOpen" size={20} className="text-primary" />
                <span className="text-3xl font-bold font-mono">{projects.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Общий бюджет</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="Wallet" size={20} className="text-blue-500" />
                <span className="text-3xl font-bold font-mono">{(stats.totalBudget / 1000).toFixed(0)}k ₽</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Расходы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="TrendingDown" size={20} className="text-red-500" />
                <span className="text-3xl font-bold font-mono">{(stats.totalCosts / 1000).toFixed(0)}k ₽</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Чистая прибыль</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} className="text-green-500" />
                <span className="text-3xl font-bold font-mono text-green-500">{(stats.totalProfit / 1000).toFixed(0)}k ₽</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="projects">Проекты</TabsTrigger>
            <TabsTrigger value="contractors">Исполнители</TabsTrigger>
            <TabsTrigger value="finances">Финансы</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4 mt-6">
            {projects.map((project, idx) => {
              return (
                <Card key={project.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{project.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Icon name="Building" size={14} />
                          {project.client}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Icon name="Edit" size={14} />
                        Редактировать
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="contractors" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Dialog open={isAddContractorOpen} onOpenChange={setIsAddContractorOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="UserPlus" size={20} />
                    Добавить исполнителя
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новый исполнитель</DialogTitle>
                    <DialogDescription>Добавьте нового исполнителя в систему</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractor-name">ФИО</Label>
                      <Input id="contractor-name" placeholder="Иван Иванов" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Должность</Label>
                      <Input id="role" placeholder="Frontend Developer" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">Ставка за час (₽)</Label>
                      <Input id="rate" type="number" placeholder="2500" />
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Исполнитель добавлен');
                      setIsAddContractorOpen(false);
                    }}>
                      Добавить исполнителя
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractors.map((contractor, idx) => {
                const totalEarned = projects.reduce((sum, project) => {
                  const assignment = project.assignments.find(a => a.contractorId === contractor.id);
                  return sum + (assignment ? contractor.rate * assignment.hours : 0);
                }, 0);
                const totalHours = projects.reduce((sum, project) => {
                  const assignment = project.assignments.find(a => a.contractorId === contractor.id);
                  return sum + (assignment ? assignment.hours : 0);
                }, 0);
                const projectCount = projects.filter(p => p.assignments.some(a => a.contractorId === contractor.id)).length;

                return (
                  <Card key={contractor.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="User" size={24} className="text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{contractor.name}</CardTitle>
                          <CardDescription>{contractor.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Ставка</span>
                          <span className="font-bold font-mono">{contractor.rate} ₽/ч</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Проектов</span>
                          <span className="font-bold font-mono">{projectCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Часов</span>
                          <span className="font-bold font-mono">{totalHours}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Заработано</span>
                          <span className="text-xl font-bold font-mono text-green-500">{totalEarned.toLocaleString()} ₽</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="finances" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Финансы</h2>
              <div className="flex gap-2">
                <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Icon name="TrendingUp" size={16} />
                      Добавить доход
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый доход</DialogTitle>
                      <DialogDescription>Добавьте поступление средств</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="income-desc">Описание</Label>
                        <Input id="income-desc" placeholder="Оплата от клиента" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="income-amount">Сумма (₽)</Label>
                        <Input id="income-amount" type="number" placeholder="100000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="income-date">Дата</Label>
                        <Input id="income-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="income-project">Проект</Label>
                        <Input id="income-project" placeholder="Название проекта" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        toast.success('Доход добавлен');
                        setIsAddIncomeOpen(false);
                      }}>
                        Добавить доход
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Icon name="TrendingDown" size={16} />
                      Добавить расход
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый расход</DialogTitle>
                      <DialogDescription>Добавьте затраты</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="expense-desc">Описание</Label>
                        <Input id="expense-desc" placeholder="Хостинг на год" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expense-amount">Сумма (₽)</Label>
                        <Input id="expense-amount" type="number" placeholder="15000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expense-category">Категория</Label>
                        <Input id="expense-category" placeholder="Инфраструктура, ПО, Дизайн..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expense-date">Дата</Label>
                        <Input id="expense-date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expense-project">Проект (опционально)</Label>
                        <Input id="expense-project" placeholder="Название проекта" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        toast.success('Расход добавлен');
                        setIsAddExpenseOpen(false);
                      }}>
                        Добавить расход
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Общий доход</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon name="ArrowUpCircle" size={20} className="text-green-500" />
                    <span className="text-3xl font-bold font-mono text-green-500">{(stats.totalBudget / 1000).toFixed(0)}k ₽</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Общий расход</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon name="ArrowDownCircle" size={20} className="text-red-500" />
                    <span className="text-3xl font-bold font-mono text-red-500">{(stats.totalCosts / 1000).toFixed(0)}k ₽</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Баланс</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon name="Wallet" size={20} className="text-blue-500" />
                    <span className="text-3xl font-bold font-mono text-blue-500">{(stats.totalProfit / 1000).toFixed(0)}k ₽</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} className="text-green-500" />
                    Доходы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.map(project => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                        </div>
                        <p className="font-bold font-mono text-green-500">+{project.budget.toLocaleString()} ₽</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingDown" size={20} className="text-red-500" />
                    Расходы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.flatMap(project => 
                      project.expenses.map(expense => ({
                        ...expense,
                        projectName: project.name
                      }))
                    ).map(expense => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                            <span className="text-xs text-muted-foreground">{expense.projectName}</span>
                          </div>
                        </div>
                        <p className="font-bold font-mono text-red-500">-{expense.amount.toLocaleString()} ₽</p>
                      </div>
                    ))}
                    {contractors.map(contractor => {
                      const totalEarned = projects.reduce((sum, project) => {
                        const assignment = project.assignments.find(a => a.contractorId === contractor.id);
                        return sum + (assignment ? contractor.rate * assignment.hours : 0);
                      }, 0);
                      if (totalEarned === 0) return null;
                      return (
                        <div key={contractor.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{contractor.name}</p>
                            <p className="text-sm text-muted-foreground">{contractor.role}</p>
                          </div>
                          <p className="font-bold font-mono text-red-500">-{totalEarned.toLocaleString()} ₽</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Топ исполнителей по доходу</CardTitle>
                <CardDescription>Рейтинг исполнителей по общему заработку за все проекты</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.contractorEarnings.map((contractor, idx) => {
                    const percentage = stats.totalCosts > 0 ? (contractor.earnings / stats.totalCosts * 100) : 0;
                    return (
                      <div key={contractor.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium">{contractor.name}</p>
                              <p className="text-sm text-muted-foreground">{contractor.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold font-mono text-lg">{contractor.earnings.toLocaleString()} ₽</p>
                            <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% от расходов</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle>Распределение бюджета</CardTitle>
                  <CardDescription>По всем проектам</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Исполнители</span>
                      <span className="font-bold font-mono">{((stats.totalCosts > 0 ? (projects.reduce((sum, p) => sum + calculateProjectCosts(p).contractorsCost, 0) / stats.totalBudget * 100) : 0)).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${stats.totalBudget > 0 ? (projects.reduce((sum, p) => sum + calculateProjectCosts(p).contractorsCost, 0) / stats.totalBudget * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Прочие расходы</span>
                      <span className="font-bold font-mono">{((stats.totalBudget > 0 ? (projects.reduce((sum, p) => sum + calculateProjectCosts(p).expensesCost, 0) / stats.totalBudget * 100) : 0)).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ width: `${stats.totalBudget > 0 ? (projects.reduce((sum, p) => sum + calculateProjectCosts(p).expensesCost, 0) / stats.totalBudget * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Прибыль</span>
                      <span className="font-bold font-mono text-green-500">{((stats.totalBudget > 0 ? (stats.totalProfit / stats.totalBudget * 100) : 0)).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${stats.totalBudget > 0 ? (stats.totalProfit / stats.totalBudget * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle>Статистика проектов</CardTitle>
                  <CardDescription>Текущее состояние</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">Активные</span>
                    </div>
                    <span className="font-bold font-mono text-2xl">{projects.filter(p => p.status === 'active').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Завершенные</span>
                    </div>
                    <span className="font-bold font-mono text-2xl">{projects.filter(p => p.status === 'completed').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">На паузе</span>
                    </div>
                    <span className="font-bold font-mono text-2xl">{projects.filter(p => p.status === 'paused').length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
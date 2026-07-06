import { api } from '../services/api';
import { taskService } from '../services/taskService';
import { useAsyncData } from './useAsyncData';

export function useProfileData() {
  const { data, loading, error, refetch } = useAsyncData(async () => {
    const [me, summary, gamification, healthScore, goals, budgets, bills, incomes, expenses, tasks] = await Promise.all([
      api.get('/auth/me'),
      api.get('/expenses/summary'),
      api.get('/gamification/stats'),
      api.get('/ai/health-score').catch(() => null),
      api.get('/goals'),
      api.get('/budgets'),
      api.get('/bills'),
      api.get('/income'),
      api.get('/expenses'),
      taskService.getToday().catch(() => []),
    ]);
    return { me, summary, gamification, healthScore, goals, budgets, bills, incomes, expenses, tasks };
  }, []);

  const goals = data?.goals || [];
  const bills = data?.bills || [];
  const tasks = data?.tasks || [];
  const budgets = data?.budgets || [];
  const incomes = data?.incomes || [];
  const expenses = data?.expenses || [];

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  return {
    user: data?.me || null,
    summary: data?.summary || null,
    gamification: data?.gamification || null,
    healthScore: data?.healthScore || null,
    goals,
    budgets,
    bills,
    tasks,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    activeGoals: goals.filter(g => g.status === 'In Progress'),
    unpaidBills: bills.filter(b => b.status !== 'Paid'),
    completedTasks: tasks.filter(t => t.status === 'completed'),
    pendingTasks: tasks.filter(t => t.status === 'pending'),
    savings: (data?.summary?.monthlyIncome || 0) - (data?.summary?.monthlyExpense || 0),
    loading,
    error,
    refetch,
  };
}

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Target,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  serverTimestamp,
  orderBy,
  arrayUnion,
  setDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import GlassCard from '../components/GlassCard';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to User Data
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    // Listen to Tasks
    const tasksQuery = query(
      collection(db, 'tasks'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return () => {
      unsubUser();
      unsubTasks();
    };
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !auth.currentUser) return;
    
    try {
      const taskData = {
        userId: auth.currentUser.uid,
        text: newTask,
        done: false,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'tasks'), taskData);
      
      // Log activity in user doc
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        activityLog: arrayUnion({
          type: 'target',
          description: `Added task: ${newTask}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date().toISOString()
        })
      });

      setNewTask('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTask = async (taskId: string, currentDone: boolean, taskText: string) => {
    if (!auth.currentUser) return;
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { done: !currentDone });

      if (!currentDone) {
        // Update productivity score for today (Mon-Sun)
        const dayIndex = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const currentProd = userSnap.data().productivity || [0, 0, 0, 0, 0, 0, 0];
          const newProd = [...currentProd];
          newProd[dayIndex] += 10;
          
          await updateDoc(userDocRef, {
            productivity: newProd,
            activityLog: arrayUnion({
              type: 'success',
              description: `Completed task: ${taskText}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date().toISOString()
            })
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const chartData = [
    { name: 'Mon', score: userData?.productivity?.[0] || 0 },
    { name: 'Tue', score: userData?.productivity?.[1] || 0 },
    { name: 'Wed', score: userData?.productivity?.[2] || 0 },
    { name: 'Thu', score: userData?.productivity?.[3] || 0 },
    { name: 'Fri', score: userData?.productivity?.[4] || 0 },
    { name: 'Sat', score: userData?.productivity?.[5] || 0 },
    { name: 'Sun', score: userData?.productivity?.[6] || 0 },
  ];

  const completedCount = tasks.filter(t => t.done).length;
  const pieData = [
    { name: 'Completed', value: completedCount },
    { name: 'Remaining', value: Math.max(0, tasks.length - completedCount) || 1 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userData?.name}!</h1>
          <p className="text-white/60">Here's your neural trajectory for today.</p>
        </div>
        <div className="flex gap-4">
          <GlassCard className="px-6 py-3 flex items-center gap-3" hover={false}>
            <TrendingUp className="text-cosmic-cyan" size={20} />
            <div>
              <p className="text-xs text-white/40 uppercase font-bold">Focus Score</p>
              <p className="text-xl font-bold">{userData?.productivity?.reduce((a: number, b: number) => a + b, 0) || 0}</p>
            </div>
          </GlassCard>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <GlassCard className="lg:col-span-2 h-[400px] flex flex-col">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-cosmic-indigo" />
            Neural Trajectory
          </h2>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#15152F', 
                    border: '1px solid #ffffff20',
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#5C38FF" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#5C38FF' }}
                  activeDot={{ r: 8, fill: '#00F0FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="h-[400px] flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-6 self-start flex items-center gap-2">
            <Target size={20} className="text-cosmic-neon" />
            Mastery Matrix
          </h2>
          <div className="relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#5C38FF" />
                  <Cell fill="#ffffff10" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold">{Math.round((completedCount / (tasks.length || 1)) * 100)}%</p>
              <p className="text-xs text-white/40 uppercase font-bold">Mastery</p>
            </div>
          </div>
        </GlassCard>

        {/* Tasks Section */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 size={20} className="text-cosmic-cyan" />
              Target Objectives
            </h2>
            <form onSubmit={addTask} className="flex gap-2">
              <input
                type="text"
                placeholder="New objective..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-cosmic-cyan transition-colors text-sm"
              />
              <button type="submit" className="p-2 bg-cosmic-indigo rounded-xl hover:bg-cosmic-indigo/80 transition-colors">
                <Plus size={20} />
              </button>
            </form>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  task.done ? "bg-white/5 border-white/5 opacity-60" : "bg-white/10 border-white/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTask(task.id, task.done, task.text)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      task.done ? "bg-cosmic-cyan border-cosmic-cyan" : "border-white/20 hover:border-cosmic-cyan"
                    )}
                  >
                    {task.done && <CheckCircle2 size={14} className="text-cosmic-900" />}
                  </button>
                  <span className={cn("font-medium", task.done && "line-through")}>{task.text}</span>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-white/40 py-8">No objectives set for today.</p>
            )}
          </div>
        </GlassCard>

        {/* Activity Log */}
        <GlassCard>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock size={20} className="text-cosmic-indigo" />
            Neural Log
          </h2>
          <div className="space-y-6">
            {userData?.activityLog?.slice().reverse().map((log: any, i: number) => (
              <div key={i} className="flex gap-4 relative">
                {i !== userData.activityLog.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-white/5" />
                )}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center z-10",
                  log.type === 'success' ? "bg-cosmic-cyan/20 text-cosmic-cyan" : "bg-cosmic-indigo/20 text-cosmic-indigo"
                )}>
                  {log.type === 'success' ? <CheckCircle2 size={14} /> : <Target size={14} />}
                </div>
                <div>
                  <p className="text-sm font-medium">{log.description}</p>
                  <p className="text-xs text-white/40">{log.time}</p>
                </div>
              </div>
            ))}
            {(!userData?.activityLog || userData.activityLog.length === 0) && (
              <p className="text-center text-white/40 py-8">No recent activity.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

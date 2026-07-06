import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskSummary from '../components/tasks/TaskSummary';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';

export default function Tasks() {
  const [showForm, setShowForm] = useState(false);
  const { tasks, loading, error, handleCreate: createTask, handleToggle, handleDelete } = useTasks();

  const handleCreate = async (data) => {
    await createTask(data);
    setShowForm(false);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 2 }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 10,
            color: 'var(--text-tertiary)', letterSpacing: '0.15em', fontWeight: 700,
          }}>
            TODAY'S MISSIONS
          </span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0099cc, #00eaff)',
            border: 'none', color: '#050816', cursor: 'pointer',
            fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
            boxShadow: '0 0 15px rgba(0, 234, 255, 0.15)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 234, 255, 0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 234, 255, 0.15)'; }}
        >
          + NEW MISSION
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{
          padding: 12, borderColor: 'rgba(239,68,68,0.2)',
          color: 'var(--danger)', fontSize: 12, fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      <TaskSummary tasks={tasks} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner-large" />
        </div>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <div>
              <div className="system-header" style={{ marginBottom: 10, color: 'var(--gold)' }}>
                PENDING — {pendingTasks.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    className="electric-surface-soft electric-hover-node"
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <div className="system-header" style={{ marginBottom: 10, color: 'var(--success)' }}>
                COMPLETED — {completedTasks.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {completedTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    className="electric-surface-soft electric-hover-node"
                  />
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="glass-panel electric-surface-soft electric-hover-node" style={{
              padding: 40, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8, fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>✦</div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                No missions for today
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Click "New Mission" to add your first task
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useHabits } from '../hooks/data';

function GripIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M4 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM4 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM5.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" clipRule="evenodd" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

export default function ManageHabits({ isOpen, onClose }) {
  const { habits, isLoading, addHabit, updateHabit, deleteHabit, reorderHabits, seedHabits } = useHabits();
  const [newTitle, setNewTitle] = useState('');

  // Handle Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(habits);
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, moved);

    // Update their positions sequentially
    reorderHabits(reordered.map((h, i) => ({ ...h, position: i })));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addHabit(newTitle.trim());
    setNewTitle('');
  };

  // Global escape handler for modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-xl border border-border-soft">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-soft p-6">
          <h2 className="text-lg font-semibold tracking-tight">Manage Habits</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-green-gray hover:bg-green-pale hover:text-text transition-colors duration-150">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {isLoading ? (
            <div className="py-8 text-center text-sm text-green-gray animate-pulse">
              Loading...
            </div>
          ) : habits.length === 0 ? (
            <div className="mb-4 rounded-lg border border-dashed border-border-soft bg-surface p-6 text-center">
              <p className="text-sm text-green-gray mb-3">You don't have any habits yet.</p>
              <button
                onClick={seedHabits}
                className="rounded-lg bg-green-mid px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-green-deep hover:shadow-sm"
              >
                Seed Example Habits
              </button>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="habits-list">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {habits.map((habit, index) => (
                    <Draggable key={habit.id} draggableId={habit.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 rounded-xl border bg-surface p-3 transition-all duration-150 ${
                            snapshot.isDragging ? 'border-green-mid shadow-lg' : 'border-border-soft hover:border-green-mid/30'
                          } ${!habit.is_active ? 'opacity-60 bg-surface' : ''}`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move p-1 text-green-gray/40 hover:text-green-gray transition-colors duration-150"
                          >
                            <GripIcon />
                          </div>

                          <input
                            type="text"
                            value={habit.title}
                            onChange={(e) => updateHabit(habit.id, { title: e.target.value })}
                            className="flex-1 bg-transparent text-sm outline-none focus:border-b focus:border-green-mid"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateHabit(habit.id, { is_active: !habit.is_active })}
                              className="text-[11px] font-semibold uppercase tracking-wider text-green-gray hover:text-green-deep transition-colors duration-150"
                            >
                              {habit.is_active ? 'Archive' : 'Restore'}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this habit? You will lose its check-in history.')) {
                                  deleteHabit(habit.id);
                                }
                              }}
                              className="p-1 text-green-gray/40 hover:text-red-500 transition-colors duration-150"
                              title="Delete permanently"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          )}

          <form onSubmit={handleAdd} className="mt-4">
            <input
              type="text"
              placeholder="+ New habit"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setNewTitle('');
                  e.target.blur();
                }
              }}
              className="w-full rounded-xl border border-border-soft px-4 py-2.5 text-sm outline-none transition-all duration-150 focus:border-green-mid focus:shadow-[0_0_0_3px_rgba(46,133,72,0.08)]"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

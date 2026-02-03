import { useState, useEffect } from 'react';
import { api } from '../services/api';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [error, setError] = useState(null);

    // 1. Charger les tâches au montage du composant
    const fetchTodos = async () => {
        try {
            const data = await api.getTodos();
            setTodos(data);
        } catch (err) {
            setError("Impossible de charger les tâches. Es-tu connecté ?");
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    // 2. Ajouter une tâche
    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        try {
            const createdTodo = await api.addTodo(newTodo);
            setTodos([...todos, createdTodo]); // Mise à jour locale de l'UI
            setNewTodo('');
        } catch (err) {
            setError("Erreur lors de l'ajout.");
        }
    };

    // 3. Supprimer une tâche
    const handleDelete = async (id) => {
        try {
            await api.deleteTodo(id);
            setTodos(todos.filter(t => t.id !== id)); // Filtrer localement
        } catch (err) {
            setError("Erreur lors de la suppression.");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px' }}>
            <h2>Mes Tâches</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleAddTodo}>
                <input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Nouvelle tâche..."
                />
                <button type="submit">Ajouter</button>
            </form>

            <ul>
                {todos.map(todo => (
                    <li key={todo.id} style={{ marginBottom: '10px' }}>
                        {todo.title}
                        <button
                            onClick={() => handleDelete(todo.id)}
                            style={{ marginLeft: '10px', color: 'red' }}
                        >
                            x
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;

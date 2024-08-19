import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/materials`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        setMaterials(response.data);
      } catch (err) {
        console.error('No se pudo obtener los materiales:', err);
      }
    };
    fetchMaterials();
  }, []);

  const handleUpdateStock = async (action) => {
    if (!selectedMaterial) {
      setMessage('Por favor, selecciona un material.');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/materials/update`, {
        materialId: selectedMaterial,
        quantity: action === 'add' ? quantity : -quantity,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMessage(`Stock actualizado correctamente: ${response.data.material.name}`);
      setQuantity(0); // Restablece el campo de cantidad
    } catch (err) {
      console.error('No se pudo actualizar el stock:', err);
      setMessage('Error al actualizar el stock.');
    }
  };

  return (
    <div>
      <h2>Gestión de Inventario</h2>
      <select onChange={(e) => setSelectedMaterial(e.target.value)} value={selectedMaterial}>
        <option value="">Selecciona un material</option>
        {materials.map(material => (
          <option key={material.id} value={material.id}>{material.name} - {material.stock} unidades en stock</option>
        ))}
      </select>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(parseInt(e.target.value, 10))} 
        placeholder="Introduce la cantidad" 
      />
      <button onClick={() => handleUpdateStock('add')}>Añadir al Stock</button>
      <button onClick={() => handleUpdateStock('subtract')}>Restar del Stock</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Dashboard;
import React, { useState } from 'react';
import axios from 'axios';

const InventoryManager = () => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(0);

  const handleUpdate = async (action) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/materials/update`, {
        materialId: selectedMaterial,
        quantity: action === 'add' ? quantity : -quantity,
      });
      
      if (response.data.success) {
        alert('Material actualizado correctamente');
        // Aquí puedes actualizar el estado del componente para reflejar el nuevo stock
        // por ejemplo, recargar la lista de materiales o actualizar el stock mostrado
      }
    } catch (error) {
      console.error('Error al actualizar el material:', error);
    }
  };

  return (
    <div>
      <h2>Gestión de Inventario</h2>
      <select onChange={(e) => setSelectedMaterial(e.target.value)}>
        {/* Llenar las opciones con los materiales disponibles */}
      </select>
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <button onClick={() => handleUpdate('add')}>Añadir al stock</button>
      <button onClick={() => handleUpdate('subtract')}>Restar del stock</button>
    </div>
  );
};

export default InventoryManager;
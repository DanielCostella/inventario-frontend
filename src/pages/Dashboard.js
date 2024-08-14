import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/materials`);
        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };

    fetchMaterials();
  }, []);

  const handleMaterialChange = (e) => {
    const materialId = e.target.value;
    setSelectedMaterial(materialId);
    const material = materials.find((m) => m.id === materialId);
    setLastUpdated(material ? new Date(material.lastUpdated).toLocaleString() : '');
  };

  const handleUpdate = async (action) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/materials/update`, {
        materialId: selectedMaterial,
        quantity: action === 'add' ? quantity : -quantity,
      });
      
      if (response.data.success) {
        alert('Material actualizado correctamente');
        setLastUpdated(new Date(response.data.material.lastUpdated).toLocaleString());
      }
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <select onChange={handleMaterialChange} value={selectedMaterial}>
        <option value="">Seleccione un material</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>
            {material.nombre}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Cantidad"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      <button onClick={() => handleUpdate('add')}>Sumar</button>
      <button onClick={() => handleUpdate('subtract')}>Restar</button>
      {lastUpdated && <p>Última actualización: {lastUpdated}</p>}
    </div>
  );
}

export default Dashboard;
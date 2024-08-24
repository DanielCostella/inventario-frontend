import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState('');
  const [newMaterial, setNewMaterial] = useState({ nombre: '', descripcion: '', stock: 0 });

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/materials`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        setMaterials(response.data);
      } catch (err) {
        console.error('No se pudo obtener los materiales:', err.response || err.message);
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/materials/update`, {
        materialId: selectedMaterial,
        quantity: action === 'add' ? quantity : -quantity,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMessage(`Stock actualizado correctamente: ${response.data.material.nombre}`);
      setQuantity(0);
    } catch (err) {
      console.error('No se pudo actualizar el stock:', err);
      setMessage('Error al actualizar el stock.');
    }
  };

  const handleAddMaterial = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/materials`, newMaterial, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMaterials([...materials, response.data]);
      setNewMaterial({ nombre: '', descripcion: '', stock: 0 });
      setMessage('Material agregado correctamente.');
    } catch (err) {
      console.error('No se pudo agregar el material:', err);
      setMessage('Error al agregar el material.');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMaterials(materials.filter(material => material.id !== materialId));
      setMessage('Material eliminado correctamente.');
    } catch (err) {
      console.error('No se pudo eliminar el material:', err);
      setMessage('Error al eliminar el material.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Gestión de Inventario</h2>

      {/* Sección para añadir un nuevo material */}
      <div className="card mb-4">
        <div className="card-header">Añadir Nuevo Material</div>
        <div className="card-body">
          <div className="form-group">
            <input 
              type="text" 
              className="form-control"
              placeholder="Nombre del Material" 
              value={newMaterial.nombre} 
              onChange={(e) => setNewMaterial({ ...newMaterial, nombre: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <input 
              type="text" 
              className="form-control"
              placeholder="Descripción" 
              value={newMaterial.descripcion} 
              onChange={(e) => setNewMaterial({ ...newMaterial, descripcion: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <input 
              type="number" 
              className="form-control"
              placeholder="Stock Inicial" 
              value={newMaterial.stock} 
              onChange={(e) => setNewMaterial({ ...newMaterial, stock: Math.max(0, parseInt(e.target.value, 10)) })} 
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddMaterial}>Añadir Material</button>
        </div>
      </div>

      {/* Sección para actualizar el stock */}
      <div className="card mb-4">
        <div className="card-header">Actualizar Stock</div>
        <div className="card-body">
          <div className="form-group">
            <select className="form-control" onChange={(e) => setSelectedMaterial(e.target.value)} value={selectedMaterial || ""}>
              <option value="">Selecciona un material</option>
              {materials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.nombre} - {material.stock} unidades en stock (Última actualización: {new Date(material.updatedAt).toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <input 
              type="number" 
              className="form-control"
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10)))} 
              placeholder="Introduce la cantidad" 
            />
          </div>
          <button className="btn btn-success mr-2" onClick={() => handleUpdateStock('add')}>Añadir al Stock</button>
          <button className="btn btn-danger" onClick={() => handleUpdateStock('subtract')}>Restar del Stock</button>
        </div>
      </div>

      {/* Sección para eliminar un material */}
      <div className="card mb-4">
        <div className="card-header">Eliminar Material</div>
        <div className="card-body">
          <ul className="list-group">
            {materials.map(material => (
              <li key={material.id} className="list-group-item d-flex justify-content-between align-items-center">
                {material.nombre} - {material.stock} unidades
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMaterial(material.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {message && <p className="alert alert-info">{message}</p>}
    </div>
  );
}

export default Dashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import './Dashboard.css';  // Nuevo archivo para estilos personalizados


function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState('');
  const [newMaterial, setNewMaterial] = useState({ nombre: '', descripcion: '', stock: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      setShowAddModal(false); // Cerrar modal después de añadir
    } catch (err) {
      console.error('No se pudo agregar el material:', err);
      setMessage('Error al agregar el material.');
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) {
      setMessage('Por favor, selecciona un material para eliminar.');
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/materials/${selectedMaterial}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMaterials(materials.filter(material => material.id !== selectedMaterial));
      setSelectedMaterial(null); 
      setMessage('Material eliminado correctamente.');
      setShowDeleteModal(false); // Cerrar modal después de eliminar
    } catch (err) {
      console.error('No se pudo eliminar el material:', err);
      setMessage('Error al eliminar el material.');
    }
  };

  return (
    <div className="container mt-5 dashboard-container">
      <h2 className="mb-4 text-center">Gestión de Inventario</h2>

      {/* Sección para seleccionar material */}
      <div className="card mb-4">
        <div className="card-header">Seleccionar Material</div>
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
          <div className="text-center">
            <button className="btn btn-success mr-2" onClick={() => handleUpdateStock('add')}>Añadir al Stock</button>
            <button className="btn btn-danger" onClick={() => handleUpdateStock('subtract')}>Restar del Stock</button>
          </div>
        </div>
      </div>

      {/* Botones para abrir modales */}
      <div className="text-center mb-4">
        <button className="btn btn-primary mr-2" onClick={() => setShowAddModal(true)}>Añadir Nuevo Material</button>
        <button className="btn btn-warning" onClick={() => setShowDeleteModal(true)}>Eliminar Material</button>
      </div>

      {/* Modal para añadir nuevo material */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Añadir Nuevo Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input 
            type="text" 
            className="form-control mb-2"
            placeholder="Nombre del Material" 
            value={newMaterial.nombre} 
            onChange={(e) => setNewMaterial({ ...newMaterial, nombre: e.target.value })} 
          />
          <input 
            type="text" 
            className="form-control mb-2"
            placeholder="Descripción" 
            value={newMaterial.descripcion} 
            onChange={(e) => setNewMaterial({ ...newMaterial, descripcion: e.target.value })} 
          />
          <input 
            type="number" 
            className="form-control"
            placeholder="Stock Inicial" 
            value={newMaterial.stock} 
            onChange={(e) => setNewMaterial({ ...newMaterial, stock: Math.max(0, parseInt(e.target.value, 10)) })} 
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleAddMaterial}>Añadir Material</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para eliminar material */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <select className="form-control mb-2" onChange={(e) => setSelectedMaterial(e.target.value)} value={selectedMaterial || ""}>
            <option value="">Selecciona un material para eliminar</option>
            {materials.map(material => (
              <option key={material.id} value={material.id}>
                {material.nombre} - {material.stock} unidades en stock
              </option>
            ))}
          </select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteMaterial}>Eliminar Material</Button>
        </Modal.Footer>
      </Modal>

      {message && <div className="alert alert-info mt-3 text-center">{message}</div>}
    </div>
  );
}

export default Dashboard;
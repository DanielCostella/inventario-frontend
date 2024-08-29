import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal, Button, Table, Form, InputGroup } from 'react-bootstrap';
import './Dashboard.css';

function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [message, setMessage] = useState('');
  const [newMaterial, setNewMaterial] = useState({ nombre: '', descripcion: '', stock: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteSearchTerm, setDeleteSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentUser();
      await fetchMaterials();
    };
    fetchData();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Usuario actual:', response.data);
      setCurrentUser(response.data);
    } catch (err) {
      console.error('No se pudo obtener la información del usuario:', err);
      setMessage('Error al obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
      setFilteredMaterials(response.data);
      const initialQuantities = {};
      response.data.forEach(material => {
        initialQuantities[material.id] = 0;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error('No se pudo obtener los materiales:', err.response || err.message);
      setMessage('Error al cargar los materiales. Por favor, intenta recargar la página.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleUpdateStock = async (materialId, change) => {
    if (!currentUser || !currentUser.email) {
      setMessage('Error: No se pudo identificar al usuario actual. Por favor, inicia sesión nuevamente.');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      console.log('Enviando actualización:', { materialId, change, updatedBy: currentUser.email });
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/materials/${materialId}`, {
        quantity: change,
        updatedBy: currentUser.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Respuesta de actualización:', response.data);
      const updatedMaterial = response.data;
      setMaterials(prevMaterials => 
        prevMaterials.map(material => 
          material.id === materialId ? updatedMaterial : material
        )
      );
      setFilteredMaterials(prevFiltered => 
        prevFiltered.map(material => 
          material.id === materialId ? updatedMaterial : material
        )
      );

      setMessage(`Stock actualizado correctamente por ${updatedMaterial.updatedBy}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('No se pudo actualizar el stock:', err);
      setMessage('Error al actualizar el stock. Por favor, intenta nuevamente.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleAddMaterial = async () => {
    if (!currentUser || !currentUser.email) {
      setMessage('Error: No se pudo identificar al usuario actual. Por favor, inicia sesión nuevamente.');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/materials`, 
        { ...newMaterial, createdBy: currentUser.email, updatedBy: currentUser.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaterials(prevMaterials => [...prevMaterials, response.data]);
      setFilteredMaterials(prevFiltered => [...prevFiltered, response.data]);
      setNewMaterial({ nombre: '', descripcion: '', stock: 0 });
      setMessage('Material agregado correctamente.');
      setShowAddModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('No se pudo agregar el material:', err);
      setMessage('Error al agregar el material. Por favor, intenta nuevamente.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) {
      setMessage('Por favor, selecciona un material para eliminar.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/materials/${selectedMaterial}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(prevMaterials => prevMaterials.filter(material => material.id !== selectedMaterial));
      setFilteredMaterials(prevFiltered => prevFiltered.filter(material => material.id !== selectedMaterial));
      setSelectedMaterial(null);
      setMessage('Material eliminado correctamente.');
      setShowDeleteModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('No se pudo eliminar el material:', err);
      setMessage('Error al eliminar el material. Por favor, intenta nuevamente.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = materials.filter(material => 
      material.nombre.toLowerCase().includes(term) ||
      material.descripcion.toLowerCase().includes(term)
    );
    setFilteredMaterials(filtered);
  };

  const handleDeleteSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setDeleteSearchTerm(term);
  };

  const handleQuantityChange = (materialId, value) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [materialId]: parseInt(value) || 0
    }));
  };

  return (
    <div className="dashboard-container">
      <h2 className="mb-4">Gestión de Inventario</h2>
      
      {currentUser && (
        <div className="user-info mb-3">
          Usuario actual: {currentUser.email}
        </div>
      )}

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar material..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </Form.Group>

      <div className="table-container" ref={tableRef}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Stock</th>
              <th>Última Actualización</th>
              <th>Actualizado por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="material-row">
                <td>{material.nombre}</td>
                <td>{material.descripcion}</td>
                <td>
                  {material.stock === 0 ? (
                    <span className="text-danger">Sin stock disponible</span>
                  ) : (
                    material.stock
                  )}
                </td>
                <td>{new Date(material.updatedAt).toLocaleString()}</td>
                <td>{material.updatedBy || 'N/A'}</td>
                <td>
                  <InputGroup size="sm">
                    <Form.Control
                      type="number"
                      value={quantities[material.id] || 0}
                      onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                    />
                    <Button 
                      variant="outline-danger" 
                      onClick={() => handleUpdateStock(material.id, -(quantities[material.id] || 0))}
                      disabled={material.stock === 0}
                    >
                      -
                    </Button>
                    <Button 
                      variant="outline-success" 
                      onClick={() => handleUpdateStock(material.id, quantities[material.id] || 0)}
                    >
                      +
                    </Button>
                  </InputGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="text-center mb-4 mt-3">
        <Button variant="primary" className="me-2" onClick={() => setShowAddModal(true)}>Añadir Nuevo Material</Button>
        <Button variant="warning" onClick={() => setShowDeleteModal(true)}>Eliminar Material</Button>
      </div>

      {/* Modal para añadir nuevo material */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Añadir Nuevo Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control 
            type="text" 
            placeholder="Nombre del Material" 
            value={newMaterial.nombre} 
            onChange={(e) => setNewMaterial({ ...newMaterial, nombre: e.target.value })} 
            className="mb-2"
          />
          <Form.Control 
            type="text" 
            placeholder="Descripción" 
            value={newMaterial.descripcion} 
            onChange={(e) => setNewMaterial({ ...newMaterial, descripcion: e.target.value })} 
            className="mb-2"
          />
          <Form.Control 
            type="number" 
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
          <Form.Control
            type="text"
            placeholder="Buscar material para eliminar..."
            value={deleteSearchTerm}
            onChange={handleDeleteSearch}
            className="mb-3"
          />
          <Form.Select 
            onChange={(e) => setSelectedMaterial(e.target.value)} 
            value={selectedMaterial || ""}
          >
            <option value="">Selecciona un material para eliminar</option>
            {materials
              .filter(material => 
                material.nombre.toLowerCase().includes(deleteSearchTerm.toLowerCase()) ||
                material.descripcion.toLowerCase().includes(deleteSearchTerm.toLowerCase())
              )
              .map(material => (
                <option key={material.id} value={material.id}>
                  {material.nombre} - {material.stock} unidades en stock
                </option>
              ))
            }
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteMaterial}>Eliminar Material</Button>
        </Modal.Footer>
      </Modal>

      {message && (
        <div className="alert alert-info mt-3 text-center message-overlay">
          {message}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
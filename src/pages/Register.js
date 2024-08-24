import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        username: email,
        password: password,
      });
      setMessage('Usuario registrado exitosamente.');

      // Esperar un momento para que el mensaje se muestre antes de redirigir
      setTimeout(() => {
        navigate('/login');  // Redirige al login después del registro exitoso
      }, 2000);  // 2 segundos de espera (2000 milisegundos)
    } catch (error) {
      setMessage('Error al registrar el usuario.');
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Registrar</button>
        {message && <p>{message}</p>} {/* Aquí se muestra el mensaje */}
      </form>
    </div>
  );
}

export default Register;
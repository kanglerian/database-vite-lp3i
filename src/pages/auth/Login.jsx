import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Login = () => {
  const [email, setEmail] = useState('benny.lp3i@gmail.com');
  const [password, setPassword] = useState('benny123');
  const [users, setUsers] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await axios.post(`http://localhost:3000/auth/login`, {
      email: email,
      password: password
    })
      .then((response) => {
        localStorage.setItem('PMBOnline:token', response.data.data.token);
        getUsers();
        alert(response.data.status);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getUsers = async () => {
    try {
      const accessToken = localStorage.getItem('PMBOnline:token');
      const response = await axios.get(`http://localhost:3000/users`,{
        headers: {
          Authorization: accessToken
        }
      });
      setUsers(response.data);
    } catch (error) {
      const response = error.response;
      if (response.status === 403) {
        const token = await refreshToken();
        if(!token){
          setUsers([]);
          return;
        }
        const retryResponse = await axios.get(`http://localhost:3000/users`,{
          headers: {
            Authorization: token
          }
        });
        setUsers(retryResponse.data);
      }
    }
  }

  const refreshToken = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/auth/token`,{
        withCredentials: true,
      });
      const accessToken = response.data.data.token;
      localStorage.setItem('PMBOnline:token', accessToken);
      return accessToken;
    } catch (error) {
      return null;
    }
  }

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('PMBOnline:token');
      const response = await axios.delete(`http://localhost:3000/auth/logout`,{
        headers: {
          Authorization: accessToken
        }
      });
      localStorage.removeItem('PMBOnline:token');
      console.log(response);
    } catch (error) {
      return;
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <main>
      <form onSubmit={handleLogin} method="post">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
        <button type="submit">Login</button>
      </form>
      <section>
        <button type='button' onClick={getUsers}>Get Users</button>
        <button type='button' onClick={refreshToken}>Refresh</button>
        <button type='button' onClick={handleLogout}>Logout</button>
        <table>
          <thead>
            <tr>
              <td>No</td>
              <td>Nama lengkap</td>
              <td>Email</td>
            </tr>
          </thead>
          <tbody>
            {
              users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">Data belum ada</td>
                </tr>
              )
            }
          </tbody>
        </table>
      </section>
    </main>
  )
}

export default Login
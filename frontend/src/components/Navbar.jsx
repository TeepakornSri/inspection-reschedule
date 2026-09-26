import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const users = [
  { id: '1', name: 'Somchai (ผู้ขอ)' },
  { id: '2', name: 'Nattaya (ผู้ขอ)' },
  { id: '3', name: 'Wichai (หัวหน้างาน)' },
  { id: '4', name: 'Pensri (หัวหน้างาน)' },
  { id: '5', name: 'Anan (ผู้จัดการฝ่าย)' },
];

export default function Navbar() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '1');

  const handleChangeUser = (e) => {
    setUserId(e.target.value);
    localStorage.setItem('userId', e.target.value);
  };

  const menuClass = ({ isActive }) =>
    isActive
      ? 'px-4 py-2 rounded-lg bg-white text-sky-700 font-semibold'
      : 'px-4 py-2 rounded-lg text-white hover:bg-white/20';

  return (
    <header className='bg-linear-to-r from-sky-400 to-sky-600 shadow-md'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
          <h1 className='text-white text-xl font-bold'>ระบบขอเลื่อนกำหนดตรวจสอบอุปกรณ์</h1>
          <nav className='flex gap-2'>
            <NavLink to='/' end className={menuClass}>รายการอุปกรณ์</NavLink>
            <NavLink to='/request' className={menuClass}>ยื่นคำขอ</NavLink>
            <NavLink to='/pending' className={menuClass}>รออนุมัติ</NavLink>
             <NavLink to='/history' className={menuClass}>ประวัติคำขอ</NavLink>
          </nav>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-white text-sm'>ผู้ใช้ :</span>
          <select
            value={userId}
            onChange={handleChangeUser}
            className='rounded-lg px-3 py-2 text-sm bg-white text-sky-900 outline-none'
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import axios from '../config/axios';

const criticalityStyle = {
  A: 'bg-rose-100 text-rose-700',
  B: 'bg-amber-100 text-amber-700',
  C: 'bg-emerald-100 text-emerald-700',
};

const gridStyle = {
  height: '500px',
  '--ag-active-color': '#0284c7',
  '--ag-header-background-color': '#f0f9ff',
  '--ag-header-foreground-color': '#0c4a6e',
  '--ag-row-hover-color': '#f0f9ff',
  '--ag-border-color': '#e0f2fe',
  '--ag-wrapper-border-radius': '0px',
  '--ag-font-family': 'inherit',
};

const NoRowsOverlay = () => (
  <span className='text-sky-700'>ไม่พบข้อมูลอุปกรณ์</span>
);

export default function EquipmentList() {
  const [tagNo, setTagNo] = useState('');
  const [name, setName] = useState('');
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get('/equipment');
        setRowData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      }
    };

    fetchEquipment();
  }, []);

  const handleSearch = () => {
    const filtered = rowData.filter((item) =>
      item.tag_no.toLowerCase().includes(tagNo.toLowerCase()) &&
      item.name.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleClearSearch = () => {
    setTagNo('');
    setName('');
    setFilteredData(rowData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const columnDefs = useMemo(() => [
    {
      field: 'tag_no',
      headerName: 'รหัสอุปกรณ์',
      flex: 1,
      minWidth: 130,
      cellClass: 'font-semibold text-sky-800',
    },
    {
      field: 'name',
      headerName: 'ชื่ออุปกรณ์',
      flex: 2,
      minWidth: 240,
    },
    {
      field: 'location',
      headerName: 'ตำแหน่งติดตั้ง',
      flex: 1.3,
      minWidth: 170,
    },
    {
      field: 'criticality',
      headerName: 'ระดับ',
      flex: 0.6,
      minWidth: 100,
      cellRenderer: (params) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${criticalityStyle[params.value]}`}>
          {params.value}
        </span>
      ),
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    },
    {
      field: 'next_due_date',
      headerName: 'กำหนดตรวจครั้งถัดไป',
      flex: 1,
      minWidth: 160,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  }), []);

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-sky-900'>รายการอุปกรณ์</h1>
        <p className='text-sky-700'>ค้นหาและดูกำหนดตรวจสอบของอุปกรณ์</p>
      </div>

      <div className='bg-white border border-sky-200 rounded-lg shadow-md mb-6'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold text-sky-900 mb-6'>ค้นหาอุปกรณ์</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>รหัสอุปกรณ์</label>
              <input
                type='text'
                value={tagNo}
                onChange={(e) => setTagNo(e.target.value)}
                onKeyDown={handleKeyDown}
                className='w-full border border-sky-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400'
                placeholder='เช่น PSV-1001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>ชื่ออุปกรณ์</label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className='w-full border border-sky-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400'
                placeholder='เช่น Pump'
              />
            </div>
          </div>

          <div className='flex flex-col-reverse sm:flex-row justify-end gap-3'>
            <button
              type='button'
              onClick={handleClearSearch}
              className='px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2'
            >
              <FiX size={16} />
              ล้างการค้นหา
            </button>
            <button
              type='button'
              onClick={handleSearch}
              className='px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center justify-center gap-2'
            >
              <FiSearch size={16} />
              ค้นหา
            </button>
          </div>
        </div>
      </div>

      <div className='bg-white border border-sky-200 rounded-lg shadow-md overflow-hidden'>
        <div className='p-6 border-b border-sky-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1'>
          <h2 className='text-xl font-semibold text-sky-900'>รายการอุปกรณ์</h2>
          <span className='text-sm text-sky-700'>พบข้อมูลทั้งหมด {filteredData.length} รายการ</span>
        </div>

        <div className='ag-theme-quartz w-full' style={gridStyle}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={filteredData}
            defaultColDef={defaultColDef}
            animateRows={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            headerHeight={48}
            rowHeight={52}
            suppressMovableColumns={true}
            noRowsOverlayComponent={NoRowsOverlay}
          />
        </div>
      </div>
    </div>
  );
}
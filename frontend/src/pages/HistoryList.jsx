import { useEffect, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  <span className='text-sky-700'>ไม่มีประวัติคำขอ</span>
);

export default function HistoryList() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('');
  const [criticality, setCriticality] = useState('');
  const [location, setLocation] = useState('');
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/requests/history');
        setRowData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, []);

  const locationList = [...new Set(rowData.map((item) => item.location))];

  const handleSearch = () => {
    const filtered = rowData.filter((item) => {
      const modifyDate = new Date(item.modify_date);

      if (startDate && modifyDate < startDate) return false;

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (modifyDate > end) return false;
      }

      if (status && item.status !== status) return false;
      if (criticality && item.criticality !== criticality) return false;
      if (location && item.location !== location) return false;

      return true;
    });

    setFilteredData(filtered);
  };

  const handleClearSearch = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus('');
    setCriticality('');
    setLocation('');
    setFilteredData(rowData);
  };

  const columnDefs = [
      {
      field: 'id',
      headerName: 'เลขที่เอกสาร',
      width: 130,
      valueFormatter: (params) => `Doc-${String(params.value).padStart(3, '0')}`,
    },
    {
      field: 'tag_no',
      headerName: 'อุปกรณ์',
      flex: 2,
      minWidth: 220,
      cellRenderer: (params) => (
        <div className='flex flex-col leading-tight'>
          <span className='font-semibold text-sky-800'>{params.data.tag_no}</span>
          <span className='text-sm text-gray-500'>{params.data.equipment_name}</span>
        </div>
      ),
    },
    {
      field: 'location',
      headerName: 'ตำแหน่งติดตั้ง',
      flex: 1.2,
      minWidth: 160,
    },
    {
      field: 'criticality',
      headerName: 'ระดับ',
      width: 90,
      cellRenderer: (params) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${criticalityStyle[params.value]}`}>
          {params.value}
        </span>
      ),
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    },
    {
      field: 'old_due_date',
      headerName: 'กำหนดเดิม / วันที่ขอ',
      flex: 1,
      minWidth: 150,
      cellRenderer: (params) => (
        <div className='flex flex-col leading-tight'>
          <span className='text-gray-500'>{params.data.old_due_date}</span>
          <span className='font-semibold text-sky-800'>{params.data.new_due_date}</span>
        </div>
      ),
    },
    {
      field: 'reason',
      headerName: 'เหตุผล',
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: 'create_by_name',
      headerName: 'ผู้ยื่น / วันที่ยื่น',
      flex: 1.2,
      minWidth: 170,
      cellRenderer: (params) => (
        <div className='flex flex-col leading-tight'>
          <span>{params.data.create_by_name}</span>
          <span className='text-sm text-gray-500'>
            {new Date(params.data.create_date).toLocaleDateString('en-GB')}
          </span>
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      width: 110,
      cellRenderer: (params) =>
        params.value === 'A' ? (
          <span className='px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'>
            อนุมัติ
          </span>
        ) : (
          <span className='px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700'>
            ปฏิเสธ
          </span>
        ),
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    },
    {
      field: 'modify_by_name',
      headerName: 'ผู้ดำเนินการ / วันที่',
      flex: 1.2,
      minWidth: 170,
      cellRenderer: (params) => (
        <div className='flex flex-col leading-tight'>
          <span>{params.data.modify_by_name}</span>
          <span className='text-sm text-gray-500'>
            {params.data.modify_date ? new Date(params.data.modify_date).toLocaleDateString('en-GB') : '-'}
          </span>
        </div>
      ),
    },
  ];

  const defaultColDef = {
    sortable: true,
    resizable: true,
    cellStyle: { display: 'flex', alignItems: 'center' },
  };

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-sky-900'>ประวัติคำขอ</h1>
        <p className='text-sky-700'>คำขอที่อนุมัติหรือปฏิเสธไปแล้ว</p>
      </div>

      <div className='bg-white border border-sky-200 rounded-lg shadow-md mb-6'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold text-sky-900 mb-6'>ค้นหาประวัติ</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6'>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>วันที่ดำเนินการตั้งแต่</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                dateFormat='dd/MM/yyyy'
                placeholderText='เลือกวันที่'
                wrapperClassName='w-full'
                className='w-full border border-sky-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>ถึงวันที่</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat='dd/MM/yyyy'
                placeholderText='เลือกวันที่'
                wrapperClassName='w-full'
                className='w-full border border-sky-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className='w-full border border-sky-200 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400'
              >
                <option value=''>ทั้งหมด</option>
                <option value='A'>อนุมัติ</option>
                <option value='R'>ปฏิเสธ</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>ระดับ</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
                className='w-full border border-sky-200 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400'
              >
                <option value=''>ทั้งหมด</option>
                <option value='A'>A</option>
                <option value='B'>B</option>
                <option value='C'>C</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>ตำแหน่งติดตั้ง</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className='w-full border border-sky-200 rounded-lg px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400'
              >
                <option value=''>ทั้งหมด</option>
                {locationList.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
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
          <h2 className='text-xl font-semibold text-sky-900'>รายการประวัติ</h2>
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
            rowHeight={64}
            suppressMovableColumns={true}
            noRowsOverlayComponent={NoRowsOverlay}
          />
        </div>
      </div>
    </div>
  );
}
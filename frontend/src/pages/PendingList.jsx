import { useEffect, useState } from 'react';
import { FiSearch, FiX, FiCheck, FiXCircle } from 'react-icons/fi';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
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
  <span className='text-sky-700'>ไม่มีคำขอที่รออนุมัติ</span>
);

export default function PendingList() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [criticality, setCriticality] = useState('');
  const [location, setLocation] = useState('');
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await axios.get('/requests/pending');
        setRowData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      }
    };

    fetchPending();
  }, []);

  const locationList = [...new Set(rowData.map((item) => item.location))];

  const handleSearch = () => {
    const filtered = rowData.filter((item) => {
      const createDate = new Date(item.create_date);

      if (startDate && createDate < startDate) return false;

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (createDate > end) return false;
      }

      if (criticality && item.criticality !== criticality) return false;
      if (location && item.location !== location) return false;

      return true;
    });

    setFilteredData(filtered);
  };

  const handleClearSearch = () => {
    setStartDate(null);
    setEndDate(null);
    setCriticality('');
    setLocation('');
    setFilteredData(rowData);
  };

  const handleDecision = async (data, action) => {
    const isApprove = action === 'approve';

    const confirm = await Swal.fire({
      icon: 'question',
      title: isApprove ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ',
      html: `
        <div style="text-align:left; line-height:2">
        <b>เลขที่เอกสาร:</b> Doc-${String(data.id).padStart(3, '0')}<br/>
          <b>อุปกรณ์:</b> ${data.tag_no} - ${data.equipment_name}<br/>
          <b>เลื่อนจาก:</b> ${data.old_due_date} <b>ไป</b> ${data.new_due_date}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isApprove ? 'อนุมัติ' : 'ปฏิเสธ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: isApprove ? '#16a34a' : '#dc2626',
      cancelButtonColor: '#9ca3af',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.patch(`/requests/${data.id}/${action}`);

      setRowData((prev) => prev.filter((item) => item.id !== data.id));
      setFilteredData((prev) => prev.filter((item) => item.id !== data.id));

      Swal.fire({
        icon: 'success',
        title: isApprove ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0284c7',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถดำเนินการได้',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0284c7',
      });
    }
  };

  const columnDefs = [
        {
      field: 'id',
      headerName: 'เลขที่เอกสาร',
      width: 130,
      sort: 'desc',
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
      field: 'attempt',
      headerName: 'ครั้งที่',
      width: 90,
      cellRenderer: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            params.value >= 2 ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
          }`}
        >
          {params.value}
        </span>
      ),
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
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
      field: 'need_manager',
      headerName: 'ผู้มีสิทธิ์อนุมัติ',
      width: 140,
      cellRenderer: (params) =>
        params.value === 'Y' ? (
          <span className='px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700'>
            ผู้จัดการฝ่าย
          </span>
        ) : (
          <span className='px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700'>
            หัวหน้างาน
          </span>
        ),
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      pinned: 'right',
      sortable: false,
      cellRenderer: (params) => (
        <div className='flex gap-2 items-center justify-center h-full'>
          <button
            onClick={() => handleDecision(params.data, 'approve')}
            className='flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200'
            title='อนุมัติ'
          >
            <FiCheck size={18} />
          </button>
          <button
            onClick={() => handleDecision(params.data, 'reject')}
            className='flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200'
            title='ปฏิเสธ'
          >
            <FiXCircle size={18} />
          </button>
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
        <h1 className='text-2xl font-bold text-sky-900'>คำขอที่รออนุมัติ</h1>
        <p className='text-sky-700'>ตรวจสอบและอนุมัติคำขอเลื่อนกำหนดตรวจสอบ</p>
      </div>

      <div className='bg-white border border-sky-200 rounded-lg shadow-md mb-6'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold text-sky-900 mb-6'>ค้นหาคำขอ</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
            <div>
              <label className='block text-sm font-medium text-sky-900 mb-2'>วันที่ยื่นตั้งแต่</label>
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
          <h2 className='text-xl font-semibold text-sky-900'>รายการคำขอ</h2>
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
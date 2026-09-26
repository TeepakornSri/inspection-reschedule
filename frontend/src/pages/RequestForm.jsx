import { useEffect, useState } from "react";
import { FiSend, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../config/axios";

const toLocalDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function RequestForm() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentId, setEquipmentId] = useState("");
  const [newDueDate, setNewDueDate] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

   useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get("/equipment");
        setEquipmentList(response.data);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      }
    };

    fetchEquipment();
  }, []);

  const selectedEquipment = equipmentList.find((e) => e.id === Number(equipmentId));

  const originalDate = selectedEquipment ? toLocalDate(selectedEquipment.next_due_date) : null;

  const days =
    originalDate && newDueDate
      ? Math.round((newDueDate - originalDate) / (1000 * 60 * 60 * 24))
      : null;

  const handleClear = () => {
    setEquipmentId("");
    setNewDueDate(null);
    setReason("");
  };

  const handleChangeEquipment = (e) => {
    setEquipmentId(e.target.value);
    setNewDueDate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = [];
    if (!equipmentId) missing.push("อุปกรณ์");
    if (!newDueDate) missing.push("วันที่ต้องการเลื่อนไป");
    if (!reason.trim()) missing.push("เหตุผล");

    if (missing.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        html: `กรุณากรอก<br/><b>${missing.join("<br/>")}</b>`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#0284c7",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันการยื่นคำขอ",
      html: `
        <div style="text-align:left; line-height:2">
          <b>อุปกรณ์:</b> ${selectedEquipment.tag_no} - ${selectedEquipment.name}<br/>
          <b>ระดับ:</b> ${selectedEquipment.criticality}<br/>
          <b>กำหนดตรวจเดิม:</b> ${originalDate.toLocaleDateString("en-GB")}<br/>
          <b>เลื่อนไปวันที่:</b> ${newDueDate.toLocaleDateString("en-GB")}<br/>
          <b>จำนวนวันที่เลื่อน:</b> ${days} วัน<br/>
          <b>เหตุผล:</b> ${escapeHtml(reason)}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#0284c7",
      cancelButtonColor: "#9ca3af",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);

      await axios.post("/requests", {
        equipment_id: Number(equipmentId),
        new_due_date: newDueDate.toLocaleDateString("en-CA"),
        reason: reason,
      });

      Swal.fire({
        icon: "success",
        title: "ยื่นคำขอเรียบร้อย",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#0284c7",
      });
      handleClear();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถยื่นคำขอได้",
        text: error.response?.data?.message || "เกิดข้อผิดพลาด",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#0284c7",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sky-900">ยื่นคำขอเลื่อนกำหนดตรวจสอบ</h1>
        <p className="text-sky-700">เลือกอุปกรณ์ ระบุวันที่ใหม่และเหตุผล</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-sky-200 rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-sky-900 mb-6">ข้อมูลคำขอ</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-sky-900 mb-2">
                อุปกรณ์:
              </label>
              <select
                value={equipmentId}
                onChange={handleChangeEquipment}
                className="w-full border border-sky-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">เลือกอุปกรณ์</option>
                {equipmentList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tag_no} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sky-900 mb-2">
                กำหนดตรวจเดิม:
              </label>
              <input
                type="text"
                value={originalDate ? originalDate.toLocaleDateString("en-GB") : ""}
                readOnly
                className="w-full border border-sky-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-600"
                placeholder="-"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-sky-900 mb-2">
                วันที่ต้องการเลื่อนไป:
              </label>
              <DatePicker
                selected={newDueDate}
                onChange={(date) => setNewDueDate(date)}
                selectsEnd
                startDate={originalDate}
                endDate={newDueDate}
                highlightDates={originalDate ? [originalDate] : []}
                openToDate={newDueDate || originalDate || undefined}
                className="w-full border border-sky-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                dateFormat="dd/MM/yyyy"
                placeholderText="เลือกวันที่"
              >
                <div className="flex gap-4 px-3 py-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3dcc4a" }} />
                    กำหนดตรวจเดิม
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#216ba5" }} />
                    ช่วงที่เลื่อน
                  </div>
                </div>
              </DatePicker>

              {days !== null && (
                <p className={`mt-2 text-sm font-medium ${days > 0 ? "text-sky-700" : "text-red-500"}`}>
                  {days > 0
                    ? `เลื่อนไป ${days} วัน (${originalDate.toLocaleDateString("en-GB")} → ${newDueDate.toLocaleDateString("en-GB")})`
                    : "ต้องเลือกวันที่หลังกำหนดตรวจเดิม"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-sky-900 mb-2">
                ระดับความสำคัญ:
              </label>
              <input
                type="text"
                value={selectedEquipment ? selectedEquipment.criticality : ""}
                readOnly
                className="w-full border border-sky-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-600"
                placeholder="-"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-sky-900 mb-2">
              เหตุผล:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full border border-sky-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="ระบุเหตุผลที่ต้องการเลื่อน"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              ล้างข้อมูล
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              {loading ? "กำลังส่ง..." : "ยื่นคำขอ"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../../components/Design/AnimatedButton";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  // filter state
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [filteredData, setFilteredData] = useState([]);

  // Fetch data absensi dari API
  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://winajaya-production.up.railway.app/api/absensi/getAbsensiTable",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();
      if (result.status === "success") {
        setData(result.data);
        setFilteredData(result.data); // awalnya tampil semua
      } else {
        console.error("Gagal ambil data:", result.message);
      }
    } catch (error) {
      console.error("Error fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // Approve
  const handleApprove = async (absensiId) => {
    try {
      const res = await fetch(
        "https://winajaya-production.up.railway.app/api/validation/Approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ absensiId }),
        }
      );

      const result = await res.json();
      if (result.status === "success") {
        alert("Approved!");
        fetchData(); // refresh tabel
      } else {
        alert("Gagal approve: " + result.message);
      }
    } catch (error) {
      console.error("Error approve:", error);
    }
  };

  // Reject
  const handleReject = async (absensiId) => {
    try {
      const res = await fetch(
        "https://winajaya-production.up.railway.app/api/validation/Reject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ absensiId }),
        }
      );

      const result = await res.json();
      if (result.status === "success") {
        alert("Rejected!");
        fetchData(); // refresh tabel
      } else {
        alert("Gagal reject: " + result.message);
      }
    } catch (error) {
      console.error("Error reject:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // filter data berdasarkan input
  const handleFilter = () => {
    let filtered = [...data];

    if (searchName) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter(
        (item) =>
          item.dateWork &&
          new Date(item.dateWork).toISOString().slice(0, 10) === filterDate
      );
    }

    if (filterStatus) {
      if (filterStatus === "invalid") {
        filtered = filtered.filter((item) => item.statusLembur == null);
      } else {
        filtered = filtered.filter(
          (item) => item.statusLembur === filterStatus
        );
      }
    }

    setFilteredData(filtered);
  };
  const handleOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };
  return (
    <>
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="bg-white w-full max-w-6xl mx-auto p-6 rounded shadow">
          {/* Judul */}
          <h1 className="text-3xl font-bold mb-6">Rekap Absen Karyawan</h1>
          {/* Search & Filter */}
          <div className="flex flex-row gap-4 mb-6">
            <AnimatedButton
              onClick={() => {
                handleOut();
              }}
              className="font-semibold  w-full py-3 px-4 rounded-xl text-sm"
              variant="red"
            >
              Keluar
            </AnimatedButton>
            <AnimatedButton
              onClick={() => {
                navigate("/RegisterKaryawan");
              }}
              className="font-semibold  w-full py-3 px-4 rounded-xl text-sm"
              variant="green"
            >
              Register Karyawan
            </AnimatedButton>
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Cari Nama"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 min-w-[200px] border p-2 rounded"
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Status</option>
              <option value="Harian">Lembur Harian</option>
              <option value="HariLibur">Lembur Tanggal Merah</option>
              <option value="invalid">Tidak Lembur</option>
            </select>
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Filter
            </button>
          </div>

          {/* Tabel dengan scroll */}
          <div className="overflow-x-auto border border-blue-500 rounded">
            <div className="overflow-y-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="border px-4 py-2">No</th>
                    <th className="border px-4 py-2">Nama</th>
                    <th className="border px-4 py-2">Tanggal</th>
                    <th className="border px-4 py-2">Clock In</th>
                    <th className="border px-4 py-2">Clock Out</th>
                    <th className="border px-4 py-2">Duration</th>
                    <th className="border px-4 py-2">Note</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.absensiId}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2">{item.name}</td>
                        <td className="border px-4 py-2">
                          {item.dateWork
                            ? new Date(item.dateWork).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                        <td className="border px-4 py-2">{item.clockIn}</td>
                        <td className="border px-4 py-2">{item.clockOut}</td>
                        <td className="border px-4 py-2">{item.duration}</td>
                        <td className="border px-4 py-2">
                          {item.reason || "-"}
                        </td>
                        <td className="border px-4 py-2">
                          {item.statusLembur || "-"}
                        </td>
                        {item.validation_status ? (
                          <td
                            className={`border px-4 py-2 ${
                              item.validation_status === "APPROVED"
                                ? "text-green-500"
                                : item.validation_status === "REJECTED"
                                ? "text-red-500"
                                : "text-black"
                            }`}
                          >
                            {item.validation_status}
                          </td>
                        ) : (
                          <td className="border px-4 py-2">
                            {item.statusLembur == null ? (
                              "Tidak Lembur"
                            ) : (
                              <>
                                <button
                                  onClick={() => handleApprove(item.absensiId)}
                                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(item.absensiId)}
                                  className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        Tidak ada data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

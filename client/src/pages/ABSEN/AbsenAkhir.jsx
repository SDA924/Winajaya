import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "../../components/Design/AnimatedButton";
import clockImage from "../../assets/images/clock.png";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

const AbsenAkhir = () => {
  const navigate = useNavigate();
  const [workDuration, setWorkDuration] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [alasanIzin, setAlasanIzin] = useState("");
  const [error, setError] = useState("");
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  useEffect(() => {
    const startTime = localStorage.getItem("workStartTime");

    if (!startTime) {
      console.log("Tidak ada waktu mulai kerja yang tersimpan");
      return;
    }

    const start = new Date(startTime);

    const updateDuration = () => {
      const end = new Date();
      const duration = end - start;

      const hours = Math.floor(duration / (1000 * 60 * 60));
      // const hours = 8;
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((duration % (1000 * 60)) / 1000);

      setWorkDuration({ hours, minutes, seconds });
    };

    updateDuration();
    const timer = setInterval(updateDuration, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelesaiKerja = async () => {
    const totalSeconds =
      workDuration.hours * 3600 +
      workDuration.minutes * 60 +
      workDuration.seconds;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const totalHoursTIME = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (hours > 8 || (hours === 8 && (minutes > 0 || seconds > 0))) {
      setShowIzinModal(true);
      setTimeout(() => setShowModalContent(true), 50);
      return;
    } else {
      logout(totalHoursTIME, null);
    }
  };

  const handleSubmitIzin = async (e) => {
    e.preventDefault();

    let statusLembur;
    const now = new Date();
    const day = now.getDay();
    const holidays = ["2025-08-17", "2025-08-20"];
    const todayStr = now.toISOString().slice(0, 10);

    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.includes(todayStr);

    if (!isWeekend && !isHoliday) {
      statusLembur = "Harian";
    } else {
      statusLembur = "HariLibur";
    }
    if (alasanIzin.trim().length < 2) {
      setError("Alasan lembur minimal 5 karakter.");
      return;
    }
    const totalSeconds =
      workDuration.hours * 3600 +
      workDuration.minutes * 60 +
      workDuration.seconds;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const totalHoursTIME = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    try {
      const storedAbsentId = localStorage.getItem("userData");
      if (!storedAbsentId) {
        setError("Data absensi tidak ditemukan. Silakan absen masuk dulu.");
        return;
      }

      const currentAbsentId = JSON.parse(storedAbsentId);
      const token = localStorage.getItem("token");
      const { userId } = currentAbsentId;

      const today = new Date().toISOString().slice(0, 10);

      const res = await fetch(
        "https://winajaya-production.up.railway.app/api/izinlembur/insertsuratlembur",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // opsional
          },
          body: JSON.stringify({
            userId,
            dateLembur: today,
            reason: alasanIzin,
          }),
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        alert("Surat lembur berhasil disimpan!");
        setAlasanIzin("");
        setError("");
        logout(totalHoursTIME, statusLembur);
      } else {
        setError(data.message || "Gagal menyimpan surat lembur");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan.");
    }
  };

  const logout = async (totalHoursTIME, statusLembur) => {
    const currentAbsentId = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );
    const token = localStorage.getItem("token");
    const { userId } = currentAbsentId;
    const clock_out = new Date().toTimeString().slice(0, 8);

    try {
      const resAbsensi = await fetch(
        `https://winajaya-production.up.railway.app/api/absensi/getAbsensibyId/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const dataAbsensi = await resAbsensi.json();

      const res = await fetch(
        "https://winajaya-production.up.railway.app/api/absensi/updateAbsensi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
            clockIn: null,
            clockOut: clock_out,
            duration: totalHoursTIME,
            dateWork: null,
            salaryDay: null,
            statusLembur: statusLembur ?? null,
            validasiLembur: null,
            absensiId: dataAbsensi.data[0].absensiId,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        console.log("USER", data);
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
      } else {
        setError(data.message || "Gagal absen pulang.");
      }
    } catch (err) {
      console.error("Error absen pulang:", err);
      setError("Gagal mengirim data absen pulang. Periksa koneksi internet.");
    }
  };

  const handleCloseModal = () => {
    setShowModalContent(false);
    setTimeout(() => {
      setShowIzinModal(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-[390px] w-full flex flex-col items-center">
        <div className="flex justify-center mb-6">
          <img src={clockImage} alt="Clock" className="w-32 h-32" />
        </div>
        <h2 className="text-3xl sm:text-3xl font-bebas font-normal text-gray-800 tracking-wide mb-2 mt-4">
          TERIMA KASIH
        </h2>
        <p className="font-montserrat text-sm text-gray-600 text-center mb-6 max-w-xs">
          Kerja bagus! Terima kasih telah menyelesaikan pekerjaan anda selama,
        </p>
        <div className="bg-white rounded-2xl p-2 w-full mb-6 max-w-xs outline outline-2 outline-[#EEF1F7]">
          <p className="font-montserrat text-lg text-center text-gray-800">
            {workDuration.hours} Jam {workDuration.minutes} Menit{" "}
            {workDuration.seconds} Detik
          </p>
        </div>

        {/* 🔹 tombol hanya buka modal */}
        <AnimatedButton
          onClick={() => setShowConfirmLogout(true)}
          variant="red"
          className="max-w-xs w-full py-3 px-6 font-montserrat font-semibold rounded-2xl text-sm"
        >
          Absen Pulang
        </AnimatedButton>
      </div>

      {/* Modal alasan lembur */}
      {showIzinModal && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center p-4 z-50
              ${showModalContent ? "bg-opacity-60" : "bg-opacity-0"}`}
        >
          <div
            className={`bg-[#F8FCFF] rounded-3xl p-6 w-full max-w-[320px] mx-4 sm:mx-auto transform transition-all duration-300
                ${
                  showModalContent
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-full scale-150"
                }`}
          >
            <h2 className="font-bebas text-2xl mb-4 text-center">
              ALASAN LEMBUR
            </h2>
            <div>
              <textarea
                value={alasanIzin}
                onChange={(e) => setAlasanIzin(e.target.value)}
                placeholder="Alasan lembur"
                className="w-full h-24 p-3 rounded-2xl mb-4 font-montserrat resize-none bg-[#F8FCFF] outline outline-2 outline-[#EEF1F7] text-sm"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3">
              <AnimatedButton
                onClick={handleCloseModal}
                className="flex-1 py-3 px-4 rounded-xl text-sm hover:bg-gray-200 transition-colors font-semibold"
                variant="grey"
                disabled={isLoading}
              >
                Batal
              </AnimatedButton>
              <AnimatedButton
                onClick={handleSubmitIzin}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold"
                variant="red"
                disabled={isLoading}
              >
                {isLoading ? "Mengirim..." : "Kirim"}
              </AnimatedButton>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        onConfirm={() => {
          setShowConfirmLogout(false);
          handleSelesaiKerja(); // jalankan function
        }}
        title="Konfirmasi Absen Pulang"
        message="Apakah Anda yakin ingin mengakhiri pekerjaan dan absen pulang sekarang?"
      />
    </div>
  );
};

export default AbsenAkhir;

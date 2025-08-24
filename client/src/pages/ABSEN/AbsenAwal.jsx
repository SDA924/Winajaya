import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import absenImage from "../../assets/images/absen.png";
import absenSound from "../../assets/sound/absen.mp3";
import AnimatedButton from "../../components/Design/AnimatedButton";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

const Absensi = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlreadyAbsent, setIsAlreadyAbsent] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  // modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // audio
  const [audio] = useState(new Audio(absenSound));

  const OUTLET_LOCATION = [
    { lat: -7.930945915386587, lng: 112.62689965351042 },
    { lat: -6.796001, lng: 111.896492 },
    { lat: -6.797187209031785, lng: 111.87774215825094 },
  ];

  const ALLOWED_RADIUS = 1500;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (deg) => deg * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkLocation = () => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject("Browser Anda tidak mendukung geolocation.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          setUserLocation({ lat: userLat, lng: userLng });
          const isWithinRadius = OUTLET_LOCATION.some((outlet) => {
            const distance = calculateDistance(
              userLat,
              userLng,
              outlet.lat,
              outlet.lng
            );
            return distance <= ALLOWED_RADIUS;
          });

          if (isWithinRadius) resolve(true);
          else
            reject(
              `Anda harus berada dalam radius ${ALLOWED_RADIUS} meter dari salah satu outlet untuk melakukan absensi!`
            );
        },
        () => {
          reject(
            "Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan."
          );
        }
      );
    });
  };

  const handleHadir = async () => {
    setError("");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");

      // await checkLocation();

      if (!userData) {
        setError("Data user tidak ditemukan. Silakan login ulang.");
        setShowErrorModal(true);
        return;
      }

      const user = JSON.parse(userData);
      const employee_id = parseInt(user.userId);

      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const clock_in = now.toTimeString().slice(0, 8);

      if (!employee_id || isNaN(employee_id)) {
        setError("ID user tidak valid.");
        setShowErrorModal(true);
        return;
      }

      const res = await fetch(
        "https://winajaya-production.up.railway.app/api/absensi/insertAbsensi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: employee_id,
            clockIn: clock_in,
            clockOut: null,
            duration: null,
            dateWork: date,
            salaryDay: null,
            statusLembur: null,
            validasiLembur: null,
          }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        sessionStorage.setItem("fromPresent", "true");
        localStorage.setItem("workStartTime", new Date().toISOString());
        localStorage.setItem("currentAbsentId", data.data.userId);
        navigate("/loginSuccess");
      } else {
        setError("Gagal menyimpan data kehadiran.");
        setShowErrorModal(true);
      }
    } catch (err) {
      setError(err?.toString() || "Gagal mengirim data kehadiran.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setEmployeeId(user.userId);
      } else {
        setError("Data user tidak ditemukan. Silakan login ulang.");
        setIsAlreadyAbsent(true);
      }
    } catch {
      setError("Gagal membaca data user.");
      setIsAlreadyAbsent(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center items-center bg-white px-10 sm:px-0">
      <div className="w-full sm:w-[380px] p-8 my-auto bg-white rounded-3xl outline outline-2 outline-[#EEF1F7]">
        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <img src={absenImage} alt="Absen" className="w-32 h-32" />
        </div>

        <h1 className="font-bebas text-2xl text-gray-800 tracking-wide text-center mb-3">
          Konfirmasi kehadiran!
        </h1>
        <p className="font-montserrat text-sm text-gray-800 tracking-wide text-center mb-3">
          Pastikan Anda berada dalam radius 10 meter dari outlet!
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <AnimatedButton
            onClick={() => setShowConfirmModal(true)}
            className="font-semibold w-full py-3 px-4 rounded-xl text-sm"
            variant="red"
            disabled={isAlreadyAbsent || isLoading}
          >
            Saya Hadir
          </AnimatedButton>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          handleHadir();
        }}
        title="Konfirmasi Absensi"
        message="Apakah Anda yakin ingin melakukan absensi sekarang?"
      />

      {/* Modal Error */}
      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Gagal Absensi"
        message={error || "Terjadi kesalahan saat melakukan absensi."}
      />
    </div>
  );
};

export default Absensi;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AnimatedButton from "../../components/Design/AnimatedButton";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // untuk popup sukses

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak sama!");
      return;
    }

    try {
      const RegisterUrl =
        "https://winajaya-production.up.railway.app/api/karyawan/register";
      const response = await axios.post(
        RegisterUrl,
        {
          withCredentials: true,
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          role: "karyawan",
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setSuccess(true); // tampilkan pop up
        setTimeout(() => {
          setSuccess(false);
          navigate("/Dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error register:", error);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat register"
      );
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col justify-center items-center bg-white px-10 sm:px-0 overflow-y-auto">
      <div className="w-full sm:w-[380px] p-6 sm:p-8 my-auto bg-white rounded-3xl outline outline-2 outline-[#EEF1F7]">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bebas text-gray-800">
            Daftar Akun Karyawan
          </h2>
          <p className="mt-2 text-xs text-gray-600 font-montserrat">
            Silakan isi data Anda di bawah ini untuk membuat akun!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-montserrat">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* input fields... sama seperti sebelumnya */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">👤</span>
            </div>
            <input
              type="text"
              name="nama"
              id="nama"
              className="block w-full pl-12 pr-3 py-3 sm:py-3.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base placeholder:text-sm font-montserrat"
              placeholder="Masukan Nama Lengkap"
              value={formData.nama}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="text-gray-500 text-lg">@</span>
            </div>
            <input
              type="email"
              name="email"
              id="email"
              className="block w-full pl-12 pr-3 py-3 sm:py-3.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base placeholder:text-sm font-montserrat"
              placeholder="Masukan Email"
              value={formData.email}
              onChange={handleChange}
              required
              inputMode="email"
              autoCapitalize="none"
              autoComplete="email"
            />
          </div>
          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              className="placeholder:text-sm block w-full pl-12 pr-3 py-3 sm:py-3.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base font-montserrat"
              placeholder="Masukan Kata Sandi"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="password"
              name="confirmPassword"
              className="placeholder:text-sm block w-full pl-12 pr-3 py-3 sm:py-3.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base font-montserrat"
              placeholder="Konfirmasi Kata Sandi"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <AnimatedButton
            type="submit"
            className="w-full h-[40px] bg-gradient-to-r from-[#ffe2e5] to-[#ff5568] text-white rounded-xl font-montserrat font-semibold"
          >
            Daftar
          </AnimatedButton>
        </form>
      </div>

      {/* Success Popup */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold text-green-600">
              ✅ Register Berhasil!
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Anda akan diarahkan ke Dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;

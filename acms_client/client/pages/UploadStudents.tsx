import React, { useState } from "react";
import axios from "axios";

const UploadStudents = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage("");
      setErrors([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("acms-token");
      const res = await axios.post("/api/admin/students/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Check response for inserted count or errors
      if (res.data.errors && res.data.errors.length > 0) {
        setErrors(res.data.errors);
        setMessage("Some rows failed to upload");
      } else {
        setMessage(res.data.message || "Upload successful");
        setErrors([]);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Upload failed");
      setErrors([]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Upload Students CSV</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="border p-2 rounded"
      />
      <button
        onClick={handleUpload}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}

      {errors.length > 0 && (
        <div className="mt-2 text-red-600">
          <p>Errors:</p>
          <ul className="list-disc pl-5">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadStudents;

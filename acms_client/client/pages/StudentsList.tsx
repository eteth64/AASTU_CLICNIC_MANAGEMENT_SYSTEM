import React, { useState, useEffect } from 'react';

interface Student {
  university_id: string;
  first_name: string;
  last_name: string;
  program: string;
  year: string;
  email: string;
  phone: string;
  date_of_birth: string;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState<string>('');
  const [filtered, setFiltered] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered(students);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        students.filter(
          s =>
            s.university_id.toLowerCase().includes(q) ||
            s.first_name.toLowerCase().includes(q) ||
            s.last_name.toLowerCase().includes(q) ||
            s.program.toLowerCase().includes(q)
        )
      );
    }
  }, [query, students]);

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:4000/admin/students', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data: Student[] = await res.json();
      setStudents(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="student-list">
      <h2>Students</h2>
      <input
        type="text"
        placeholder="Search by ID, Name, Program"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="search-input"
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First</th>
            <th>Last</th>
            <th>Program</th>
            <th>Year</th>
            <th>Email</th>
            <th>Phone</th>
            <th>DOB</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.university_id}>
              <td>{s.university_id}</td>
              <td>{s.first_name}</td>
              <td>{s.last_name}</td>
              <td>{s.program}</td>
              <td>{s.year}</td>
              <td>{s.email}</td>
              <td>{s.phone}</td>
              <td>{s.date_of_birth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;

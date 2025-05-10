import "../../../styles/ocr/StudentList.css";
import React from 'react'
import { UserIcon, BookOpenIcon } from 'lucide-react'

const StudentList = ({ students }) => {
  if (students.length === 0) {
    return (
      <div className="studentlist-empty">
        <p className="studentlist-empty-text">No se encontraron estudiantes asociados</p>
      </div>
    )
  }

  return (
    <ul className="studentlist-container">
      {students.map((student) => (
        <li key={student.id} className="studentlist-item">
          <div className="studentlist-icon-circle">
            <UserIcon className="studentlist-user-icon" />
          </div>
          <div className="studentlist-info">
            <p className="studentlist-name">{student.name}</p>
            <div className="studentlist-grade">
              <BookOpenIcon className="studentlist-book-icon" />
              <p className="studentlist-grade-text">{student.grade}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default StudentList;
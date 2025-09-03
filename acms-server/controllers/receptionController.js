const ReceptionRequest = require('../models/ReceptionRequest');
const PatientHistory = require('../models/PatientHistory');
const StudentData = require('../models/Student')

const searchStudent = (req, res) => {
    const { studentId } = req.params;

    // Fetch student data
    StudentData.findById(studentId, (error, student) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch last reception request
        ReceptionRequest.findByStudentId(studentId, (error, lastRequest) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }

            // Fetch patient history
            PatientHistory.findByStudentId(studentId, (err, history) => {
                if (err) {
                    return res.status(500).json({ message: 'Server error' });
                }

                // Combine all data into one response
                res.json({
                    student,
                    lastRequest: lastRequest || null,
                    history: history || []
                });
            });
        });
    });
};

const createRequest = (req, res) => {
    const { student_id, priority_level, initial_notes } = req.body;
    const receptionist_id = req.user.user_id;

    if (!student_id || !priority_level) {
        return res.status(400).json({ message: 'Please provide student ID and priority level' });
    }

    ReceptionRequest.create({ student_id, receptionist_id, priority_level, initial_notes }, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(201).json({ message: 'Request created successfully', requestId: results.insertId });
    });
};


const fetchAnalytics = (req, res) => {
    // Fetch analytics data
    ReceptionRequest.getAnalytics((error, analytics) => {
        if (error) {
            console.log(error)
            return res.status(500).json({ message: 'Server error' });
        }

        res.json(analytics);
    });
};

module.exports = { searchStudent, createRequest, fetchAnalytics };
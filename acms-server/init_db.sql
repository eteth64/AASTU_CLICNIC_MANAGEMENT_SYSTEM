-- Create database if not exists
CREATE DATABASE IF NOT EXISTS acms_db;

USE acms_db;

-- Users/Staff Table

CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'admin',
        'reception',
        'doctor',
        'lab_technician',
        'nurse',
        'pharmacy'
    ) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    year_of_study INT,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reception Requests Table
CREATE TABLE IF NOT EXISTS reception_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) NOT NULL,
    receptionist_id INT NOT NULL,
    priority_level ENUM('low', 'medium', 'high', 'emergency') NOT NULL,
    initial_notes TEXT,
    status ENUM(
        'pending',
        'with_doctor',
        'with_lab',
        'with_nurse',
        'with_pharmacy',
        'completed'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (receptionist_id) REFERENCES users(user_id)
);

-- Patient History Table
CREATE TABLE IF NOT EXISTS patient_histories (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    doctor_id INT,
    complaint TEXT  ,
    diagnosis TEXT,
    treatment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES reception_requests(request_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- Lab Orders Table
CREATE TABLE IF NOT EXISTS lab_orders (
    order_id INT////// PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    doctor_id INT NOT NULL,
    lab_request TEXT NOT NULL,
    clinical_notes TEXT,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES reception_requests(request_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- Lab Results Table
CREATE TABLE IF NOT EXISTS lab_results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    technician_id INT,
    lab_result TEXT NOT NULL,
    technical_notes TEXT,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id),
    FOREIGN KEY (technician_id) REFERENCES users(user_id)
);

-- Prescription Requests Table
CREATE TABLE IF NOT EXISTS prescription_requests (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    doctor_id INT NOT NULL,
    status ENUM('pending', 'dispensed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES reception_requests(request_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);


-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    quantity INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    dispenser_role ENUM('nurse', 'pharmacy') NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS prescription_drugs (
    prescription_drug_id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity INT NOT NULL,
    dosage_instructions TEXT, -- Optional: for instructions like "Take 1 tablet daily"
    status ENUM('pending', 'dispensed') DEFAULT 'pending',
    FOREIGN KEY (prescription_id) REFERENCES prescription_requests(prescription_id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
);


-- Dispensing Records Table
CREATE TABLE IF NOT EXISTS dispensing_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_drug_id INT NOT NULL,
    dispenser_id INT NOT NULL,
    dispensed_quantity INT,
    dispensed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (prescription_drug_id) REFERENCES prescription_drugs(prescription_drug_id),
    FOREIGN KEY (dispenser_id) REFERENCES users(user_id)
);

-- Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity_change INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT
    IGNORE INTO users (first_name, last_name, email, password, role)
VALUES
    (
        'Admin',
        'User',
        'admin@clinic.com',
        '$2a$10$1m/QbiCL3mqjSxt/uIQ8/.O.vrbpcsVFaknAKB5jEJqSJtJVIM64K',
        'admin'
    ),
    (
        'Reception',
        'Staff',
        'reception@clinic.com',
        '$2a$10$Q7D4ZQKn6DPPBHzY84kFgenzo2M/1Vo4PViXhouDRdZzOXispRAOG',
        'reception'
    ),
    (
        'Doctor',
        'John',
        'doctor@clinic.com',
        '$2a$10$2/P6M7hlX5xZYisXiVJCveru6M5N4La2t/5zgXlSoE1y.eqa7Be8.',
        'doctor'
    ),
    (
        'Lab',
        'Technician',
        'lab@clinic.com',
        '$2a$10$2oJHQOIt1lygPHImvQYAMOnBqeUeDqAZZl4BdjVowg/8JBz7hPkcK',
        'lab_technician'
    ),
    (
        'Nurse',
        'Jane',
        'nurse@clinic.com',
        '$2a$10$mKcIyTgnZl49r69b8pg9p.QAfkR31FD8ktytPksSa2f8/XrXgs/SS',
        'nurse'
    ),
    (
        'Pharmacy',
        'Staff',
        'pharmacy@clinic.com',
        '$2a$10$nX88pQ1Ah9qqLT2.HiL91OnGzx0N.hbJcify7JSSlCXfb8WBac0sK',
        'pharmacy'
    );

-- Insert sample students
INSERT
    IGNORE INTO students (
        student_id,
        first_name,
        last_name,
        email,
        year_of_study,
        department
    )
VALUES
    (
        '001',
        'Simbo',
        'geleta',
        'simbo.gelta@aastu.edu',
        2,
        'Computer engineering'
    ),
    (
        '002',
        'Jane',
        'Smith',
        'jane.smith@aastu.edu',
        3,
        'checmical engineering'
    ),
    (
        '003',
        'Robert',
        'Johnson',
        'robert.johnson@aastu.edu',
        1,
        'mechanical engineering'
    ),
    (
        '004',
        'Sarah',
        'Williams',
        'sarah.williams@aastu.edu',
        4,
        'software engineering'
    ),
    (
        '005',
        'Michael',
        'Brown',
        'michael.brown@aastu.edu',
        2,
        'applied science'
    );

-- -- Insert sample reception requests
-- INSERT
--     IGNORE INTO reception_requests (
--         student_id,
--         receptionist_id,
--         priority_level,
--         initial_notes
--     )
-- VALUES
--     (
--         'STU001',
--         2,
--         'medium',
--         'Fever and cough for 3 days'
--     ),
--     (
--         'STU002',
--         2,
--         'high',
--         'Severe headache and nausea'
--     ),
--     ('STU003', 2, 'low', 'Routine checkup'),
--     (
--         'STU004',
--         2,
--         'emergency',
--         'Allergic reaction with difficulty breathing'
--     );

-- Insert sample inventory items
INSERT
    IGNORE INTO inventory (
        medicine_name,
        category,
        quantity,
        min_stock,
        dispenser_role,
        expiry_date
    )
VALUES
    (
        'Paracetamol',
        'Pain Relief',
        100,
        20,
        'nurse',
        '2024-12-31'
    ),
    (
        'Amoxicillin',
        'Antibiotic',
        50,
        15,
        'pharmacy',
        '2024-06-30'
    ),
    (
        'Ibuprofen',
        'Pain Relief',
        75,
        25,
        'nurse',
        '2025-03-31'
    ),
    (
        'Loratadine',
        'Allergy',
        30,
        10,
        'pharmacy',
        '2024-09-30'
    ),
    (
        'Bandages',
        'First Aid',
        200,
        50,
        'nurse',
        '2026-01-31'
    ),
    (
        'Antiseptic Solution',
        'First Aid',
        15,
        5,
        'nurse',
        '2024-08-31'
    );

-- Insert sample inventory transactions
INSERT
    IGNORE INTO inventory_transactions (
        inventory_id,
        user_id,
        transaction_type,
        quantity_change,
        reason
    )
VALUES
    (1, 1, 'in', 100, 'Initial stock'),
    (2, 1, 'in', 50, 'Initial stock'),
    (3, 1, 'in', 75, 'Initial stock'),
    (4, 1, 'in', 30, 'Initial stock'),
    (5, 1, 'in', 200, 'Initial stock'),
    (6, 1, 'in', 15, 'Initial stock');
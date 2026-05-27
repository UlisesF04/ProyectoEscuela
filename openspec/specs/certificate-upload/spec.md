## ADDED Requirements

### Requirement: Upload certificate file
The system SHALL allow parents, preceptors, and administrators to upload certificate files (JPG, PNG, PDF) up to 5MB to support absence justification (RN-08).

#### Scenario: Successful upload
- **WHEN** a parent sends POST /api/v1/certificates/upload with multipart/form-data containing a valid JPG/PNG/PDF file ≤ 5MB and `attendance_id`
- **THEN** the system stores the file, associates the URL with the attendance record, and returns HTTP 200 with the file URL

#### Scenario: Invalid file type
- **WHEN** a user uploads a file with MIME type other than image/jpeg, image/png, or application/pdf
- **THEN** the system returns HTTP 400 with message "El archivo debe ser JPG, PNG o PDF"

#### Scenario: File exceeds size limit
- **WHEN** a user uploads a file larger than 5MB
- **THEN** the system returns HTTP 400 with message "El archivo no debe superar los 5MB"

#### Scenario: No file attached
- **WHEN** a user sends POST /api/v1/certificates/upload without a file
- **THEN** the system returns HTTP 400 with message "Debe adjuntar un archivo"

### Requirement: Access control for certificate upload
The system SHALL allow parents to upload certificates only for their own children's attendance records (RN-03).

#### Scenario: Parent uploads for own child
- **WHEN** a padre uploads a certificate for an attendance record of their linked child
- **THEN** the system accepts the upload

#### Scenario: Parent uploads for non-linked child
- **WHEN** a padre uploads a certificate for an attendance record of a non-linked student
- **THEN** the system returns HTTP 403

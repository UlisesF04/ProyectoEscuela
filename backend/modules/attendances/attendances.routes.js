const { Router } = require('express');
const { body, param } = require('express-validator');
const attendancesController = require('./attendances.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const validationMiddleware = require('../../middlewares/validationMiddleware');
const attendancePermission = require('./attendancePermission');
const upload = require('../../config/multer');

const router = Router();

const createAttendanceValidations = [
  body('student_id')
    .notEmpty().withMessage('El ID del alumno es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del alumno debe ser un número entero positivo'),
  body('date')
    .notEmpty().withMessage('La fecha es obligatoria')
    .isDate().withMessage('La fecha no es válida (formato YYYY-MM-DD)'),
  body('status')
    .notEmpty().withMessage('El estado es obligatorio')
    .isIn(['presente', 'ausente', 'tarde']).withMessage('El estado debe ser: presente, ausente o tarde'),
];

const batchAttendanceValidations = [
  body('records')
    .notEmpty().withMessage('El campo records es obligatorio')
    .isArray({ min: 1 }).withMessage('records debe ser un array no vacío'),
  body('records.*.student_id')
    .notEmpty().withMessage('El ID del alumno es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del alumno debe ser un número entero positivo'),
  body('records.*.date')
    .notEmpty().withMessage('La fecha es obligatoria')
    .isDate().withMessage('La fecha no es válida (formato YYYY-MM-DD)'),
  body('records.*.status')
    .notEmpty().withMessage('El estado es obligatorio')
    .isIn(['presente', 'ausente', 'tarde']).withMessage('El estado debe ser: presente, ausente o tarde'),
];

const updateAttendanceValidations = [
  body('status')
    .optional()
    .isIn(['presente', 'ausente', 'tarde']).withMessage('El estado debe ser: presente, ausente o tarde'),
  body('student_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del alumno debe ser un número entero positivo'),
  body('date')
    .optional()
    .isDate().withMessage('La fecha no es válida (formato YYYY-MM-DD)'),
];

const justifyAttendanceValidations = [
  body('justification_note')
    .optional()
    .isString().withMessage('La nota de justificación debe ser un texto')
    .trim().escape(),
];

const idParamValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
];

const studentIdParamValidation = [
  param('studentId')
    .isInt({ min: 1 }).withMessage('El ID del estudiante debe ser un número entero positivo'),
];

router.post(
  '/',
  authMiddleware,
  roleMiddleware('preceptor', 'admin'),
  validationMiddleware(createAttendanceValidations),
  attendancesController.create
);

router.post(
  '/batch',
  authMiddleware,
  roleMiddleware('preceptor', 'admin'),
  validationMiddleware(batchAttendanceValidations),
  attendancesController.batchCreate
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('preceptor', 'admin'),
  validationMiddleware([...idParamValidation, ...updateAttendanceValidations]),
  attendancesController.update
);

router.put(
  '/:id/justify',
  authMiddleware,
  roleMiddleware('preceptor', 'admin'),
  validationMiddleware([...idParamValidation, ...justifyAttendanceValidations]),
  attendancesController.justify
);

router.get(
  '/courses/:courseId',
  authMiddleware,
  roleMiddleware('preceptor', 'admin', 'docente'),
  validationMiddleware([param('courseId').isInt({ min: 1 }).withMessage('El ID del curso debe ser un número entero positivo')]),
  attendancesController.getCourseAttendance
);

router.get(
  '/students/:studentId',
  authMiddleware,
  roleMiddleware('preceptor', 'admin', 'docente', 'padre'),
  validationMiddleware(studentIdParamValidation),
  attendancePermission('viewHistory'),
  attendancesController.getHistory
);

const uploadCertificateValidations = [
  body('attendance_id')
    .notEmpty().withMessage('El ID de asistencia es obligatorio')
    .isInt().withMessage('El ID de asistencia debe ser un número entero'),
];

router.post(
  '/certificates/upload',
  authMiddleware,
  roleMiddleware('preceptor', 'admin', 'padre'),
  validationMiddleware(uploadCertificateValidations),
  upload.single('certificate'),
  attendancesController.uploadCertificate
);

module.exports = router;

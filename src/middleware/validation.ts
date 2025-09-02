import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User registration validation
export const validateUserRegistration: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Παρακαλώ εισάγετε ένα έγκυρο email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα μικρό γράμμα, ένα κεφαλαίο γράμμα και έναν αριθμό'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Το όνομα πρέπει να έχει 2-50 χαρακτήρες')
    .matches(/^[α-ωΑ-Ωa-zA-Z\s]+$/)
    .withMessage('Το όνομα μπορεί να περιέχει μόνο γράμματα'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Το επώνυμο πρέπει να έχει 2-50 χαρακτήρες')
    .matches(/^[α-ωΑ-Ωa-zA-Z\s]+$/)
    .withMessage('Το επώνυμο μπορεί να περιέχει μόνο γράμματα'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage('Παρακαλώ εισάγετε ένα έγκυρο τηλέφωνο'),
  body('referralCode')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Ο κωδικός παραπομπής πρέπει να έχει 3-20 χαρακτήρες')
];

// User login validation
export const validateUserLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Παρακαλώ εισάγετε ένα έγκυρο email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Ο κωδικός είναι υποχρεωτικός')
];

// Profile update validation
export const validateProfileUpdate: ValidationChain[] = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Το όνομα πρέπει να έχει 2-50 χαρακτήρες')
    .matches(/^[α-ωΑ-Ωa-zA-Z\s]+$/)
    .withMessage('Το όνομα μπορεί να περιέχει μόνο γράμματα'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Το επώνυμο πρέπει να έχει 2-50 χαρακτήρες')
    .matches(/^[α-ωΑ-Ωa-zA-Z\s]+$/)
    .withMessage('Το επώνυμο μπορεί να περιέχει μόνο γράμματα'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage('Παρακαλώ εισάγετε ένα έγκυρο τηλέφωνο'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Παρακαλώ εισάγετε μια έγκυρη ημερομηνία'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Η διεύθυνση δεν μπορεί να υπερβαίνει τους 500 χαρακτήρες'),
  body('emergencyContactName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Το όνομα επικοινωνίας έκτακτης ανάγκης πρέπει να έχει 2-100 χαρακτήρες'),
  body('emergencyContactPhone')
    .optional()
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage('Παρακαλώ εισάγετε ένα έγκυρο τηλέφωνο επικοινωνίας έκτακτης ανάγκης')
];

// Password change validation
export const validatePasswordChange: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Ο τρέχων κωδικός είναι υποχρεωτικός'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Ο νέος κωδικός πρέπει να περιέχει τουλάχιστον ένα μικρό γράμμα, ένα κεφαλαίο γράμμα και έναν αριθμό'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Οι κωδικοί δεν ταιριάζουν');
      }
      return true;
    })
];

// Lesson booking validation
export const validateLessonBooking: ValidationChain[] = [
  body('lessonId')
    .isUUID()
    .withMessage('Μη έγκυρο ID μαθήματος'),
  body('lessonDate')
    .isISO8601()
    .withMessage('Παρακαλώ εισάγετε μια έγκυρη ημερομηνία')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        throw new Error('Δεν μπορείτε να κλείσετε μαθήματα για παρελθοντικές ή σημερινές ημερομηνίες');
      }
      return true;
    })
];

// Membership package purchase validation
export const validateMembershipPurchase: ValidationChain[] = [
  body('packageId')
    .isUUID()
    .withMessage('Μη έγκυρο ID πακέτου συνδρομής'),
  body('paymentMethod')
    .isIn(['card', 'cash', 'bank_transfer'])
    .withMessage('Μη έγκυρος τρόπος πληρωμής')
];

// Payment approval validation
export const validatePaymentApproval: ValidationChain[] = [
  body('paymentId')
    .isUUID()
    .withMessage('Μη έγκυρο ID πληρωμής'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Μη έγκυρο status πληρωμής'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Οι σημειώσεις δεν μπορούν να υπερβαίνουν τους 500 χαρακτήρες')
];

// Referral validation
export const validateReferral: ValidationChain[] = [
  body('referralCode')
    .isLength({ min: 3, max: 20 })
    .withMessage('Ο κωδικός παραπομπής πρέπει να έχει 3-20 χαρακτήρες')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Ο κωδικός παραπομπής μπορεί να περιέχει μόνο κεφαλαία γράμματα και αριθμούς')
];

// QR code validation
export const validateQRCode: ValidationChain[] = [
  body('qrCode')
    .notEmpty()
    .withMessage('Ο QR κωδικός είναι υποχρεωτικός')
    .isLength({ min: 10, max: 255 })
    .withMessage('Ο QR κωδικός πρέπει να έχει 10-255 χαρακτήρες')
];

// Pagination validation
export const validatePagination: ValidationChain[] = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Η σελίδα πρέπει να είναι θετικός ακέραιος'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Το όριο πρέπει να είναι 1-100')
];

// Date range validation
export const validateDateRange: ValidationChain[] = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Παρακαλώ εισάγετε μια έγκυρη αρχική ημερομηνία'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Παρακαλώ εισάγετε μια έγκυρη τελική ημερομηνία')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('Η τελική ημερομηνία πρέπει να είναι μετά την αρχική');
      }
      return true;
    })
];

// Search validation
export const validateSearch: ValidationChain[] = [
  body('query')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Η αναζήτηση πρέπει να έχει 2-100 χαρακτήρες'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Τα φίλτρα πρέπει να είναι αντικείμενο')
];

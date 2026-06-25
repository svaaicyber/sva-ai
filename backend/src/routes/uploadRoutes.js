import express from 'express';
import multer from 'multer';
import { handleDocumentUpload } from '../controllers/uploadController.js';

const router = express.Router();

// Memory storage use kar rahe hain taaki file disk pe save na karni pade, direct RAM se padh le
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/document', upload.single('file'), handleDocumentUpload);

export default router;
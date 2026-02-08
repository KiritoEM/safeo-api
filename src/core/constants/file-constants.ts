export const PDF_MIMETYPES = [
    'application/pdf',
];

export const IMAGE_MIMETYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/x-icon',
];

export const CSV_MIMETYPES = [
    'text/csv',
    'application/csv',
    'text/plain',
    'text/x-csv',
    'application/x-csv',
];

export const DOCUMENT_MIMETYPES = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'text/plain',
    'text/rtf',
    'application/rtf',
    'application/xml',
    'text/xml',
    'application/json',
    'text/markdown',
];

export const ALL_MIMETYPES = [
    ...PDF_MIMETYPES,
    ...IMAGE_MIMETYPES,
    ...DOCUMENT_MIMETYPES,
    ...CSV_MIMETYPES
];

export const AUTHORIZED_FILE_EXTENSION = /\.(pdf|png|jpe?g|gif|webp|csv|docx?|txt|json|md)$/i

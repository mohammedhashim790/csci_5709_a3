import type {Request, Response} from 'express';
import FileSchema from '../models/file.model.ts';
import {clearFileCache, getCachedFile} from "../cache/file.cache.ts";

/**
 * Creates a new file record in the database.
 *
 * @param req - Express request object containing file details in the body:
 *              doctorId: ID of the doctor creating the file
 *              patientId: ID of the patient the file belongs to
 *              name: Name of the file
 *              key: File key/identifier
 *              bucket: Storage bucket name
 *              fileType: Type of the file
 *              note: Additional notes about the file
 * @param res - Express response object
 * @returns Response with created file object or error message
 */
export const createFile = async (req: Request, res: Response) => {
    try {
        const {doctorId, patientId, name, key, bucket, fileType, note} = req.body;

        const file = new FileSchema({
            doctorId, patientId, name, key, bucket, fileType, note,
        });

        await file.save();
        /**
         * Clear cache everytime there's an update
         */
        clearFileCache();
        console.log(`File created for patient ${patientId} by doctor ${doctorId}`);

        res.status(201).json({message: 'File created successfully', file});
    } catch (error) {
        // @ts-ignore
        console.log('Error creating file:', error);
        res.status(500).json({message: 'One or more fields are missing'});
    }
};

/**
 * Retrieves files for a specific patient using caching.
 * Returns the 3 most recent files.
 *
 * @param req - Express request object with patientId in params
 * @param res - Express response object
 * @returns Response with array of patient files or error message
 */
export const getFilesByPatient = async (req: Request, res: Response) => {
    try {
        const {patientId} = req.params;

        const files = await getCachedFile(patientId);
        res.status(200).json({files});
    } catch (error) {
        // @ts-ignore
        console.log('Error fetching files:', error);
        res.status(500).json({message: 'Internal server error'});
    }
};

import mongoose, {Schema} from 'mongoose';

export interface IFile {
    name: string;
    bucket: string;
    key: string;
    patientId: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    note?: string;
    fileType: string;
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema = new Schema<IFile>({
    name: {type: String, required: true},
    bucket: {type: String, required: true},
    key: {type: String, required: true},
    // Indexing the field helps retrieve the data quickly by patientID
    patientId: {type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true},
    doctorId: {type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true},
    note: {type: String, required: false},
    fileType: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
})

export default mongoose.model<IFile>('File', FileSchema);

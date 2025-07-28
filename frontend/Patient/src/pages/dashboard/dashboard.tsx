import {useEffect, useRef, useState} from "react";
import {Calendar, Camera, LineChart, List, Mail, Phone, Pill,} from "lucide-react";
import {Button} from "./components/avatar/button";
import {Avatar, AvatarFallback, AvatarImage} from "./components/avatar/avatar";
import "./dashboard.css";
import type {PatientInformationResponseDto} from "shared-modules";
import {GetPatientAppointment} from "shared-modules";
import {getCurrentUser} from "shared-modules/src/user_auth/user_auth";
import {useNavigate} from "react-router-dom";

const appointmentApi = new GetPatientAppointment("http://localhost:3000/api");

export type Appointment = {
    _id: string; appointmentDate: string; status: string; token: string; doctorId: string; meetingId: {
        _id: string; token: string; scheduledTime: string;
    };
};

export type RawAppointment = Appointment & {
    patientId: string; createdAt: string; updatedAt: string; __v: number;
};

export default function PatientDashboard() {
    const user = getCurrentUser();
    const [patientInfo, setPatientInfo] = useState<PatientInformationResponseDto | null>(null);
    const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
    const patientId = user?.customId;
    const navigate = useNavigate();

    /**
     * Handles navigation to the meeting page when user clicks the Join button.
     * Requires an upcoming appointment to be available.
     * Navigates to the meeting page with meeting ID and token in the state.
     */
    const handleJoin = () => {
        if (!upcomingAppointment) return;

        console.log(upcomingAppointment);
        navigate("/meeting", {
            state: {
                meetingId: upcomingAppointment.meetingId._id, token: upcomingAppointment.token,
            },
        });
    };

    /**
     * Cache implementation using useRef for storing appointment data
     * Cache structure contains:
     * - data: The appointment data
     * - expiry: Timestamp when cache expires
     */
    const cache = useRef<{
        data: any; expiry: number;
    } | null>(null);

    useEffect(() => {


        /**
         * Fetches appointments data with caching strategy:
         * 1. Checks if cached data exists and is still valid (not expired)
         * 2. If valid cache exists, uses cached data
         * 3. If no cache or expired, fetches fresh data from API
         * 4. Caches new data for 5 minutes (300000 ms)
         */
        const fetchAppointments = async () => {
            if (cache.current && Date.now() < cache.current.expiry) {
                const {data} = cache.current;
                setPatientInfo(data);
                processAppointments(data);
                return;
            }
            try {
                const data = await appointmentApi.getAllPatientAppointment(patientId);
                // The data will be cached for 5 minutes.
                cache.current = {
                    data, expiry: Date.now() + 300000,
                };
                setPatientInfo(data);
                processAppointments(data);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            }
        };

        /**
         * Processes appointments data to:
         * 1. Filter future appointments
         * 2. Sort by appointment date
         * 3. Set the next upcoming appointment
         */
        const processAppointments = (data) => {
            const now = new Date();
            const futureAppointments = (data.appointments as RawAppointment[]).filter((a) => new Date(a.appointmentDate) > now);
            const sortedAppointments = futureAppointments.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
            const nextAppointment = sortedAppointments[0] ?? null;
            if (nextAppointment) {
                setUpcomingAppointment({
                    _id: nextAppointment._id,
                    appointmentDate: nextAppointment.appointmentDate,
                    status: nextAppointment.status,
                    token: nextAppointment.token,
                    doctorId: nextAppointment.doctorId,
                    meetingId: nextAppointment.meetingId,
                });
            } else {
                setUpcomingAppointment(null);
            }
        };
        fetchAppointments();
    }, [patientId]);

    const dateObj = upcomingAppointment ? new Date(upcomingAppointment.appointmentDate) : null;
    const formattedDate = dateObj?.toLocaleDateString("en-CA", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
    const formattedTime = dateObj?.toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit",
    });

    return (<div className="p-4 md:p-6 lg:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
            Hello, {user?.firstName} {user?.lastName}!
        </h2>

        <div className="mb-6">
            <div className="patient-profile-section">
                <div className="patient-card">
                    <div className="patient-header">
                        <div className="patient-avatar">
                            <img src="/placeholder.svg?height=80&width=80" alt="Patient" className="avatar-image"/>
                        </div>
                        <div className="patient-basic-info">
                            <h3 className="patient-name">
                                {user?.firstName} {user?.lastName}
                            </h3>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <Phone size={14}/>
                                    <span>{user?.phone}</span>
                                </div>
                                <div className="contact-item">
                                    <Mail size={14}/>
                                    <span>{user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <Pill size={20} className="text-orange-500"/>
                    <h3 className="text-lg font-semibold text-gray-800">My Medications</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                    <span className="text-left">Paracetamol</span>
                    <span className="text-right">Twice a day</span>
                    <span className="text-left">Sinerest</span>
                    <span className="text-right">Once a day</span>
                    <span className="text-left">Tusq</span>
                    <span className="text-right">Twice a day</span>
                </div>
            </div>

            <div className="card flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Camera size={20} className="text-gray-500"/>
                        <h3 className="text-lg font-semibold text-gray-800">Recent Bills</h3>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Dr. Drake"/>
                                <AvatarFallback>DD</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-gray-800">Dr. Drake</p>
                                <p className="text-xs text-gray-500">08/09/2025</p>
                            </div>
                        </div>
                        <span className="text-lg font-semibold text-gray-800">$210</span>
                    </div>
                </div>
                <Button
                    className="carebridge-primary-btn cursor-pointer w-full text-white font-semibold py-2 rounded-md">
                    Pay
                </Button>
            </div>

            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <LineChart size={20} className="text-gray-500"/>
                    <h3 className="text-lg font-semibold text-gray-800">BioMarkers</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <p className="text-blue-600 text-sm font-medium">Heart Rate</p>
                        <p className="text-lg font-bold text-gray-800">60bpm</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-blue-600 text-sm font-medium">Height</p>
                        <p className="text-lg font-bold text-gray-800">5' 8"</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-blue-600 text-sm font-medium">Weight</p>
                        <p className="text-lg font-bold text-gray-800">70kgs</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-blue-600 text-sm font-medium">Blood</p>
                        <p className="text-lg font-bold text-gray-800">O+</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {upcomingAppointment && (<div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={20} className="text-gray-500"/>
                    <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointment</h3>
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Doctor"/>
                        <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800">Dr. Drake</p>
                        <p className="text-blue-600 text-sm font-medium">Physician</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-sm">
                    <div>
                        <p className="font-semibold text-gray-600 mb-1">Date</p>
                        <p className="text-gray-800">{formattedDate}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-600 mb-1">Time</p>
                        <p className="text-gray-800">{formattedTime}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-600 mb-1">Location</p>
                        <p className="text-gray-800">{patientInfo?.patient.address.street}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleJoin}
                            className="carebridge-primary-btn cursor-pointer flex-1 text-white font-semibold py-2 rounded-md">
                        Join
                    </Button>
                    <Button
                        variant="outline"
                        className="carebridge-outline-btn cursor-pointer flex-1 font-semibold py-2 rounded-md bg-transparent">
                        Cancel
                    </Button>
                </div>
            </div>)}

            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <List size={20} className="text-gray-500"/>
                    <h3 className="text-lg font-semibold text-gray-800">Recent Updates</h3>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[200px] scrollable-container pr-2">
                    {/* Add updates here */}
                </div>
            </div>
        </div>
    </div>);
}

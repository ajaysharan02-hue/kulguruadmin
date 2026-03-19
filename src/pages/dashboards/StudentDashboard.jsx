import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    FaUserGraduate,
    FaBook,
    FaCalendarCheck,
    FaTrophy,
    FaChartLine,
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StudentDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    // Mock data - replace with actual API calls
    const stats = [
        {
            title: 'Attendance',
            value: '92.5%',
            icon: FaCalendarCheck,
            color: 'bg-green-500',
            change: '+2.5%',
        },
        {
            title: 'Average Grade',
            value: 'A-',
            icon: FaTrophy,
            color: 'bg-yellow-500',
            change: '+0.5',
        },
        {
            title: 'Assignments',
            value: '8/10',
            icon: FaBook,
            color: 'bg-blue-500',
            change: '2 pending',
        },
        {
            title: 'Rank',
            value: '#12',
            icon: FaChartLine,
            color: 'bg-purple-500',
            change: 'in class',
        },
    ];

    const attendanceData = [
        { month: 'Jan', percentage: 90 },
        { month: 'Feb', percentage: 94 },
        { month: 'Mar', percentage: 91 },
        { month: 'Apr', percentage: 95 },
        { month: 'May', percentage: 93 },
        { month: 'Jun', percentage: 92 },
    ];

    const gradesData = [
        { subject: 'Math', grade: 85 },
        { subject: 'Science', grade: 92 },
        { subject: 'English', grade: 88 },
        { subject: 'History', grade: 90 },
        { subject: 'Geography', grade: 87 },
    ];

    const upcomingExams = [
        { subject: 'Mathematics', date: '2026-02-15', time: '10:00 AM' },
        { subject: 'Science', date: '2026-02-17', time: '10:00 AM' },
        { subject: 'English', date: '2026-02-20', time: '10:00 AM' },
    ];

    const recentAssignments = [
        { title: 'Math Homework - Chapter 5', subject: 'Mathematics', dueDate: '2026-02-05', status: 'pending' },
        { title: 'Science Project', subject: 'Science', dueDate: '2026-02-08', status: 'submitted' },
        { title: 'English Essay', subject: 'English', dueDate: '2026-02-10', status: 'pending' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-600 mt-1">Here's your academic progress</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="card card-hover fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                    {stat.value}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                            </div>
                            <div className={`${stat.color} p-4 rounded-full`}>
                                <stat.icon className="text-3xl text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Attendance Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="Attendance %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject Grades */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Subject Performance
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={gradesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="grade" fill="#3b82f6" name="Grade %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Exams */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Upcoming Exams
                    </h3>
                    <div className="space-y-3">
                        {upcomingExams.map((exam, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{exam.subject}</p>
                                    <p className="text-sm text-gray-600">{exam.time}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-blue-600">{exam.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Assignments */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Assignments
                    </h3>
                    <div className="space-y-3">
                        {recentAssignments.map((assignment, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{assignment.title}</p>
                                    <p className="text-sm text-gray-600">{assignment.subject}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Due: {assignment.dueDate}</p>
                                    <span
                                        className={`badge ${assignment.status === 'submitted'
                                                ? 'badge-success'
                                                : 'badge-warning'
                                            }`}
                                    >
                                        {assignment.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

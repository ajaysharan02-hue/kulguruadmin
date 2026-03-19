import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    FaUserGraduate,
    FaCalendarCheck,
    FaBook,
    FaClipboardList,
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TeacherDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    // Mock data - replace with actual API calls
    const stats = [
        {
            title: 'My Students',
            value: '156',
            icon: FaUserGraduate,
            color: 'bg-blue-500',
            change: '3 classes',
        },
        {
            title: 'Attendance Today',
            value: '94.2%',
            icon: FaCalendarCheck,
            color: 'bg-green-500',
            change: '147/156 present',
        },
        {
            title: 'Pending Assignments',
            value: '12',
            icon: FaClipboardList,
            color: 'bg-yellow-500',
            change: 'To be graded',
        },
        {
            title: 'Subjects',
            value: '3',
            icon: FaBook,
            color: 'bg-purple-500',
            change: 'Teaching',
        },
    ];

    const classAttendance = [
        { class: 'Class 10-A', present: 35, absent: 3 },
        { class: 'Class 10-B', present: 38, absent: 2 },
        { class: 'Class 9-A', present: 40, absent: 4 },
    ];

    const myClasses = [
        { name: 'Class 10-A', subject: 'Mathematics', students: 38, time: '9:00 AM - 10:00 AM' },
        { name: 'Class 10-B', subject: 'Mathematics', students: 40, time: '10:00 AM - 11:00 AM' },
        { name: 'Class 9-A', subject: 'Algebra', students: 44, time: '11:30 AM - 12:30 PM' },
    ];

    const pendingTasks = [
        { task: 'Grade Math Test - Class 10-A', deadline: '2026-02-03', priority: 'high' },
        { task: 'Prepare Science Quiz', deadline: '2026-02-05', priority: 'medium' },
        { task: 'Submit Monthly Report', deadline: '2026-02-07', priority: 'high' },
        { task: 'Parent-Teacher Meeting', deadline: '2026-02-10', priority: 'medium' },
    ];

    const recentActivities = [
        { action: 'Marked attendance for Class 10-A', time: '2 hours ago' },
        { action: 'Graded assignments for Class 10-B', time: '5 hours ago' },
        { action: 'Posted homework for Class 9-A', time: '1 day ago' },
        { action: 'Updated exam schedule', time: '2 days ago' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, Teacher!
                </h1>
                <p className="text-gray-600 mt-1">Here's your teaching overview for today</p>
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

            {/* Charts and Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Attendance */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Today's Class Attendance
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={classAttendance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="class" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="present" fill="#10b981" name="Present" />
                            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* My Classes */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        My Classes Today
                    </h3>
                    <div className="space-y-3">
                        {myClasses.map((classItem, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{classItem.name}</p>
                                    <p className="text-sm text-gray-600">{classItem.subject}</p>
                                    <p className="text-xs text-gray-500 mt-1">{classItem.time}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-blue-600">
                                        {classItem.students} students
                                    </p>
                                    <button className="text-xs text-blue-600 hover:underline mt-1">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Tasks */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Pending Tasks
                    </h3>
                    <div className="space-y-3">
                        {pendingTasks.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                                    <div>
                                        <p className="font-medium text-gray-900">{item.task}</p>
                                        <p className="text-sm text-gray-600">Due: {item.deadline}</p>
                                    </div>
                                </div>
                                <span
                                    className={`badge ${item.priority === 'high' ? 'badge-danger' : 'badge-warning'
                                        }`}
                                >
                                    {item.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Activities
                    </h3>
                    <div className="space-y-3">
                        {recentActivities.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.action}
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <FaCalendarCheck className="text-3xl text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">
                            Mark Attendance
                        </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <FaClipboardList className="text-3xl text-green-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">
                            Grade Assignments
                        </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                        <FaBook className="text-3xl text-yellow-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">
                            Post Homework
                        </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <FaUserGraduate className="text-3xl text-purple-600 mb-2" />
                        <span className="text-sm font-medium text-gray-900">
                            View Students
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAttendance } from '@/lib/hooks/use-attendance'
import { 
  Clock, 
  MapPin, 
  History, 
  Calendar as CalendarIcon,
  Play,
  Square,
  BadgeCheck,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function TimeTrackingPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { 
    attendance, 
    isLoading, 
    clockIn, 
    isClockingIn, 
    clockOut, 
    isClockingOut, 
    todayRecord 
  } = useAttendance()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isClockedIn = !!todayRecord && !todayRecord.checkOut

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Time Tracking</h1>
          <p className="text-gray-500 mt-1">Manage your daily attendance and work hours.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <CalendarIcon className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-semibold text-gray-700">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clock In/Out Section */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock className="w-32 h-32" />
          </div>
          <CardHeader className="relative z-10 border-white/10">
            <CardTitle className="text-white/80 text-sm font-medium uppercase tracking-widest">Ongoing Session</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-8 py-6">
            <div className="text-center">
              <div className="text-5xl font-bold tracking-tighter mb-2">
                {format(currentTime, 'hh:mm:ss')}
                <span className="text-2xl ml-1 opacity-70">{format(currentTime, 'aa')}</span>
              </div>
              <p className="text-violet-100/60 text-sm">Real-time Clock</p>
            </div>

            <div className="space-y-4">
              {!isClockedIn ? (
                <Button 
                  onClick={() => clockIn()}
                  disabled={isClockingIn}
                  className="w-full h-14 bg-white text-violet-600 hover:bg-violet-50 font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-lg"
                >
                  {isClockingIn ? 'Processing...' : (
                    <>
                      <Play className="w-5 h-5 mr-3 fill-current" />
                      Clock In Now
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => clockOut(todayRecord._id)}
                  disabled={isClockingOut}
                  className="w-full h-14 bg-red-400/20 hover:bg-red-400/30 border border-red-200/50 text-white font-bold rounded-2xl transition-all active:scale-95 text-lg backdrop-blur-md"
                >
                  {isClockingOut ? 'Processing...' : (
                    <>
                      <Square className="w-5 h-5 mr-3 fill-current" />
                      Clock Out
                    </>
                  )}
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/5 text-center">
                  <p className="text-xs text-violet-100/60 mb-1">Check In</p>
                  <p className="font-semibold">{todayRecord?.checkIn ? format(new Date(todayRecord.checkIn), 'hh:mm aa') : '--:--'}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/5 text-center">
                  <p className="text-xs text-violet-100/60 mb-1">Worked</p>
                  <p className="font-semibold">{todayRecord?.hoursWorked ? `${todayRecord.hoursWorked}h` : '0h'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Statistics/History */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <History className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <CardTitle>Attendance History</CardTitle>
                <p className="text-sm text-gray-500 font-normal">Your recent activities</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400">Loading records...</div>
            ) : attendance?.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No attendance records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Worked Hours</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendance?.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.checkIn ? format(new Date(record.checkIn), 'hh:mm aa') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.checkOut ? format(new Date(record.checkOut), 'hh:mm aa') : (
                            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                          {record.hoursWorked ? `${record.hoursWorked} hrs` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            record.status === 'present' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          )}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Daily Hours</p>
            <p className="text-xl font-bold text-gray-900">8.2 hrs</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Late Arrivals</p>
            <p className="text-xl font-bold text-gray-900">2 days</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Primary Location</p>
            <p className="text-xl font-bold text-gray-900">Head Office</p>
          </div>
        </div>
      </div>
    </div>
  )
}

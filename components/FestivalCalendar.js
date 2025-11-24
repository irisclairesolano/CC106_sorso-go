"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarDays, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"

export default function FestivalCalendar({ festivals }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedFestival, setSelectedFestival] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get festivals for current month
  const currentMonthFestivals = festivals.filter((festival) => {
    const festivalDate = new Date(festival.start_date)
    return isSameMonth(festivalDate, currentDate)
  })

  // Group festivals by date
  const festivalsByDate = currentMonthFestivals.reduce((acc, festival) => {
    const date = new Date(festival.start_date).toISOString().split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(festival)
    return acc
  }, {})

  const handleDateClick = (date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dayFestivals = festivalsByDate[dateStr] || []
    if (dayFestivals.length > 0) {
      setSelectedFestival(dayFestivals[0])
      setIsModalOpen(true)
    }
  }

  const handleFestivalClick = (festival) => {
    setSelectedFestival(festival)
    setIsModalOpen(true)
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = monthStart.getDay()

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {/* Days of the month */}
            {daysInMonth.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd")
              const dayFestivals = festivalsByDate[dateStr] || []
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-1 rounded-md transition-colors ${
                    dayFestivals.length > 0
                      ? "bg-primary/10 hover:bg-primary/20 border border-primary/30"
                      : "hover:bg-muted"
                  } ${isToday ? "ring-2 ring-primary" : ""}`}
                  aria-label={`${format(day, "MMMM d, yyyy")}${dayFestivals.length > 0 ? ` - ${dayFestivals.length} festival(s)` : ""}`}
                >
                  <div className="text-sm font-medium">{format(day, "d")}</div>
                  {dayFestivals.length > 0 && (
                    <div className="text-xs text-primary font-semibold mt-1">{dayFestivals.length}</div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Festivals List for Current Month */}
          {currentMonthFestivals.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-lg mb-3">Festivals This Month</h3>
              {currentMonthFestivals.map((festival) => (
                <div
                  key={festival.id}
                  onClick={() => handleFestivalClick(festival)}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {festival.image_url && (
                      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={festival.image_url}
                          alt={festival.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-1">{festival.name}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {new Date(festival.start_date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {festival.end_date &&
                              ` - ${new Date(festival.end_date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}`}
                          </span>
                        </div>
                        {festival.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{festival.location}</span>
                          </div>
                        )}
                      </div>
                      {festival.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{festival.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentMonthFestivals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No festivals scheduled for this month.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Festival Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFestival && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedFestival.name}</DialogTitle>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {new Date(selectedFestival.start_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {selectedFestival.end_date &&
                        ` - ${new Date(selectedFestival.end_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}`}
                    </span>
                  </div>
                  {selectedFestival.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedFestival.location}</span>
                    </div>
                  )}
                </div>
              </DialogHeader>
              {selectedFestival.image_url && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden mt-4">
                  <Image
                    src={selectedFestival.image_url}
                    alt={selectedFestival.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {selectedFestival.description && (
                <div className="mt-4">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedFestival.description}
                  </p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}


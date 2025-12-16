import { useState, type JSX } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
} from "date-fns";

type Holiday = {
  date: string;
  name: string;
  type: string;
  icon: JSX.Element;
};

function getHolidays(year: number): Holiday[] {
  return [
    // Sri Lanka Public Holidays 2026
    {
      date: `${year}-01-03`,
      name: "Duruthu Full Moon Poya Day",
      type: "sri-lanka",
      icon: (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      date: `${year}-01-15`,
      name: "Tamil Thai Pongal Day",
      type: "sri-lanka",
      icon: (
        <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      ),
    },
    {
      date: `${year}-02-04`,
      name: "Independence Day (Sri Lanka)",
      type: "national",
      icon: (
        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4h14v16H5z" />
        </svg>
      ),
    },
    {
      date: `${year}-04-14`,
      name: "Sinhala & Tamil New Year",
      type: "sri-lanka",
      icon: (
        <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.5 7H18l-5.5 4L15 20l-3-7-3 7 2.5-7L6 9h2.5L12 2z" />
        </svg>
      ),
    },
    {
      date: `${year}-05-01`,
      name: "Vesak Full Moon Poya & May Day",
      type: "sri-lanka",
      icon: (
        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="6" />
        </svg>
      ),
    },
    {
      date: `${year}-08-26`,
      name: "Milad‑Un‑Nabi",
      type: "sri-lanka",
      icon: (
        <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.5 4.5h4.5L15 9l1.5 4.5L12 11l-4.5 2.5L9 9 5.5 6.5h4.5z" />
        </svg>
      ),
    },
    {
      date: `${year}-11-08`,
      name: "Deepavali (Diwali)",
      type: "sri-lanka",
      icon: (
        <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14.93V20h-2v-3.07a7.97 7.97 0 01-4.93-2.8l1.5-1.5A6 6 0 0012 16a6 6 0 003.43-1.44l1.5 1.5a7.97 7.97 0 01-3.93 1.87z" />
        </svg>
      ),
    },
    {
      date: `${year}-12-25`,
      name: "Christmas Day (Sri Lanka)",
      type: "christian",
      icon: (
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
        </svg>
      ),
    },

    // U.S. Federal Holidays 2026
    {
      date: `${year}-01-01`,
      name: "New Year's Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      date: `${year}-01-19`,
      name: "Martin Luther King Jr. Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 00-7.07 17.07L12 22l7.07-2.93A10 10 0 0012 2z" />
        </svg>
      ),
    },
    {
      date: `${year}-02-16`,
      name: "Presidents' Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-red-700" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      ),
    },
    {
      date: `${year}-05-25`,
      name: "Memorial Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l8 20H4L12 2z" />
        </svg>
      ),
    },
    {
      date: `${year}-06-19`,
      name: "Juneteenth (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      date: `${year}-07-03`,
      name: "Independence Day (Observed, USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2 4h20v4H2zm0 8h20v4H2z" />
        </svg>
      ),
    },
    {
      date: `${year}-09-07`,
      name: "Labor Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="3" />
        </svg>
      ),
    },
    {
      date: `${year}-10-12`,
      name: "Columbus Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l8 8-8 8-8-8z" />
        </svg>
      ),
    },
    {
      date: `${year}-11-11`,
      name: "Veterans Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-blue-800" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
    },
    {
      date: `${year}-11-26`,
      name: "Thanksgiving Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-yellow-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v16H4z" />
        </svg>
      ),
    },
    {
      date: `${year}-12-25`,
      name: "Christmas Day (USA)",
      type: "usa",
      icon: (
        <svg className="w-5 h-5 text-red-700" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
        </svg>
      ),
    },
  ];
}


type HolidayCalendarModalProps = {
  show: boolean;
  onClose: () => void;
};

export default function HolidayCalendarModal({ show, onClose }: HolidayCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const holidays = getHolidays(currentDate.getFullYear());

  if (!show) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows: JSX.Element[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const isInMonth = day >= monthStart && day <= monthEnd;
      const holiday = holidays.find((h) => isSameDay(new Date(h.date), day));
      const formattedDate = format(day, "d");

      rows.push(
        <div
            key={day.toString()}
            className={`h-20 p-1 border rounded-lg flex flex-col items-center justify-center
            ${!isInMonth ? "bg-gray-100 opacity-50" : isToday(day) ? "bg-yellow-200" : "bg-white"}
            `}
        >
            <span className="text-sm font-medium">{formattedDate}</span>
            {holiday && <span title={holiday.name}>{holiday.icon}</span>}
        </div>
      );


      day = addDays(day, 1);
    }
  }

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            ← Prev
          </button>
          <h2 className="text-2xl font-bold text-gray-700">{format(currentDate, "MMMM yyyy")}</h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            Next →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-gray-600">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-2">{rows}</div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold"
        >
          Close Calendar
        </button>
      </div>
    </div>
  );
}

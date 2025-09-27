import React, { useState } from 'react';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, UtensilsIcon, ImageIcon } from 'lucide-react';
import { usePantry } from '../contexts/PantryContext';
interface CalendarProps {
  onBack: () => void;
}
export function Calendar({
  onBack
}: CalendarProps) {
  const {
    cookingHistory
  } = usePantry();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  // Get number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Get day of week of first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Create array of days for the calendar
  const calendarDays = Array.from({
    length: 42
  }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return dayNumber;
    }
    return null;
  });
  // Format date to YYYY-MM-DD for comparison
  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  // Check if a day has cooking history
  const hasCookingHistory = (day: number | null) => {
    if (!day) return false;
    const dateString = formatDateString(currentYear, currentMonth, day);
    return cookingHistory.some(item => item.date === dateString);
  };
  // Get cooking history for selected date
  const getHistoryForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateString = formatDateString(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return cookingHistory.filter(item => item.date === dateString);
  };
  // Group history by meal type
  const getHistoryByMealType = () => {
    const history = getHistoryForSelectedDate();
    return {
      breakfast: history.filter(item => item.type === 'breakfast'),
      lunch: history.filter(item => item.type === 'lunch'),
      dinner: history.filter(item => item.type === 'dinner'),
      snack: history.filter(item => item.type === 'snack')
    };
  };
  // Navigation functions
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };
  const handleDayClick = (day: number | null) => {
    if (!day) return;
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };
  // Month names for header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // Day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Get meal type color
  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'lunch':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'dinner':
        return 'bg-red-50 border-red-100 text-red-700';
      case 'snack':
        return 'bg-green-50 border-green-100 text-green-700';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-700';
    }
  };
  const getMealTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  return <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
          <h1 className="text-xl font-bold">Cooking Calendar</h1>
          <div className="w-10"></div> {/* For layout balance */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-5">
        {/* Calendar Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center">
            <button onClick={previousMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-700" aria-label="Previous month">
              <ChevronLeftIcon size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-700" aria-label="Next month">
              <ChevronRightIcon size={24} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mt-6">
            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(day => <div key={day} className="text-center font-medium text-gray-500 py-2">
                  {day}
                </div>)}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
              const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
              const isSelected = selectedDate && day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear();
              const hasHistory = hasCookingHistory(day);
              // Get meal types for this day
              const dateString = day ? formatDateString(currentYear, currentMonth, day) : '';
              const dayMeals = day ? cookingHistory.filter(item => item.date === dateString) : [];
              const hasMealTypes = {
                breakfast: dayMeals.some(meal => meal.type === 'breakfast'),
                lunch: dayMeals.some(meal => meal.type === 'lunch'),
                dinner: dayMeals.some(meal => meal.type === 'dinner'),
                snack: dayMeals.some(meal => meal.type === 'snack')
              };
              return <div key={index} onClick={() => handleDayClick(day)} className={`
                      h-20 p-1 relative flex flex-col 
                      ${day ? 'cursor-pointer hover:bg-gray-50' : ''}
                      ${isSelected ? 'bg-gray-100 border border-gray-200' : day ? 'border border-gray-100' : ''}
                      ${isToday ? 'font-bold border-red-300' : ''}
                      rounded-lg transition-colors duration-200
                    `}>
                    {day && <>
                        <span className="text-sm ml-1 mt-1">{day}</span>
                        <div className="flex flex-col gap-1 mt-auto mb-1">
                          {hasMealTypes.breakfast && <div className="h-1.5 bg-blue-500 rounded-full mx-1"></div>}
                          {hasMealTypes.lunch && <div className="h-1.5 bg-amber-500 rounded-full mx-1"></div>}
                          {hasMealTypes.dinner && <div className="h-1.5 bg-red-500 rounded-full mx-1"></div>}
                          {hasMealTypes.snack && <div className="h-1.5 bg-green-500 rounded-full mx-1"></div>}
                        </div>
                      </>}
                  </div>;
            })}
            </div>
          </div>
        </div>

        {/* Selected Date History */}
        {selectedDate && <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
            </h3>
            {getHistoryForSelectedDate().length > 0 ? <div>
                <div className="flex items-center mb-3 space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Breakfast</span>
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Lunch</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Dinner</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Snack</span>
                </div>
                {Object.entries(getHistoryByMealType()).map(([type, meals]) => {
            if (meals.length === 0) return null;
            return <div key={type} className="mb-6 last:mb-0">
                      <h4 className="text-md font-medium text-gray-700 mb-3">
                        {getMealTypeLabel(type)}:
                      </h4>
                      <div className="space-y-3">
                        {meals.map((item, index) => <div key={index} className={`p-4 rounded-lg border ${getMealTypeColor(type)}`}>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${type === 'breakfast' ? 'bg-blue-500' : type === 'lunch' ? 'bg-amber-500' : type === 'dinner' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                              <p className="font-medium text-gray-800">
                                {item.recipeName}
                              </p>
                              {item.image && <div className="ml-auto">
                                  <ImageIcon size={18} className="text-gray-400" />
                                </div>}
                            </div>
                          </div>)}
                      </div>
                    </div>;
          })}
              </div> : <div className="text-center py-6">
                <p className="text-gray-500">
                  No meals recorded for this date.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Cook something delicious today!
                </p>
              </div>}
          </div>}
      </main>
    </div>;
}
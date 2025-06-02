import { useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '@/context/Context.jsx';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiRequest from '@/ApiRequest';
import { Calendar } from "@/components/ui/calendar";

const apiUrl = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/api/users`;

// Placeholder for Check icon
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const YourCalendar = () => {
  const { userData, isLoading, getUserData, authUser, formatDateToLocalYYYYMMDD } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksForSelectedDay, setTasksForSelectedDay] = useState([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  // Calculate dates with tasks for calendar highlighting
  const [datesWithTasks, setDatesWithTasks] = useState([]);

  // Define styles for DayPicker
  const calendarStyles = {
    selected: {
      backgroundColor: '#000000', // Placeholder for primary color
    },
    today: {
      backgroundColor: '#000000', // Placeholder for primary (as per your text-foreground for today)
      // If you want a different color for today's background, like accent:
      // backgroundColor: '#ffc107', // Placeholder for accent color
    }
    // Add other states like 'outside' if their backgrounds also need inline styling
  };

  useEffect(() => {
    if (userData && userData.tasks) {
      const taskDates = userData.tasks.reduce((acc, task) => {
        const taskDate = new Date(task.date);
        // Normalize date to avoid time zone issues in comparison
        const normalizedDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        if (!acc.find(d => d.getTime() === normalizedDate.getTime())) {
          acc.push(normalizedDate);
        }
        return acc;
      }, []);
      setDatesWithTasks(taskDates);

      // Filter tasks for the initially selected day (today)
      const filteredTasks = userData.tasks.filter(task => {
        const taskDate = new Date(task.date).toDateString();
        const currentSelectedDate = selectedDate.toDateString();
        return taskDate === currentSelectedDate;
      });
      setTasksForSelectedDay(filteredTasks);
    }
  }, [userData, selectedDate]); // selectedDate dependency re-filters tasks when date changes

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Early return if no user data
  if (!userData) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Please log in or sign up to view your calendar.</p>
        <div className="mt-4 flex gap-4">
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/register')}>Register</Button>
        </div>
      </div>
    );
  }

  const handleAddNewTask = async (event) => {
    event.preventDefault();
    if (!userData || !userData.userId) {
      return;
    }
    
    const newTask = {
      title: event.target.title.value,
      time: event.target.time.value,
      date: formatDateToLocalYYYYMMDD(selectedDate), // Use selectedDate
      content: event.target.content.value,
      userId: userData.userId
    };
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    };
    
    try {
      const response = await apiRequest(`${apiUrl}/${userData.userId}`, options);
      if (response) {
        //adding tasks locally to the selected day
        setTasksForSelectedDay(prevTasks => [...prevTasks, newTask]);
        const newDate = new Date(newTask.date);
        const normalizedNewDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        if (!datesWithTasks.find(d => d.getTime() === normalizedNewDate.getTime())) {
            setDatesWithTasks(prevDates => [...prevDates, normalizedNewDate]);
        }
        await getUserData(authUser); // Refetch userData to sync all pages
    
        setIsAddTaskDialogOpen(false);
      }
    } catch (error) {
    }
  };

  const handleToggleComplete = async (deleteTask) => {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(deleteTask)
    };
    try {
      const response = await apiRequest(`${apiUrl}/deletetask/${userData.userId}`, options);
      if (response) {
        setTasksForSelectedDay(tasks => tasks.filter(task => task.title !== deleteTask.title && task.date === deleteTask.date));
        // After deleting a task, check if the date still has tasks

        await getUserData(authUser); // Refetch userData to sync all pages

        // If not, remove it from datesWithTasks
        const remainingTasksOnDate = userData.tasks.filter(
          task => new Date(task.date).toDateString() === new Date(deleteTask.date).toDateString() && task.title !== deleteTask.title
        );
        if (remainingTasksOnDate.length === 0) {
          const dateToRemove = new Date(deleteTask.date);
          const normalizedDateToRemove = new Date(dateToRemove.getFullYear(), dateToRemove.getMonth(), dateToRemove.getDate());
          setDatesWithTasks(prevDates => prevDates.filter(d => d.getTime() !== normalizedDateToRemove.getTime()));
        }
      }
    } catch (error) {
    }
  };
  
  const handleDateChange = (date) => {
    if (date) { // react-day-picker onSelect can return undefined
      setSelectedDate(date);
    }
  };

  // Modifiers for react-day-picker
  const modifiers = {
    hasTasks: datesWithTasks,
  };

  const modifiersStyles = {
    hasTasks: {
      backgroundColor: 'var(--secondary)',
      color: 'var(--secondary-foreground)',
      fontWeight: '900',
    }
  };

  // Formatter for weekday names (e.g., "Sun", "Mon")
  const formatWeekdayName = (day, options) => {
    return new Date(day).toLocaleDateString(options?.locale, { weekday: 'short' });
  };


  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {/* Left Side: Calendar and Add Task Button */}
          <div className="flex flex-col md:col-span-2 h-full">
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader className="shrink-0">
                <CardTitle className="text-2xl">Your Calendar</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 h-full">
                <div className="mb-4 flex flex-col flex-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    styles={calendarStyles}
                    className="rounded-md border shadow w-full h-full flex flex-col"
                    classNames={{
                        root: "p-2",
                        month_caption: "flex justify-center relative items-center w-full",
                        caption_label: "text-md font-medium",
                        nav: "flex flex-row items-center justify-between",
                        button_previous: "flex items-center justify-start border-border border-1 shadow-sm",
                        button_next: "flex items-center justify-end border-border border-1 shadow-sm",
                        chevron: "fill-foreground",
                        months: "flex flex-col",
                        month: "flex flex-col ",

                        month_grid: "flex flex-col w-full border-collapse",
                        weekdays: "flex w-full",      
                        weekday: "flex-1 px-1 py-1.5 text-muted-foreground font-normal text-[0.8rem] text-center",
                        
                        week: "flex w-full items-stretch", 
                        day: "flex-1 m-1 min-w-8 p-0 relative hover:bg-primary hover:text-primary-foreground",       // This is the cell (td) - REMOVED bg-primary

                        day_button: "w-full h-full min-w-8 p-3 text-base font-normal flex items-center justify-center border border-border rounded-none", 
                        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground", 
                        today: "bg-primary text-primary-foreground", // REMOVED bg-primary
                        outside: "text-muted-foreground opacity-50 rounded-none border border-border hover:text-accent-foreground", // REMOVED bg-card, hover:bg-accent/50
                        disabled: "text-muted-foreground opacity-50 bg-card rounded-none border border-border", // Kept bg-card for disabled as it's a distinct state
                        hidden: "invisible", 
                        range_start: "day-range-start rounded-none", 
                        range_end: "day-range-end rounded-none", 
                        range_middle: "aria-selected:text-accent-foreground rounded-none" // REMOVED aria-selected:bg-accent
                    }}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    formatters={{ formatWeekdayName }}
                  />
                </div>
                <div className="flex justify-end mt-auto pt-4 shrink-0">
                  <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full lg:w-auto ">Add New Task for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                        <DialogDescription>
                          Fill in the details for your new task on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                        </DialogDescription>
                      </DialogHeader>
                      <form id="addTaskFormCalendar" onSubmit={handleAddNewTask}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                              Title
                            </Label>
                            <Input id="title" name="title" placeholder="E.g., Meeting with team" className="col-span-3" required />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">
                              Time
                            </Label>
                            <Input id="time" name="time" type="time" className="col-span-3" required />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                              Content
                            </Label>
                            <Input id="content" name="content" placeholder="(Optional) Details..." className="col-span-3" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Add Task</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Tasks for Selected Day */}
          <div className="flex flex-col md:col-span-1 h-full">
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader className="shrink-0">
                <CardTitle className="text-xl">
                  Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto">
                  {tasksForSelectedDay.length > 0 ? (
                    <ul className="space-y-3">
                      {tasksForSelectedDay.map((task, i) => (
                        <li
                          key={i} // Consider a more stable key if tasks can be reordered/deleted frequently
                          className="flex items-center justify-between p-3 rounded-md border transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-lg">{task.title}</span>
                              <span className="text-xs text-muted-foreground pt-1">{task.time}</span>
                            </div>
                            {task.content && <p className="text-sm mt-1 text-card-foreground/80">{task.content}</p>}
                          </div>
                          <Button 
                            variant="default" 
                            size="icon" 
                            onClick={() => handleToggleComplete(task)}
                            className="ml-2 p-1 h-8 w-8 rounded-full hover:bg-primary/75"
                          >
                            <CheckIcon />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No tasks for this day. Add one!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YourCalendar;

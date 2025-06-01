import { Link, useNavigate } from 'react-router-dom';
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
import background from '@/assets/landing-section/background.svg';

// Placeholder for Check icon if lucide-react is not yet installed/imported
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const YourTasks = () => {
  const { userData, isLoading, getUserData, authUser, formatDateToLocalYYYYMMDD } = useContext(AuthContext);
  const navigate = useNavigate();

  // Initialize tasks state safely
  const [todayTasks, setTodayTasks] = useState([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  // Effect to update tasks when userData changes
  useEffect(() => {
    if (userData && userData.tasks) {
      setTodayTasks(userData.tasks.filter(task => task.date === formatDateToLocalYYYYMMDD(new Date())));
    }
  },[userData]);

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Early return if no user data
  if (!userData && !isLoading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Please log in or sign up to view your tasks.</p>
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
      date: formatDateToLocalYYYYMMDD(new Date()),
      content: event.target.content.value,
      userId: userData.userId
    }
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTask)
    }
    
    try {
      const response = await apiRequest(`${apiUrl}/${userData.userId}`, options);
      if (response) {
        setTodayTasks(tasks => [...tasks, newTask]);
        setIsAddTaskDialogOpen(false);
        await getUserData(authUser); // Refetch userData to sync all pages
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
    }
    try {
      const response = await apiRequest(`${apiUrl}/deletetask/${userData.userId}`, options);
      if (response) {
        setTodayTasks(tasks => tasks.filter(task => task.title !== deleteTask.title));
        await getUserData(authUser); // Refetch userData to sync all pages
      }
    } catch (error) {
    }
  };


  return (
    <div className="flex flex-col flex-1">

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Side: Your Tasks List */}
          <div className="flex flex-col lg:col-span-2 h-full">
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader className="shrink-0">
                <CardTitle className="text-2xl">Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto">
                  {todayTasks.length > 0 ? (
                    <ul className="space-y-3">
                      {todayTasks.map((task, i) => (
                        <li
                          key={i}
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
                            className="ml-2 p-1 h-8 w-8 rounded-full hover:bg-primary/90"
                          >
                            <CheckIcon />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No tasks for today yet. Add one!</p>
                  )}
                </div>

                <div className="flex justify-end pt-6 shrink-0">
                  <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full lg:w-auto ">Add New Task</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                        <DialogDescription>
                          Fill in the details for your new task.
                        </DialogDescription>
                      </DialogHeader>
                      <form id="addTaskForm" onSubmit={handleAddNewTask}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                              Title
                            </Label>
                            <Input id="title" name="title" placeholder="E.g., Morning Jog" className="col-span-3" required />
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

          {/* Right Side: Date Section & Calendar Link */}
          <div className="flex flex-col lg:col-span-1 h-full">
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader className="shrink-0">
                <CardTitle className="text-xl">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 w-full bg-muted rounded-md mb-6 flex items-center justify-center overflow-hidden">
                  <img 
                    src={background} 
                    alt="Decorative Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Link to="/yourcalendar" className="w-full mt-auto shrink-0">
                  <Button variant="outline" className="w-full">View Calendar</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YourTasks;
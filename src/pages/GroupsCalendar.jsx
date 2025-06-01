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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import apiRequest from '@/ApiRequest';
import { Calendar } from "@/components/ui/calendar";

const apiUrl = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/api`;

// Placeholder for Check icon
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const GroupsCalendar = () => {
  const { userData, isLoading, formatDateToLocalYYYYMMDD, currentGroupId } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State for holding the full fetched data
  const [currentGroupData, setCurrentGroupData] = useState(null);
  const [usersTaskInfo, setUsersTaskInfo] = useState([]); 

  // State for data derived/filtered for the selected date
  const [groupTasksForSelectedDay, setGroupTasksForSelectedDay] = useState([]);
  const [memberTimingsForSelectedDay, setMemberTimingsForSelectedDay] = useState([]);
  
  // Updated state for calendar highlighting
  const [datesWithGroupTaskHighlight, setDatesWithGroupTaskHighlight] = useState([]);
  const [datesWithOnlyMemberTaskBorder, setDatesWithOnlyMemberTaskBorder] = useState([]);
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFetchingGroupData, setIsFetchingGroupData] = useState(false); // Separate loading state for group data fetching

  // Effect 1: Fetching core data when currentGroupId changes
  useEffect(() => {
    const fetchGroupAndMemberData = async () => {
      if (!currentGroupId) {
        setCurrentGroupData(null);
        setUsersTaskInfo([]);
        return;
      }
      setIsFetchingGroupData(true);
      try {
        // Fetch group data
        const groupOptions = { method: 'GET', headers: { 'Content-Type': 'application/json' } };
        const groupDataResponse = await apiRequest(`${apiUrl}/groups/getGroup/${currentGroupId}`, groupOptions);
        
        if (groupDataResponse) {
          setCurrentGroupData(groupDataResponse);

          // Fetch users task info if group data and members exist
          if (groupDataResponse.members && groupDataResponse.members.length > 0) {
            const usersOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ members: groupDataResponse.members }),
            };
            const usersTaskInfoResponse = await apiRequest(`${apiUrl}/users/getUsersTaskInfo`, usersOptions);
            if (usersTaskInfoResponse) {
              setUsersTaskInfo(usersTaskInfoResponse);
            } else {
              setUsersTaskInfo([]); // Clear if fetching users info fails
            }
          } else {
            setUsersTaskInfo([]); // No members, so no user tasks
          }
        } else {
          setCurrentGroupData(null); // Clear if fetching group data fails
          setUsersTaskInfo([]);
        }
      } catch (error) {
        setCurrentGroupData(null);
        setUsersTaskInfo([]);
      } finally {
        setIsFetchingGroupData(false);
      }
    };

    fetchGroupAndMemberData();
  }, [currentGroupId, userData]); // userData dependency in case auth changes affect availability

  // Effect 2: Filtering data when selectedDate or fetched data changes
  useEffect(() => {
    if (!currentGroupData) {
      setGroupTasksForSelectedDay([]);
      setMemberTimingsForSelectedDay([]);
      setDatesWithGroupTaskHighlight([]);
      setDatesWithOnlyMemberTaskBorder([]);
      return;
    }

    const currentSelectedDateStr = selectedDate.toDateString();
    
    const groupTaskDateStrings = new Set();
    const memberTaskDateStrings = new Set();

    // Process group tasks for selected day and collect all group task dates
    if (currentGroupData.tasks) {
      const filteredGroupTasks = currentGroupData.tasks.filter(task => {
        return new Date(task.date).toDateString() === currentSelectedDateStr;
      });
      setGroupTasksForSelectedDay(filteredGroupTasks);
      currentGroupData.tasks.forEach(task => {
        const taskDate = new Date(task.date);
        groupTaskDateStrings.add(new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).toDateString());
      });
    } else {
      setGroupTasksForSelectedDay([]);
    }
    setDatesWithGroupTaskHighlight(Array.from(groupTaskDateStrings).map(dateStr => new Date(dateStr)));

    // Process member timings for selected day and collect all member task dates
    const timings = [];
    if (usersTaskInfo && usersTaskInfo.length > 0) {
      usersTaskInfo.forEach(user => {
        const userTasksOnSelectedDay = user.tasks.filter(task => {
          return new Date(task.date).toDateString() === currentSelectedDateStr;
        });
        if (userTasksOnSelectedDay.length > 0) {
          timings.push({
            username: user.username,
            tasks: userTasksOnSelectedDay.map(t => ({ time: t.time, title: t.title }))
          });
        }
        user.tasks.forEach(task => {
          const taskDate = new Date(task.date);
          memberTaskDateStrings.add(new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).toDateString());
        });
      });
    }
    setMemberTimingsForSelectedDay(timings);

    // Determine dates with only member tasks for border highlight
    const onlyMemberTaskDates = [];
    memberTaskDateStrings.forEach(dateStr => {
      if (!groupTaskDateStrings.has(dateStr)) {
        onlyMemberTaskDates.push(new Date(dateStr));
      }
    });
    setDatesWithOnlyMemberTaskBorder(onlyMemberTaskDates);

  }, [selectedDate, currentGroupData, usersTaskInfo]);

  // Loading states
  if (isLoading) { // This is the initial loading from AuthContext for userData
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Loading user data...</p>
      </div>
    );
  }
  if (!userData) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Please log in or sign up.</p>
        <div className="mt-4 flex gap-4">
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/register')}>Register</Button>
        </div>
      </div>
    );
  }
  if (!currentGroupId) {
    return (
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Please select a group to view its calendar.</p>
      </main>
    );
  }
  if (isFetchingGroupData && !currentGroupData) {
    return (
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <p className="text-lg">Loading group calendar...</p>
      </main>
    );
  }
  if (!isFetchingGroupData && !currentGroupData && currentGroupId) {
    return (
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Could not load group data. Please try again or select another group.</p>
      </main>
    );
  }

  const handleAddNewTask = async (event) => {
    event.preventDefault();
    const newTaskPayload = {
      title: event.target.title.value,
      time: event.target.time.value,
      date: formatDateToLocalYYYYMMDD(selectedDate),
      content: event.target.content.value,
    };
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTaskPayload),
    };
    try {
      const response = await apiRequest(`${apiUrl}/groups/addTask/${currentGroupId}`, options);
      // Update currentGroupData, Effect 2 will handle derived state updates
      setCurrentGroupData(prevData => ({
        ...prevData,
        tasks: [...(prevData.tasks || []), response] 
      }));
    } catch (error) {
      // Error handling for user can be added here
    }
    setIsAddTaskDialogOpen(false);
  };

  const handleToggleComplete = async (taskToToggle) => {
    const options = {
      method: 'POST', // Should likely be DELETE or PUT/PATCH to mark complete
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title:taskToToggle.title }) // Assuming title is key, better to use a unique ID
    };
    try {
        const response = await apiRequest(`${apiUrl}/groups/deleteTask/${currentGroupId}`, options);
        // Update currentGroupData, Effect 2 will handle derived state updates
        setCurrentGroupData(prevData => ({
          ...prevData,
          // Ensure tasks array exists and filter based on a more reliable unique key if possible
          tasks: (prevData.tasks || []).filter(task => 
            !(task.title === taskToToggle.title && task.date === taskToToggle.date && task.time === taskToToggle.time)
            // Ideally: task.id !== taskToToggle.id
          )
        }));
    } catch (error) {
        // Error handling for user can be added here
    }
  };
  
  const handleDateChange = (date) => {
    if (date) setSelectedDate(date);
  };

  const handleDeleteGroup = async () => {
    
    setIsDeleteDialogOpen(false);
  };

  const modifiers = {
    hasGroupTask: datesWithGroupTaskHighlight,
    hasOnlyMemberTask: datesWithOnlyMemberTaskBorder,
    // Keep other modifiers like selected, today, etc., if they were implicitly handled by react-day-picker defaults or your CSS
  };
  const modifiersStyles = {
    hasGroupTask: { 
      backgroundColor: 'var(--secondary)', 
      color: 'var(--secondary-foreground)', 
      fontWeight: '900'
    },
    hasOnlyMemberTask: {
      borderColor: 'var(--primary)', // Using HSL as an example for primary color variable
      borderWidth: '5px',
      borderStyle: 'solid',
    }
  };
  const formatWeekdayName = (day, options) => new Date(day).toLocaleDateString(options?.locale, { weekday: 'short' });

  return (
    <div className="flex flex-col flex-1 w-full">
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <div className="flex flex-col md:col-span-2 h-full">
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader className="shrink-0">
                <CardTitle className="text-2xl">
                  {currentGroupData ? `${currentGroupData.name} Calendar` : (isFetchingGroupData || !currentGroupId ? "Loading Group..." : "Group Calendar")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0 h-full">
                <div className="mb-4 flex flex-col flex-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={isFetchingGroupData || !currentGroupData} // Disable calendar while fetching or if no group data
                    className="rounded-md border shadow w-full h-full flex flex-col"
                    classNames={{
                        root: "flex flex-col h-full",
                        months: "flex flex-col flex-1",
                        month: "flex flex-col h-full flex-1",
                        table: "w-full h-full border-collapse",
                        weekdays: "flex w-full mt-10",
                        weekday: "flex-1 text-muted-foreground rounded-md font-normal text-[0.8rem] text-center",
                        week: "flex w-full mt-2",
                        day: "h-12 w-full text-center p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center border border-border flex-1",
                        day_button: "h-full w-full flex items-center justify-center p-2 text-base hover:bg-accent hover:text-accent-foreground rounded-md",
                        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        today: "bg-accent text-accent-foreground",
                        outside: "text-muted-foreground opacity-50",
                        disabled: "text-muted-foreground opacity-50",
                        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        hidden: "invisible",
                        groupTaskDay: "group-task-day",
                        memberTaskDay: "member-task-day"
                    }}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    formatters={{ formatWeekdayName }}
                  />
                </div>
                <div className="flex flex-end justify-end mt-auto pt-4 shrink-0">
                  {!(userData?.userId && currentGroupData?.owner && userData.userId === currentGroupData.owner) && <div />}
                  <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full lg:w-auto" disabled={!currentGroupData || isFetchingGroupData}>
                        Add New Task for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Task to Group</DialogTitle>
                        <DialogDescription>
                          Fill in the details for the new task on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} for the group {currentGroupData?.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <form id="addTaskFormCalendar" onSubmit={handleAddNewTask}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" name="title" placeholder="E.g., Team Sync" className="col-span-3" required />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Time</Label>
                            <Input id="time" name="time" type="time" className="col-span-3" required />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">Content</Label>
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

          <div className="flex flex-col md:col-span-1 h-full space-y-6">
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader className="shrink-0">
                <CardTitle className="text-xl">
                  Group Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto">
                  {isFetchingGroupData && groupTasksForSelectedDay.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Loading tasks...</p>
                  ) : groupTasksForSelectedDay.length > 0 ? (
                    <ul className="space-y-3">
                      {groupTasksForSelectedDay.map((task, i) => (
                        <li
                          key={`${task.title}-${task.date}-${task.time}-${i}`}
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
                    <p className="text-muted-foreground text-center py-4">No group tasks for this day.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader className="shrink-0">
                <CardTitle className="text-xl">Member Timings for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto">
                  {isFetchingGroupData && memberTimingsForSelectedDay.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Loading member timings...</p>
                  ) : memberTimingsForSelectedDay.length > 0 ? (
                    <ScrollArea className="h-[100px]">
                      <ul className="space-y-4">
                        {memberTimingsForSelectedDay.map((member, index) => (
                          <li key={member.username + '-' + index} className="flex flex-row p-3 rounded-md border">
                            <p className="font-semibold mb-1">{member.username}</p>
                            {member.tasks && member.tasks.length > 0 ? (
                              <div className="flex flex-wrap gap-2 ml-4">
                                {member.tasks.map((task, taskIndex) => (
                                  <Badge key={task.time + '-' + taskIndex + '-' + member.username} variant="default">{task.time}</Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-1">No tasks scheduled for this day.</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  ) : (
                     currentGroupData && currentGroupData.members && currentGroupData.members.length > 0 && usersTaskInfo.length === 0 && !isFetchingGroupData ? 
                     (<p className="text-muted-foreground text-center py-4">Could not load member timings.</p>) :
                     (currentGroupData && currentGroupData.members && currentGroupData.members.length > 0 ? 
                       (<p className="text-muted-foreground text-center py-4">No members have tasks on this day.</p>) :
                       (<p className="text-muted-foreground text-center py-4">No members in this group or data not loaded.</p>)
                     )
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

export default GroupsCalendar;

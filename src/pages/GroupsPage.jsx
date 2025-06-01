import { useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '@/context/Context.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ApiRequest from '@/ApiRequest';
import { toast } from 'sonner';

const apiUrl = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/api`;

const GroupsPage = () => {
  const { userData, isLoading, setCurrentGroupId } = useContext(AuthContext);
  const navigate = useNavigate();


  // --- Placeholder State ---
  // Create Group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupType, setNewGroupType] = useState('public');
  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  const [usersToInvite, setUsersToInvite] = useState([]);

  // Search Groups
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState(allGroups);

  // Selected Group
  const [selectedGroup, setSelectedGroup] = useState(null); // Default to null
  const [selectedGroupSource, setSelectedGroupSource] = useState(null); // To track selection source
  const [userGroups, setUserGroups] = useState([]); // Placeholder for user's groups


    // All hooks must be called before any conditional returns.
  useEffect(() => {
    const getUsers = async () => {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
      try {
        const users = await ApiRequest(`${apiUrl}/users?type=basic`, options);
        users.forEach(user => {user.invited = false});
        setUsersToInvite(users)
      } catch (error) {
      }
    }
    const getSearchableGroups = async () => {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
      try {
        if (userData) {
          const groups = await ApiRequest(`${apiUrl}/groups/getGroups?type=invite&userId=${userData.userId}`, options);
          setAllGroups(groups);
        }
      } catch (error) {
      }
    }

    const getUserGroups = async () => {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
      try {
        if (userData) {
          const groups = await ApiRequest(`${apiUrl}/groups/getGroups?type=user&userId=${userData.userId}`, options);
          setUserGroups(groups);
        }
      } catch (error) {
      }
    }

    getUsers();
    getSearchableGroups();
    getUserGroups();
  },[userData])

  const handleCreateGroup = async () => {
    const groupData = {
      name: newGroupName,
      description: newGroupDescription,
      type: newGroupType,
      members: usersToInvite.filter(u => u.invited).map(u => u.userId),
      owner: userData.userId
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData)
    };
    try {
      const response = await ApiRequest(`${apiUrl}/groups/createGroup`, options);
      if (response) {
        // setAllGroups(prevGroups => [...prevGroups, response]);
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupType('public');
        setUsersToInvite([]);
        //adding new group to users groups
        toast.success('Group created successfully');
        const newGroup = {_id: response._id, name: response.name, description: response.description, type: response.type};
        setUserGroups([...userGroups, newGroup]);
      }
    } catch (error) {
      toast.error('Error creating group');
    }
  };

  const handleUserInviteToggle = (userId) => {
    setUsersToInvite(prevUsers =>
      prevUsers.map(user =>
        user.userId === userId ? { ...user, invited: !user.invited } : user
      )
    );
  };

  const handleSelectGroup = (group, source) => {
    setSelectedGroup(group);
    setSelectedGroupSource(source);
  };

  const handleSetCurrentGroupData = (group) => {
    setCurrentGroupId(group._id);
    navigate(`/groupCalendar`);
  }

  const handleRequestGroup = async (group) => {
    const requestData = {
      groupId: group._id,
      userId: userData.userId,
      groupName: group.name,
      username: userData.username,
      owner: group.owner
    }
    const options = {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    }
    try {
      const response = await ApiRequest(`${apiUrl}/users/requestGroup`, options);
      if (response) {
        toast.success('Request to join group sent successfully');
      }
    } catch (error) {
      toast.error('Error requesting group');
    }
  }
  
  // Effect for filtering users (placeholder)
  useEffect(() => {
  }, [inviteSearchTerm]);

  // Effect for filtering groups (placeholder)
  useEffect(() => {
    if (groupSearchTerm === '') {
      setFilteredGroups(allGroups);
    } else {
      setFilteredGroups(
        allGroups.filter(group =>
          group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
        )
      );
    }
  }, [groupSearchTerm, allGroups]);

  // Conditional rendering logic moved after all hook definitions.
  if (isLoading && !userData) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center w-full p-4 text-center">
        <p className="text-lg">Please log in or sign up to view your groups.</p>
        <div className="mt-4 flex gap-4">
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/register')}>Register</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background">

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* Section 1: Create Group */}
          <Card className="flex flex-col animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">Create Group</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <div>
                <Label htmlFor="groupName" className='mt-2'>Name</Label>
                <Input 
                  id="groupName" 
                  placeholder="Enter group name" 
                  value={newGroupName}
                  className="w-full mt-2"
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="groupDescription" className='mt-2'>Description</Label>
                <Textarea 
                  id="groupDescription" 
                  placeholder="Enter group description" 
                  value={newGroupDescription}
                  className="w-full mt-2 h-5"
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="groupType" className='mt-2'>Group Type</Label>
                <Select
                  onValueChange={(value) => setNewGroupType(value)}
                  defaultValue={newGroupType}
                >
                  <SelectTrigger className="w-full mt-2" id="groupType">
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invite">Invite Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex flex-col flex-grow min-h-[200px]"> {/* Added min-h for a base height */}
                <Label className='mt-2'>Invite Members</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Search username..." 
                    value={inviteSearchTerm}
                    onChange={(e) => setInviteSearchTerm(e.target.value)}
                  />
                  <Button variant="outline" size="icon" aria-label="Search users">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-grow h-[100px] border rounded-md">
                    {usersToInvite.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-2 pl-4 pr-4 border-b">
                        <Label htmlFor={`invite-${user.userId}`} className="font-normal text-md">{user.username}</Label>
                        <Checkbox
                          id={`invite-${user.userId}`}
                          checked={user.invited}
                          onCheckedChange={() => handleUserInviteToggle(user.userId)}
                        />
                      </div>
                    ))}
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCreateGroup}>Create</Button>
            </CardFooter>
          </Card>

          {/* Section 2: Search For Groups */}
          <Card className="flex flex-col animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">Search For Groups</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4 flex-grow">
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Search groups..."
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="icon" aria-label="Search groups">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-grow border rounded-md">
                <div className="p-1">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <Button 
                        key={group._id} 
                        variant="ghost" 
                        className="w-full justify-start text-left h-auto py-2 px-3"
                        onClick={() => handleSelectGroup(group, 'search')}
                      >
                        {group.name}
                      </Button>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground text-center">No groups found.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Wrapper for 3rd Column Content (Sections 3 & 4) */}
          <div className="flex flex-col gap-6">
            {/* Section 3: Group Details */}
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              {selectedGroup ? (
                <>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-2xl">{selectedGroup.name}</CardTitle>
                      {selectedGroup.type && <Badge variant="default">{selectedGroup.type}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow">
                    <div>
                      <Label className="font-semibold text-base">Description</Label>
                      <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {selectedGroupSource === 'user_groups' ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSetCurrentGroupData(selectedGroup)}
                      >
                        Go to Group Tasks
                      </Button>
                    ) : selectedGroupSource === 'search' ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleRequestGroup(selectedGroup)} // request to join group
                      >
                        Request to Join
                      </Button>
                    ) : null} {/* Renders nothing if source is not set, though selectedGroup should also be null then */}
                  </CardFooter>
                </>
              ) : (
                <CardContent className="flex items-center justify-center flex-grow">
                  <p className="text-muted-foreground">Select a group to see details.</p>
                </CardContent>
              )}
            </Card>

            {/* Section 4: User's Groups (New Section) - Card is now direct child, extra div removed */}
            <Card className="flex flex-col flex-1 animate-in fade-in duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">Your Groups</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4 flex-grow">
                <ScrollArea className="flex-grow border rounded-md">
                  <div>
                    {userGroups.length > 0 ? (
                      userGroups.map((group) => (
                        <Button 
                          key={group._id} 
                          variant="ghost" 
                          className="w-full justify-start text-left h-auto py-3 px-3 border-b"
                          onClick={() => handleSelectGroup(group, 'user_groups')}
                        >
                          {group.name}
                        </Button>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-muted-foreground text-center">You are not part of any groups yet.</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
};

export default GroupsPage;

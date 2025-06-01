import React from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContext, useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';
import AuthContext from '@/context/Context';

const apiUrl = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/api`;

const Notifications = () => {
    const {userData, setUserData} = useContext(AuthContext);
    const [groupInvites, setGroupInvites] = useState([]);
    const [userInvites, setUserInvites] = useState({});

    useEffect(() => {
        if (userData) {
            setGroupInvites(userData.groupInvites);
            setUserInvites(userData.userInvites);
        }
    }, [userData]);

    const handleAccept = async () => {
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({gi:groupInvites, ui:userInvites, userId: userData.userId})
        }
        try {
            const response = await fetch(`${apiUrl}/groups/addUser?type=accept`, options);
            const data = await response.json();
            setGroupInvites([]);
            setUserInvites({});
            setUserData({...userData, groupInvites: [], userInvites: {}});
        } catch (error) {
        }
    }

    const handleReject = async () => {
        const options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({gi:groupInvites, ui:userInvites, userId: userData.userId})
        }
        try {
            const response = await fetch(`${apiUrl}/groups/addUser?type=reject`, options);
            const data = await response.json();
            setGroupInvites([]);
            setUserInvites({});
            setUserData({...userData, groupInvites: [], userInvites: {}});
        } catch (error) {
        }
    }

    const handleGroupInviteToggle = (groupId) => {
        setGroupInvites(prev => prev.map(invite => invite.groupId === groupId ? {...invite, selected: !invite.selected} : invite));
    }

    const handleUserInviteToggle = (userId, group) => {
        setUserInvites(prev => ({
            ...prev,
            [group]: prev[group].map(user => user.userId === userId ? {...user, selected: !user.selected} : user)
        }));
    }   


  return (
    <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="bg-transparent rounded-full border-none w-10 h-10" size="icon">
                <Bell className='w-4 h-4 transition-all duration-300 ' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className='flex flex-row justify-between'>
                  <AlertDialogTitle>Your Notifications</AlertDialogTitle>
                  <AlertDialogCancel className=' ml-3 w-10 h-10 rounded-full shadow-none' size="icon">
                    <X className='w-4 h-4 transition-all duration-300' />
                  </AlertDialogCancel>
                </div>
                <AlertDialogDescription>handle these requests or come back later</AlertDialogDescription>
              </AlertDialogHeader>
              <div className='flex flex-col gap-2'>
                {/* group invites */}
                <Card>
                    <CardHeader>
                        <CardTitle>Group Invite</CardTitle>
                        {groupInvites.length > 0 ? (
                            <CardDescription> select the groups you want to join</CardDescription>
                        ) : (
                            <CardDescription>No group invites</CardDescription>
                        )}
                    </CardHeader>
                    {groupInvites.length > 0 && (
                    <CardContent>
                        <ScrollArea className="flex-grow border rounded-md">
                            {groupInvites.map(invite => (
                                <div key={invite.groupId} className='flex items-center justify-between p-3 pl-4 pr-4 border-b'>
                                    <h3>{invite.groupName}</h3>
                                <Checkbox
                                    id={invite.groupId}
                                    checked={invite.selected}
                                    onCheckedChange={() => handleGroupInviteToggle(invite.groupId)}
                                />
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                    )}
                </Card>
                {/* user requests */}
                <Card className='mt-4'>
                    <CardHeader>
                        <CardTitle>User Request</CardTitle>
                        {Object.keys(userInvites).length > 0 ? (
                            <CardDescription> select the users you want to allow to join your groups</CardDescription>
                        ) : (
                            <CardDescription>No user requests</CardDescription>
                        )}
                    </CardHeader>
                    {Object.keys(userInvites).length > 0 && (
                    <CardContent className='p-2'>
                        <ScrollArea className="flex-grow border-none rounded-md w-full">
                            {Object.keys(userInvites).map( group => (
                                <div key={group} className='flex flex-col gap-2 w-full items-start justify-between pl-4 pr-4 '>
                                    <h3 className='text-md font-bold'>{userInvites[group][0].groupName}</h3>
                                    <ScrollArea className="flex-grow border rounded-md w-full">
                                    {userInvites[group].map(user => (
                                        <div key={user.userId} className='flex flex-row w-full items-center justify-between p-3 pl-4 pr-4 border-b'>
                                            <h4>{user.username}</h4>
                                            <Checkbox
                                                id={user.userId}
                                                checked={user.selected}
                                                onCheckedChange={() => handleUserInviteToggle(user.userId, group)}
                                            />
                                        </div>
                                    ))}
                                    </ScrollArea>
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                    )}
                </Card>
              </div>
              <AlertDialogFooter>
                <AlertDialogAction className='bg-transparent text-foreground border-1 border-foreground hover:bg-primary hover:text-background' onClick={handleReject}>Reject All</AlertDialogAction>
                <AlertDialogAction onClick={handleAccept}>Accept</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
    </AlertDialog>
  )
}

export default Notifications

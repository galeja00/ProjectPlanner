import { TimeTableGroup } from "@/app/api/projects/[id]/[board]/route";
import { Dialog, DialogClose } from "@/app/components/dialog";
import { TasksGroup } from "@prisma/client";
import { useContext, useState, useEffect } from "react";

type GroupBasicInfo = {
    id: string,
    name: string
}

export function AddGroupToTimeTable({ projectId, groups, handleClose } : { projectId : string, groups : TimeTableGroup[], handleClose : () => void }) {
    const [ unassignedGroups, setUnassignedGroups ] = useState<TasksGroup[]>([]);
    
    async function fetchUnassignedGroups() {
        try {
            const res = await fetch(`/api/projects/${projectId}/timetable/group/all`, {
                method: "GET"
            }); 
            const data = await res.json();
            if (!res.ok) {
                throw Error(data.error);
            }
            console.log(data);
            const fetchedGroups = data.groups.filter((group : TasksGroup) => group.timeTableId === null);
            setUnassignedGroups(fetchedGroups);
        }
        catch (error) {
            console.error(error);
            //fetchUnassignedGroups(); 
        }
    }

    useEffect(() => {fetchUnassignedGroups()}, []);

    return (
        <Dialog>
            <div className="relative bg-neutral-950 rounded">
                <DialogClose handleClose={handleClose}/>
                <div>
                    <h4>Groups on time table</h4>
                    <ListGroups groups={groups.map((group) => ({id: group.id, name: group.name}))}/>
                </div>
                <div>
                    <h4>All Groups</h4>
                    <ListGroups groups={unassignedGroups.map((group) => ({id: group.id, name: group.name}))}/>
                </div>
            </div>
        </Dialog>
    )
}




function ListGroups({ groups } : { groups : GroupBasicInfo[] }) {

    function handleOnDrop() {

    }

    function handleOnDragOver() {

    }

    function handleOnLeave() {

    }

    return(
        <ul
            onDrop={handleOnDrop}
            onDragOver={handleOnDragOver}
            onDragLeave={handleOnLeave}
            onDragExit={handleOnLeave}
        >
            {
                groups.map((group) => (
                    <ListItem key={group.id} group={group}/>
                ))
            }
        </ul>
    )
}


function ListItem({ group } : { group : GroupBasicInfo}) {
    return (
        <li key={group.id} className="" draggable>
            {group.name}
        </li>
    )
}
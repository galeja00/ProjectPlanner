import { BoardsTypes } from "@/app/api/projects/[id]/[board]/board";
import { TimeTableGroup } from "@/app/api/projects/[id]/[board]/route";
import { Dialog, DialogClose } from "@/app/components/dialog";
import { TasksGroup } from "@prisma/client";
import { useContext, useState, useEffect, useReducer, DragEvent } from "react";

type GroupBasicInfo = {
    id: string,
    name: string,
    col: ColumnType
}

enum ColumnType {
    TimeTable = 0,
    Other = 1
}

export function AddGroupToTimeTable({ projectId, groups, handleClose } : { projectId : string, groups : TimeTableGroup[], handleClose : () => void }) {
    const [ unassignedGroups, setUnassignedGroups ] = useState<GroupBasicInfo[]>([]);
    const [ timetableGroups, setTimetableGroups] = useState<GroupBasicInfo[]>(() =>
        groups.map(g => ({ id: g.id, name: g.name, col: ColumnType.TimeTable }))
    );

    async function fetchGroups() {
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.TimeTable}/group/all`, {
                method: "GET"
            }); 
            const data = await res.json();
            if (!res.ok) {
                throw Error(data.error);
            }

            setUnassignedGroups(data.groups
                .filter((group : TasksGroup) => group.timeTableId === null)
                .map((group : TasksGroup) => ({ id: group.id, name: group.name, col: ColumnType.Other})));
            setTimetableGroups(data.groups
                .filter((group : TasksGroup) => group.timeTableId !== null)
                .map((group : TasksGroup) => ({ id: group.id, name: group.name, col: ColumnType.TimeTable})));
        }
        catch (error) {
            console.error(error);
            //fetchUnassignedGroups(); 
        }
    }

    async function fetchCrudGroup(group : GroupBasicInfo, method : string) {
        try {
           
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.TimeTable}/group/${method}`, {
                method: "POST",
                body: JSON.stringify({
                    id: group.id
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error); 
            }
            fetchGroups();

        }
        catch (error) {
            console.error(error);
        }
    }


    function handleMove(group : GroupBasicInfo, col : ColumnType) {
        if (group.col == col) return;
        if (col == ColumnType.TimeTable) fetchCrudGroup(group, "add");
        else if (col == ColumnType.Other) fetchCrudGroup(group, "remove");
    }

    useEffect(() => {fetchGroups()}, []);

    return (
        <Dialog>
            <div className="relative bg-neutral-200 rounded h-fit w-fit p-4">
                <DialogClose handleClose={handleClose}/>
                <h2 className="font-bold text-xl mb-4">Move groups</h2>
                <section className="h-fit relative flex gap-4 w-full justify-around">
                    <div>
                        <h3>Groups on Time Table</h3>
                        <ListGroups 
                            groups={timetableGroups} 
                            handleMove={(group) => handleMove(group, ColumnType.TimeTable)}/>
                    </div>
                    <div>
                        <h3>Other Groups</h3>
                        <ListGroups 
                            groups={unassignedGroups} 
                            handleMove={(group) => handleMove(group, ColumnType.Other)}/>
                    </div>
                </section>
            </div>
        </Dialog>
    )
}




function ListGroups({ groups, handleMove } : { groups : GroupBasicInfo[], handleMove : (group : GroupBasicInfo) => void }) {
    const [ isDraged, toggleDragged ] = useReducer(isDraged => !isDraged, false);
    
    function handleOnDrop(event : DragEvent) {
        event.preventDefault();
        const jsonString = event.dataTransfer.getData("json/group");
        const group : GroupBasicInfo = JSON.parse(jsonString);
        handleMove(group);
        if (isDraged) {
            toggleDragged();
        }
    }

    function handleOnDragOver(event : DragEvent) {
        event.preventDefault();
        if (!isDraged) {
            toggleDragged();
        }
    }

    function handleOnLeave(event : DragEvent) {
        event.preventDefault();
        if (isDraged) {
            toggleDragged();
        }
    }

    function handleOnDragStart(event : DragEvent, group : GroupBasicInfo) {
        event.dataTransfer.setData("json/group", JSON.stringify(group));
    }

    return(
        <ul className={`rounded p-1 flex flex-col gap-1 flex-1 h-[30rem] w-[20rem] overflow-y-auto ${isDraged ? "bg-neutral-600" : "bg-neutral-100"}`}
            onDrop={handleOnDrop}
            onDragOver={handleOnDragOver}
            onDragLeave={handleOnLeave}
            onDragExit={handleOnLeave}
        >
            {
                groups.map((group) => (
                    <ListItem key={group.id} group={group} handleOnDrag={(e) => handleOnDragStart(e, group)}/>
                ))
            }
        </ul>
    )
}


function ListItem({ group, handleOnDrag } : { group : GroupBasicInfo, handleOnDrag : (e : DragEvent) => void }) {
    return (
        <li key={group.id} onDragStart={handleOnDrag} className={`box-content flex gap-4 bg-neutral-200 rounded items-center p-1 cursor-pointer`} draggable >
            {group.name}
        </li>
    )
}
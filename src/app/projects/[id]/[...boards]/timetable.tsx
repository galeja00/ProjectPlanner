"use client"
import { GroupOfTasks } from "@/app/api/projects/[id]/[board]/route";
import { Head } from "../components/other";
import { createContext, useContext, useEffect, useReducer, useState, MouseEvent, useRef } from "react";
import { Creator } from "./components/creator";
import { CreateButton } from "@/app/components/buttons";

interface TimeTableContextTypes {
    createGroup: (name: string) => void;
    groups : GroupOfTasks[];
    mode : Mode
}

enum Mode {
    Week = 7,
    Month = 31
}


const TimeTableContext = createContext<TimeTableContextTypes | null>(null);

export default function TimeTable({ id } : { id : string }) {
    const [ groups, setGroups] = useState<GroupOfTasks[]>([]);
    const [ mode, setMode ] = useState<Mode>(Mode.Week);
    const [ projectStart, setProjectStart ] = useState<Date>(new Date());

    async function fetchGroups() {
        try {
            const res = await fetch(`/api/projects/${id}/timetable`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                console.error(data.error);
            }
            //setGroups(data.data);
        }
        catch (error) {
            console.error(error);
        }
    }


    async function createGroup(name : string) {
        const id : string = Math.random().toString();
        const newGroups = [...groups, { id, name, tasks: [], position: groups.length, backlogId: "" }];
        setGroups(newGroups);
    }

    //useEffect(() => { fetchGroups() }, []);
    return (
        <TimeTableContext.Provider value={{ createGroup, groups, mode }}>
            <section className="overflow-x-hidden h-full">
                <Head text='Time Table'/>
                <Table groups={groups} projectStart={projectStart}/>
                <TimeMode mode={mode} changeMode={(mode : Mode) => setMode(mode)}/>
            </section>
        </TimeTableContext.Provider>
    )
}

function TimeMode({ mode, changeMode } : { mode : Mode, changeMode : (mode : Mode) => void }) {
    return (
        <div className="fixed m-4 z-50 right-0 bottom-0 bg-neutral-950 rounded w-50 flex">
            <button onClick={() => changeMode(Mode.Week)} className={`py-2 w-16 hover:bg-violet-600 rounded ${mode == Mode.Week ? "border border-violet-600" : ""}`}>Week</button>
            <button onClick={() => changeMode(Mode.Month)} className={`py-2 w-16 hover:bg-violet-600 rounded ${mode == Mode.Month ? "border border-violet-600" : ""}`}>Month</button>
        </div>
    )
}

function Table({groups, projectStart} : { groups : GroupOfTasks[],  projectStart : Date}) {
    const [ currentTime, setCurrentTime ] = useState<Date>(new Date()); 
    const [ groupsRanges, setGroupsRanges ] = useState<number[][]>([]);
    const [ creator, toggleCreator ] = useReducer(creator => !creator, false);
    const { createGroup, mode} = useContext(TimeTableContext)!;
    // count is number of weeks
    const count = 80;
    const ranges : number[] = new Array(count);
    for (let i = 0; i < count; i++) {
        ranges[i] = i; 
    }
    
    function createRanges() {
        const newGroupsRanges = new Array(groups.length).fill(null).map(() => new Array(count * mode).fill(0));
        setGroupsRanges(newGroupsRanges);
    }
/*
    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentTime(new Date());
        }, 100000); // Update every second
        return () => clearInterval(interval);
    }, []);*/

    useEffect(() => {
        createRanges();
    }, [groups]);

    
    return (
        <>
            <section className="relative h-5/6 bg-neutral-950 rounded flex  ">
                <section className="relative w-1/5 h-full border-r">
                    <div className="h-16 border-b w-full"></div>
                        <Groups/>
                    <div className="pl-4 pt-4">
                        <Creator what="Create new node" handleCreate={createGroup}/>
                    </div>
                </section>
                <section className="relative overflow-x-auto w-4/5 rounded"> 
                    <TimesRanges ranges={ranges}/>
                    <GroupsRanges groupsRanges={groupsRanges}/>
                </section>
            </section> 
        </>
        
    )
}

function TimesRanges({ ranges } : { ranges : number[] }) {
    return ( 
        <div className="w-fit flex h-16">
            {
                ranges.map((val, index) => (
                    <div key={index} className={`w-[140px] border-r border-b `}>
                        {val}
                    </div> 
                ))
            }
        </div>
    )
}

function Groups() {
    const { groups } = useContext(TimeTableContext)!;
    return (
        <div className="border-b border-neutral-400">
            {
                groups.map((group) => (
                    <div key={group.id} className="h-10 w-full pl-4 py-2">
                        {group.name}
                    </div>
                ))
            }
        </div>
    )
}

type Position = {
    x : number,
    y : number
}

function GroupsRanges({ groupsRanges } : { groupsRanges: number[][] }) {
    const [ startPos, setStartPos ] = useState<Position | null>(null);
    const { mode } = useContext(TimeTableContext)!;
    const days = useRef<HTMLDivElement>(null);

    
    function handleMouseDown(event: MouseEvent) {
        //console.log(`[${event.clientX}, ${event.clientY}]`);
        setStartPos({ x : event.clientX, y : event.clientY });
    }

    function handleMouseUp(event: MouseEvent) {
        console.log(`[${event.clientX}, ${event.clientY}]`);
        
    }

    return (
        <div className="border-b border-neutral-400"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={days}
        >
            {groupsRanges.map((groupRange, row) => (
                <div key={row} className="flex" data-row-id={row}>
                    {groupRange.map((value, col) => (
                        <div key={col} data-col-id={col} className={`min-w-[20px] border-r  h-10 ${(col + 1) % mode == 0 ? 'border-neutral-400' : 'border-neutral-600'}`}></div>
                    ))}
                </div>
            ))}
        </div>
    );
}
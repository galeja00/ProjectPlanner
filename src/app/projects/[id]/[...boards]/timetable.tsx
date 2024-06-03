"use client"
import { GroupOfTasks } from "@/app/api/projects/[id]/[board]/route";
import { Head } from "../components/other";
import { createContext, useContext, useEffect, useReducer, useState, MouseEvent, useRef } from "react";
import { Creator } from "./components/creator";
import { CreateButton } from "@/app/components/buttons";
import { group } from "console";

interface TimeTableContextTypes {
    createGroup: (name: string) => void;
    updateGroups: (ranges : Range[]) => void;
    groups : GroupOfTasks[];
    mode : Mode
}

interface RangesContextTypes {
    updateRanges : (ranges : number[][]) => void;
    ranges: number[][];
}
enum Mode {
    Week = 7,
    Month = 31
}

type Range = {
    start: number,
    end: number
}

const TimeTableContext = createContext<TimeTableContextTypes | null>(null);
const RangesContext = createContext<RangesContextTypes | null>(null);

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

    // TODO
    async function createGroup(name : string) {
        const id : string = Math.random().toString();
        const newGroups = [...groups, { id, name, tasks: [], position: groups.length, backlogId: "" }];
        setGroups(newGroups);
    }
    //TODO
    async function updateGroups(groups : Range[]) {
        
    }

    //useEffect(() => { fetchGroups() }, []);
    return (
        <TimeTableContext.Provider value={{ createGroup, updateGroups,  groups, mode }}>
            <section className="overflow-x-hidden h-full max-h-full">
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
    const [ groupsRanges, setGroupsRanges ] = useState<Range[]>(new Array(groups.length).fill(null));
    const [ creator, toggleCreator ] = useReducer(creator => !creator, false);
    const { createGroup, updateGroups, mode} = useContext(TimeTableContext)!;
    // count is number of weeks
    const count = 80;
    const ranges : number[] = new Array(count);
    for (let i = 0; i < count; i++) {
        ranges[i] = i; 
    }
    //TODO: z kazde groupy vzit kdy zacina a kdy konci
    
    /* 
    function createRanges() {
        const newGroupsRanges = new Array(groups.length).fill(null).map(() => new Array(count * mode).fill(0));
        setGroupsRanges(newGroupsRanges);
    }
    */
    function updateRanges(ranges : Range[]) {
        console.log(ranges);
        setGroupsRanges([...ranges]);
    }
/*
    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentTime(new Date());
        }, 100000); // Update every second
        return () => clearInterval(interval);
    }, []);*/
    useEffect(() => {
        updateGroups(groupsRanges);
    }, [ranges])
    
    useEffect(() => {
        if (groups.length > groupsRanges.length) {
            const newRanges : Range[] = new Array(groups.length);
            for (let i = 0; i < groupsRanges.length; i++) {
                newRanges[i] = groupsRanges[i];
            }
            setGroupsRanges([...newRanges]);
        }
    }, [groups]);

    return (
        <>
            <section className="relative h-5/6 bg-neutral-950 rounded flex overflow-y-auto">
                <section className="relative w-1/5 h-full border-r">
                    <div className="h-16 border-b w-full"></div>
                        <Groups/>
                    <div className="pl-2 pt-4">
                        <Creator what="Create new group" handleCreate={createGroup}/>
                    </div>
                </section>
                <section className="relative overflow-x-auto w-4/5 h-max rounded"> 
                    <TimesRanges ranges={ranges}/>
                    <GroupsRanges groupsRanges={groupsRanges} updateRanges={updateRanges}/>
                </section>
            </section> 
        </>
        
    )
}

function TimesRanges({ ranges } : { ranges : number[] }) {
    return ( 
        <div className="w-fit flex h-16 bg-neutral-950">
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
                groups.map((group, row) => (
                    <div key={group.id} className={`h-10 w-full pl-4 py-2 ${row % 2 == 0 ? `bg-neutral-950` : `bg-neutral-900`}`}>
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

type Row = {
    index : number,
    element: Element 
}

type Day = {
    index: number,
    element: Element
}


function getRow(pos : Position, rows : Element[] ) : Row | null {
    for (let i = 0; i < rows.length; i++) {
        let row : DOMRect = rows[i].getBoundingClientRect();
        if (pos.y > row.top && pos.y < row.bottom) {
            return { index: i, element: rows[i]};  
        }
    }
    return null;
}

function getDay(pos : Position, cols : Element[] ) : Day | null {
    //optimalizace vyhledáví v poly elementů pomocí binárního vyhledávání
    let start = 0;
    let end = cols.length - 1;
    while (start <= end) {
        let center = Math.floor((end + start) / 2);
        let col : DOMRect = cols[center].getBoundingClientRect();
        
        if (col.left <= pos.x && col.right >= pos.x) {
            console.log(center);
            return { index: center, element: cols[center] };
        }
        else if (col.left > pos.x) {
            end = center - 1;
        }
        else if (col.right < pos.x) {
            start = center + 1;
        }
    }
    return null;
}

function GroupsRanges({ groupsRanges, updateRanges } : { groupsRanges: Range[], updateRanges : (ranges : Range[]) => void }) {
    const [ active, toggleActive ] = useReducer(active => !active, false);
    const [ activelRow, setRow ] = useState<Row | null>(null);
    const [ startDay, setStartDay ] = useState<Day | null>(null);
    const days = useRef<HTMLDivElement>(null);
    console.log(groupsRanges);
    
    function handleMouseDown(event: MouseEvent) {
        event.preventDefault()
    }

    function handleMouseUp(event: MouseEvent) {
        event.preventDefault();
        if (event.button != 0) return;
        
        const clickPos : Position = { x: event.clientX, y: event.clientY };
        if (!days.current) return;
        const row : Row | null = getRow(clickPos, Array.from(days.current.children));
        if (!row) return;  
        const day : Day | null = getDay(clickPos, Array.from(row.element.children));
        if (!day) return;
        let pos = day.element.getBoundingClientRect();
        if (!active) {
            setRow(row);
            setStartDay(day);
            toggleActive();
            day.element.classList.add("border-purple-600");
            day.element.classList.add("border-4");

        }
        else {
            if (row.index == activelRow?.index && startDay && startDay.index <= day.index) {
                const newRanges = groupsRanges;
                newRanges[row.index] = { start: startDay.index, end: day.index };
                updateRanges(newRanges);
            } 
            startDay?.element.classList.remove("border-purple-600");
            startDay?.element.classList.remove("border-4");
            toggleActive();
        }
        
    }

    function handleContext(event : MouseEvent) {
        event.preventDefault();
        //console.log("aha");
    }

    return (
        <div>
            <div className="border-b w-max h-max border-neutral-400 "
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContext}
            ref={days}
            >
                {groupsRanges.map((groupRange, row) => (
                    <GroupRow groupRange={groupRange} row={row} />
                ))}
            </div>
            <div>

            </div>
        </div>
        
    );
}


function GroupRow({ groupRange , row } : { groupRange : Range, row  : number }) {
    const count = 80 * 7;
    const arr : boolean[] = new Array(count).fill(false);
    if (groupRange) {
        for (let i = groupRange.start; i <= groupRange.end; i++) {
            arr[i] = true
        }
    }
    return (
        <div key={row} className={`flex ${row % 2 == 0 ? `bg-neutral-950` : `bg-neutral-900`} `} data-row-id={row}>
            {arr.map((value, col) => (
                <DisplayRange col={col} value={value}/>
            ))}
        </div>
    )
}


function DisplayRange({ col, value } : { col : number, value : boolean }) {
    const { mode } = useContext(TimeTableContext)!;
    return (
        <div 
            key={col} 
            data-col-id={col} 
            className={`min-w-[20px] border-r h-10 flex items-center ${(col + 1) % mode == 0 ? 'border-neutral-400' : 'border-neutral-700'} cursor-pointer`}
        >
            {value ? <div className=" w-full h-3/6 bg-violet-500"></div> : <div></div>}
        </div>
    )
}
"use client"
import { GroupOfTasks } from "@/app/api/projects/[id]/[board]/route";
import { Head } from "../components/other";
import { createContext, useContext, useEffect, useReducer, useState, MouseEvent, useRef, RefObject } from "react";
import { Creator } from "./components/creator";
import { CreateButton } from "@/app/components/buttons";
import { group } from "console";

enum Mode {
    Week = 7,
    Month = 31
}

type Range = {
    start: number,
    end: number
}

type GroupRange = {
    range : Range,
    next : GroupRange[],
    prev : GroupRange[]
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

enum UserMode {
    Creating = 1,
    Moving = 2,
    Connecting = 3
}

enum ConnectType {
    from = 1,
    to = 2
}

interface TimeTableContextTypes {
    createGroup: (name: string) => void;
    updateGroups: (ranges : GroupRange[]) => void;
    groups : GroupOfTasks[];
    mode : Mode;
}

interface RangesContextTypes {
    changeMode: (mode : UserMode) => void;
    updateRanges: (ranges : GroupRange[]) => void;
    userMode: UserMode;
    ranges: GroupRange[];
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
    async function updateGroups(groups : GroupRange[]) {
        
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
    const [ groupsRanges, setGroupsRanges ] = useState<GroupRange[]>(new Array(groups.length).fill(null));
    const [ creator, toggleCreator ] = useReducer(creator => !creator, false);
    const { createGroup, updateGroups, mode} = useContext(TimeTableContext)!;
    // count is number of weeks
    const count = 80;
    const ranges : number[] = new Array(count);
    for (let i = 0; i < count; i++) {
        ranges[i] = i; 
    }
    //TODO
    /* 
    function createRanges() {
        const newGroupsRanges = new Array(groups.length).fill(null).map(() => new Array(count * mode).fill(0));
        setGroupsRanges(newGroupsRanges);
    }
    */
    function updateRanges(ranges : GroupRange[]) {
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
            const newRanges : GroupRange[] = new Array(groups.length);
            for (let i = 0; i < groupsRanges.length; i++) {
                newRanges[i] = groupsRanges[i];
            }
            setGroupsRanges([...newRanges]);
        }
    }, [groups]);

    return (
        <>
            <section className=" h-5/6 bg-neutral-950 rounded flex overflow-y-auto">
                <section className="relative w-1/5 h-full border-r">
                    <div className="h-16 border-b w-full"></div>
                        <Groups/>
                    <div className="pl-2 pt-4">
                        <Creator what="Create new group" handleCreate={createGroup}/>
                    </div>
                </section>
                <section className=" overflow-x-auto w-4/5 h-max rounded"> 
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
                    <div key={index} className={`w-[105px] border-r border-b `}>
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



function GroupsRanges({ groupsRanges, updateRanges } : { groupsRanges: GroupRange[], updateRanges : (ranges : GroupRange[]) => void }) {
    const [ userMode, setUserMode ] = useState<UserMode>(UserMode.Creating);
    const [ active, toggleActive ] = useReducer(active => !active, false);
    const [ activelRow, setRow ] = useState<Row | null>(null);
    const [ startDay, setStartDay ] = useState<Day | null>(null);
    const days = useRef<HTMLDivElement>(null);

    function changeMode(mode : UserMode) {
        if (mode != userMode) {
            setUserMode(mode);
            return;
        }
    }

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        
        if (event.button != 0) return;
        const clickPos : Position = { x: event.clientX, y: event.clientY };
        if (!days.current) return;
        const row : Row | null = getRow(clickPos, Array.from(days.current.children));
        if (!row) return;
        if (groupsRanges[row.index] != null) return;  
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
                const range : Range = {start: startDay.index, end: day.index}
                newRanges[row.index] = { range: range, next: [], prev: []};
                updateRanges(newRanges);
            } 
            startDay?.element.classList.remove("border-purple-600");
            startDay?.element.classList.remove("border-4");
            toggleActive();
        }
        
    }

    function handleContext(event : MouseEvent) {
        event.preventDefault();
    }

    return (
        <RangesContext.Provider value={{ changeMode, updateRanges, userMode, ranges: groupsRanges }}>
            <div className="">
                <div className="border-b relative  w-max h-max border-neutral-400 "
                onClick={handleClick}
                onContextMenu={handleContext}
                ref={days}
                >
                    {groupsRanges.map((groupRange, row) => (
                        <GroupRow row={row} />
                    ))}
                {days && <WorkRanges days={days} groupsRange={groupsRanges} />}</div>
            </div>
        </RangesContext.Provider>
    );
}



function GroupRow({ row } : { row  : number }) {
    const count = 80 * 7;
    const arr : boolean[] = new Array(count).fill(false);
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
            className={`min-w-[15px] border-r h-10 flex items-center ${(col + 1) % mode == 0 ? 'border-neutral-400' : 'border-neutral-700'} cursor-pointer`}
        >
        </div>
    )
}

type WorkRangesFuncs = {
    handleGrap : (event: MouseEvent, range : GroupRange) => void,
    handleMove : (event: MouseEvent) => void,
    handleDrop : (event: MouseEvent) => void 
}

function WorkRanges({days, groupsRange} : { days : RefObject<HTMLDivElement>, groupsRange : GroupRange[]}) {
    if(!days.current) {
        return (
            <></>
        )
    }

    const rows : Element[] = Array.from(days.current.children);
    const parent = days.current.getBoundingClientRect();
    return (
        <div className="w-fit h-fit">
        {
            groupsRange.map((range, i) => {
                if (range == null) {
                    return <></>
                }
                return (
                    <WorkRange parent={parent} groupRange={range} index={i} rows={rows} />
                )
            })
        }
        </div>
    )
}



function WorkRange({ parent, groupRange, index, rows } : { parent : DOMRect, groupRange : GroupRange, index : number, rows: Element[]}) {
    const [ isGrabed, toggleGrab ] = useReducer(isGraped => !isGraped, false);
    const [ range, setRange ] = useState<Range>(groupRange.range);
    const [ movPos, setMovPos ] = useState<Position | null>(null); 
    const { changeMode, updateRanges, userMode, ranges } = useContext(RangesContext)!;

    function handleConnect(type : ConnectType) {
        if (userMode != UserMode.Connecting) {
            changeMode(UserMode.Connecting);
            return;
        }  
    }

    function handleGrap(event: MouseEvent) {
        if (!isGrabed) {
            changeMode(UserMode.Moving);
            toggleGrab();
            setMovPos({ x: event.clientX, y: event.clientY });
        }
    }

    function handleMove(event: MouseEvent) {
        if (isGrabed && movPos) {
            const pos : Position = { x: event.clientX, y: event.clientY };
            const row = rows[index];
            const widthDay = row.children[0].getBoundingClientRect().width;
            const difference = pos.x - movPos.x;
            if (Math.abs(difference) % widthDay == 0) {
                if (range.start + difference / widthDay < 0) {
                    range.start = 0;
                    range.end = groupRange.range.end - groupRange.range.start;
                } else {
                    range.start += difference / widthDay;
                    range.end += difference / widthDay;
                }   
                setRange(range);
                setMovPos(pos);
            }
        }
    }

    function handleDrop(event: MouseEvent) {
        if (isGrabed) {
            ranges[index].range = range;
            updateRanges(ranges);
            toggleGrab();
            setMovPos(null);
            changeMode(UserMode.Creating);
        }
    }

    let boxs : Element[] = Array.from(rows[index].children);
    const row = rows[index].getBoundingClientRect();
    const startbox = boxs[range.start].getBoundingClientRect();
    const endbox = boxs[range.end].getBoundingClientRect();
    return (
        <div 
            className={`bg-violet-500 absolute z-100 rounded border bg-opacity-70 flex justify-between  ${isGrabed ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseDown={handleGrap}
            onMouseUp={handleDrop}
            onMouseMoveCapture={handleMove}
            onMouseLeave={handleDrop}
            style={{ 
                height: startbox.height / (3 / 2),
                left: startbox.left - row.left,
                top: startbox.top - parent.top + startbox.height / 6,
                width: endbox.right - startbox.left  
            }}
        >
            <ConnectRangeButton active={false} type={ConnectType.to} onClick={() => handleConnect(ConnectType.to)}/>
            <ConnectRangeButton active={false} type={ConnectType.from} onClick={() => handleConnect(ConnectType.from)}/>
        </div>
    )
}



function ConnectRangeButton({active, type, onClick} : {active : boolean, type : ConnectType, onClick : () => void}) {
    return (
        <div className={`hover:bg-opacity-100 hover:bg-violet-400  w-6 h-full bg-violet-700 ${active ? "bg-opacity-100 bg-violet-400" : "bg-opacity-80"} border-${type == ConnectType.to ? "r" : "l"} cursor-pointer`} onClick={onClick}></div>
    )
}
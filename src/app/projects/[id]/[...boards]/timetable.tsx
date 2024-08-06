"use client"
import { TimeTableGroup } from "@/app/api/projects/[id]/[board]/route";
import { Head } from "../components/other";
import { createContext, useContext, useEffect, useReducer, useState, MouseEvent, TouchEvent, useRef, RefObject, ChangeEvent } from "react";
import { Creator } from "./components/creator";
import { Dialog, DialogClose } from "@/app/components/dialog";
import { formatDate, formatDate2, fromDayToMills, getDiffInDays } from "@/date";
import { AddGroupToTimeTable } from "./components/groups";
import { TasksGroup } from "@prisma/client";
import { BoardsTypes } from "@/app/api/projects/[id]/[board]/board";
import { InitialLoader } from "@/app/components/other-client";
import { ErrorBoundary, ErrorState, useError } from "@/app/components/error-handler";
import { ButtonWithImg, ButtonWithText } from "@/app/components/buttons";

// here is components for TimeTable (basic Grant diagram)

// modes for Timetable week or month
// now only for week month not implenetd
enum Mode {
    Week = 7,
    Month = 31
}

// < start, end > 
type Range = {
    start: number,
    end: number
}

// range bude fith Object Date < start, end >
type DateRange = {
    start : Date,
    end : Date
}

// type for object for Range for group with posiiblity to connect with other ranges
// connection not implemented but it is possible to add
type GroupRange = {
    range : Range,
    next : GroupRange[],
    prev : GroupRange[]
}

// all info neded for working with groups range on front end (move, add, remove)
type RangeInfo = {
    groupRange: GroupRange,
    group: TimeTableGroup,
    index: number
}

// for finding place and clicks of user
type Position = {
    x : number,
    y : number
}

// to save row where user clicket
type Row = {
    index : number,
    element: Element 
}

// to save day where user clicket
type Day = {
    index: number,
    element: Element
}

// user mode when user is creating new range, moving with range and connecting (not implemented)
enum UserMode {
    Creating = 1,
    Moving = 2,
    Connecting = 3
}

//
enum ConnectType {
    from = 1,
    to = 2
}

// for easy acces for components to use of basic function in timetable
interface TimeTableContextTypes {
    createGroup: (name: string) => void;
    updateGroups: (ranges : GroupRange[]) => void;
    projectStart: Date;
    currentDate: Date;
    groups : TimeTableGroup[];
    mode : Mode;
}

// for easy acces to range functions
interface RangesContextTypes {
    changeUserMode: (mode : UserMode) => void;
    updateRanges: (ranges : GroupRange[]) => void;
    openRangeMenu: (groupRange : GroupRange, index : number) => void;
    userMode: UserMode;
    ranges: GroupRange[];
}

// init Contexts
const TimeTableContext = createContext<TimeTableContextTypes | null>(null);
const RangesContext = createContext<RangesContextTypes | null>(null);

// default component
export default function TimeTable({ id } : { id : string }) {
    const [ groups, setGroups] = useState<TimeTableGroup[]>([]);
    const [ mode, setMode ] = useState<Mode>(Mode.Week);
    const [ projectStart, setProjectStart ] = useState<Date | null>(null);
    const [ currentDate, setCurrentDate ] = useState<Date>(new Date()); 
    const [ isAdding, toggleAdding ] = useReducer(isAdding => !isAdding, false);
    const { submitError } = useError();

    // get all basic data from REST-API like groups and start of project
    async function fetchGroups() {
        try {
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.TimeTable}`, {
                method: "GET"
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message);
                return;
            }
            setProjectStart(new Date(data.start.toString()));
            setGroups([...data.groups]);
        }
        catch (error) {
            console.error(error);
            submitError(error, fetchGroups); 
        } 
    }

    // thrue REST API create new group
    async function createGroup(name : string) {
        if (name.length == 0) {
            submitError("Your input for name of Group is empty", () => createGroup(name));
            return;
        }
        try {
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.TimeTable}/group/create`, {
                method: "POST",
                body: JSON.stringify({
                    name: name
                })
            })
            
            if (res.ok) {
                const { group } : { group : TasksGroup } = await res.json();
                const newGroup = { id: group.id, timeTableId: group.timeTableId ?? "", name: group.name, position: group.position, startAt: group.startAt, deadlineAt: group.deadlineAt };
                const newGroups : TimeTableGroup[] = [...groups, newGroup ];
                setGroups([...newGroups]);
                return;
            }
            const data = await res.json();
            throw new Error(data.message);
        }
        catch (error) {
            console.error(error); 
            submitError(error, () => createGroup(name)); 
        } 
    }

    // update for grooup Dates (range - < startAt, deadlineAt >)
    async function submitGroupDates(group : TimeTableGroup)  {
        try {
            const res = await fetch(`/api/projects/${id}/${BoardsTypes.TimeTable}/group/dates`, {
                method: "POST",
                body: JSON.stringify({
                    id: group.id,
                    startAt: group.startAt,
                    endAt: group.deadlineAt
                })
            })
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message);
            } 
            fetchGroups();
        }   
        catch (error) {
            console.error(error);
            submitError(error, () => submitGroupDates(group));
        } 
    
    }
    // function for update groubs from Groubs Ranges
    // GroupRanges convert to Timatable object and find diference -> update
    // only update <startAt,deadlineAt> not names and other date
    function updateGroups(groupsRanges : GroupRange[]) {
        if (!projectStart) return null;
        const toUpdate : TimeTableGroup[] = []; // init groups need to be updated
        // trying to find diference if exist -> update
        for (let i = 0; i < groups.length; i++) {
            const groupRange = convertGroupToRange(groups[i], projectStart);
            if (groupsRanges[i]) {
                if (!groupRange || !isEqualRanges(groupRange.range, groupsRanges[i].range)) {
                    toUpdate.push(updateGroupDates(groups[i], groupsRanges[i].range, projectStart));
                } 
            } else if (groupRange && !groupsRanges[i]) {
                toUpdate.push({ id: groups[i].id, name: groups[i].name, timeTableId: groups[i].id, startAt: null, deadlineAt: null, position: groups[i].position});
            }
        }
        // submiting groups to BackEnd
        for (const toUp of toUpdate) {
            submitGroupDates(toUp);
        }
        //updating state of groups on FrontEnd
        const newGroups = groups.map(group => {
            const updatedGroup = toUpdate.find(gUp => gUp.id === group.id);
            return updatedGroup ? updatedGroup : group;
        });
        setGroups([...newGroups]);
    }

    function handleAdd() {
        toggleAdding();
    }

    // timer for updating actual date
    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentDate(new Date());
        }, 1000 * 60 * 60); // Update every hour
        return () => clearInterval(interval);
    }, []);

    // init fetch of data
    useEffect(() => { fetchGroups() }, []);

    // loading information
    if (!projectStart) {
        return (
            <InitialLoader/>
        )
    }

    return (
        <>
            <TimeTableContext.Provider value={{ createGroup, updateGroups, currentDate,  groups, mode, projectStart }}>
                <section className="overflow-x-hidden h-full max-h-full ">
                    <Head text='Time Table'/>
                    <div className="mb-2">
                        <ButtonWithImg onClick={()=>handleAdd()} alt="Add" image="/plus.svg" title="Add Existing Group"/>
                    </div>
                    <Table/>
                </section>
                { isAdding && <AddGroupToTimeTable projectId={id} groups={groups} handleClose={toggleAdding} submitGroups={fetchGroups}/>}
            </TimeTableContext.Provider>
        </>
    )
}

// Menu for timemods not implemented in final version
/*
function TimeMode({ mode, changeMode } : { mode : Mode, changeMode : (mode : Mode) => void }) {
    return (
        <div className="fixed m-4 z-50 right-0 bottom-0 bg-neutral-200 rounded w-50 flex">
            <button onClick={() => changeMode(Mode.Week)} className={`py-2 w-16 hover:bg-violet-600 rounded ${mode == Mode.Week ? "border border-violet-600" : ""}`}>Week</button>
            <button onClick={() => changeMode(Mode.Month)} className={`py-2 w-16 hover:bg-violet-600 rounded ${mode == Mode.Month ? "border border-violet-600" : ""}`}>Month</button>
        </div>
    )
}
*/

// default component to convert groups and devide to smaller components for bigger abstraction
function Table() {
    const { createGroup, updateGroups, currentDate, groups, projectStart } = useContext(TimeTableContext)!;
    const [ groupsRanges, setGroupsRanges ] = useState<GroupRange[]>(convertGroupsToRanges(groups, projectStart));
    const [ count , setCount ] = useState<number>(80); // count - number of weeks displayed on timetable

    function updateRanges(ranges : GroupRange[]) {
        updateGroups(ranges);
        setGroupsRanges([...ranges]);
    }
    
    // chack if timetable is big enough if not will double count
    useEffect(() => {
        const currentDay = getDiffInDays(projectStart, currentDate);
        if (currentDay * 2 > count) setCount(count * 2);
    }, [currentDate])
    
    // convert group to GroupRange on every update on group or in init phase
    useEffect(() => {
        setGroupsRanges(convertGroupsToRanges(groups, projectStart));
    }, [groups, currentDate]);

    return (
        <>
            <section className=" h-5/6 bg-neutral-200 rounded flex overflow-y-auto relative">
                <section className="relative w-1/5 h-full border-r border-neutral-600">
                    <div className="h-16 border-b border-neutral-600 w-full"></div>
                        <Groups/>
                    <div className="pl-2 pt-4">
                        <Creator what="Create new group" handleCreate={createGroup}/>
                    </div>
                </section>
                <section className="overflow-x-auto w-4/5 h-max rounded"> 
                    <TimesRanges range={count}/>
                    <GroupsRanges groupsRanges={groupsRanges} updateRanges={updateRanges} count={count}/>
                </section>
            </section> 
        </>
        
    )
}

// component with displaing info about weeks on timetable 
// each 7 columns represent week
// need to be edditet to support mouths
function TimesRanges({ range } : { range : number }) {
    const { projectStart } = useContext(TimeTableContext)!;
    const renderDivs = () => {
        const divs = [];
        for (let i = 0; i < range; i++) {
            const actualDate : Date = new Date(projectStart);
            actualDate.setDate(actualDate.getDate() + (i * 7));

            const endDate : Date = new Date(actualDate);
            endDate.setDate(actualDate.getDate() + 6);
            divs.push(
                <div key={i} className="w-[105px] border-r border-b border-neutral-600 flex flex-col items-center">
                    <div className="w-fit">
                        {i + 1} week
                    </div>
                    <DisplayDate date={actualDate}/>
                    <DisplayDate date={endDate}/>
                </div>
            );
        }
        return divs;
    };

    return ( 
        <div className="w-fit flex h-16 bg-neutral-200">
            {renderDivs()}
        </div>
    )
}

function DisplayDate({ date } : { date : Date}) {
    return (
        <div className="w-fit text-sm text-neutral-600">
            {formatDate(date)}
        </div>
    )
}

// display names of groups in rows
// each row represents a group
function Groups() {
    const { groups } = useContext(TimeTableContext)!;
    return (
        <div className="border-b border-neutral-600">
            {
                groups.map((group, row) => (
                    <div key={group.id} className={`h-10 w-full pl-4 py-2 ${row % 2 == 0 ? `bg-neutral-200` : `bg-neutral-100`}`}>
                        {group.name}
                    </div>
                ))
            }
        </div>
    )
}

// get row from coordinates on board
function getRow(pos : Position, rows : Element[] ) : Row | null {
    for (let i = 0; i < rows.length; i++) {
        let row : DOMRect = rows[i].getBoundingClientRect();
        if (pos.y > row.top && pos.y < row.bottom) {
            return { index: i, element: rows[i]};  
        }
    }
    return null;
}

// get day from coordinates on board
function getDay(pos : Position, cols : Element[] ) : Day | null {
    //optimalizace vyhledáví v poly elementů pomocí binárního vyhledávání
    let start = 0;
    let end = cols.length - 1;
    while (start <= end) {
        let center = Math.floor((end + start) / 2);
        let col : DOMRect = cols[center].getBoundingClientRect();
        
        if (col.left <= pos.x && col.right >= pos.x) {
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

// components with have inside matrix of divs
function GroupsRanges({ groupsRanges, updateRanges, count } : { groupsRanges: GroupRange[], updateRanges : (ranges : GroupRange[]) => void, count : number }) {
    const [ userMode, setUserMode ] = useState<UserMode>(UserMode.Creating); // state of what user is doing on table
    const [ rangeInfo, setRangeInfo ] = useState<RangeInfo | null>(null); // for popup
    const [ active, toggleActive ] = useReducer(active => !active, false);
    const [ activeRow, setRow ] = useState<Row | null>(null); // actual row where user moving or creating Range
    const [ startDay, setStartDay ] = useState<Day | null>(null); // info about first click of user when is creating new range
    const { groups, projectStart, currentDate } = useContext(TimeTableContext)!
    const days = useRef<HTMLDivElement>(null);

    function changeUserMode(mode : UserMode) {
        if (mode != userMode) {
            setUserMode(mode);
            return;
        }
    }
    // handler to find where user clicket on board
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
            if (row.index == activeRow?.index && startDay && startDay.index <= day.index) {
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

    function openRangeMenu(groupRange: GroupRange, index: number) {
        setRangeInfo({ groupRange: groupRange, group: groups[index], index: index });
    }

    function removeRange(rangeInfo : RangeInfo) {
        const newGroupsRanges : GroupRange[] = new Array(groupsRanges.length);
        for (let i = 0; i < groupsRanges.length; i++) {
            if (rangeInfo.index != i) {
                newGroupsRanges[i] = groupsRanges[i]; 
            }
        }
        updateRanges(newGroupsRanges);
    }

    return (
        <RangesContext.Provider value={{ changeUserMode, updateRanges, openRangeMenu, userMode, ranges: groupsRanges }}>
            <div className="">
                <div className="border-b relative  w-max h-max border-neutral-600 "
                onClick={handleClick}
                ref={days}
                >
                    {groupsRanges.map((groupRange, row) => (
                        <GroupRow key={row} row={row} size={count} current={getDiffInDays(projectStart, currentDate)} />
                    ))}
                {days && <WorkRanges days={days} groupsRange={groupsRanges} />}
                </div>
            </div>
            { rangeInfo && <RangeMenu rangeInfo={rangeInfo} closeMenu={() => setRangeInfo(null)} removeRange={() => removeRange(rangeInfo)}/>}
        </RangesContext.Provider>
    );
}

// displaying all divs for easy find where ranges are or where user start or end creating range
function GroupRow({ row, size, current } : { row  : number, size : number, current : number }) {
    const count =  size * 7;
    const arr : boolean[] = new Array(count).fill(false);
    return (
        <div key={row} className={`flex ${row % 2 == 0 ? `bg-neutral-200` : `bg-neutral-100`} `} data-row-id={row}>
            {arr.map((value, col) => (
                <DisplayRange key={col} col={col} current={current == col}/>
            ))}
        </div>
    )
}

// displaying small divs (days)
function DisplayRange({ col, current } : { col : number, current : boolean }) {
    const { mode } = useContext(TimeTableContext)!;
    return (
        <div 
            key={col} 
            data-col-id={col} 
            className={`min-w-[15px] border-r h-10 flex items-center ${(col + 1) % mode == 0 ? 'border-neutral-950' : 'border-neutral-400'} ${(current ? " bg-orange-400 bg-opacity-60" : "")} `}
        >
        </div>
    )
}

// pop up menu for user to edit date of range by keyboard
function RangeMenu({rangeInfo, closeMenu, removeRange} : {rangeInfo : RangeInfo, closeMenu : () => void, removeRange : () => void}) {
    const [len, setLen] = useState<number>(rangeInfo.groupRange.range.end -  rangeInfo.groupRange.range.start);
    const { ranges, updateRanges } = useContext(RangesContext)!;
    const { projectStart } = useContext(TimeTableContext)!;
    
    // handle and convert date to range for edit of len of GroupRange
    function handleChange(event : ChangeEvent<HTMLInputElement>, name : string) {
        event.preventDefault();
        let date = new Date(event.currentTarget.value);
        let val = getDiffInDays(projectStart, date) + 1;
        if (isNaN(val) || val < 0) {
            return;
        }
        let prevEnd = rangeInfo.groupRange.range.end;
        let prevStart = rangeInfo.groupRange.range.start;
        if (name == "start") {
            if (prevEnd < val) return;
            rangeInfo.groupRange.range.start = val;
        } else {
            if (prevStart > val) return;
            rangeInfo.groupRange.range.end = val;
        }
        ranges[rangeInfo.index] = rangeInfo.groupRange;
        setLen(rangeInfo.groupRange.range.end - rangeInfo.groupRange.range.start);
        updateRanges([...ranges]);
    }

    const dates : DateRange =  convertRangeToDates(rangeInfo.groupRange.range, projectStart);
    return (
        <Dialog>
            <div className="w-max h-max bg-neutral-200 rounded flex flex-col relative p-4 gap-4">
                <DialogClose handleClose={closeMenu}/>
                <h2>{rangeInfo.group.name}</h2>
                <section className="space-y-2">
                    <h3 className="text-sm text-neutral-400">range:</h3>
                    <div  className="grid grid-cols-2 gap-2">
                        <label htmlFor="start">start day:</label>
                        <input type="date" id="start" name="start" value={formatDate2(dates.start)}  onChange={(event) => handleChange(event, "start")} className="bg-neutral-100 rounded px-2 py-1"></input>
                        <label htmlFor="end">end day:</label>
                        <input type="date" id="end" name="end" value={formatDate2(dates.end)} onChange={(event) => handleChange(event, "end")} className="bg-neutral-100 rounded px-2 py-1"></input>
                    </div>
                    <div>length in days: {len}</div>
                    <div className="flex justify-end">
                        <ButtonWithText text="Delete" type="destructive" handle={removeRange}/>
                    </div>
                </section>
            </div>
        </Dialog>
    )
}

// maps or GroupsRanges on table
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
                    return <div key={i}></div>
                }
                return (
                    <WorkRange key={i} parent={parent} groupRange={range} index={i} rows={rows} />
                )
            })
        }
        </div>
    )
}

function WorkRange({ parent, groupRange, index, rows }: { parent: DOMRect, groupRange: GroupRange, index: number, rows: Element[] }) {
    const [isGrabed, toggleGrab] = useReducer(isGraped => !isGraped, false);
    const [range, setRange] = useState<Range>(groupRange.range);
    const [startPos, setStartPos] = useState<Position | null>(null);
    const [position, setPosition] = useState<Position | null>(null); 
    const { changeUserMode, updateRanges, openRangeMenu, ranges } = useContext(RangesContext)!;
  
    function handleMouseGrap(event: MouseEvent) {
      if (!isGrabed && event.button !== 2) {
        submitGrap({ x: event.clientX, y: event.clientY });
      }
    }
  
    function handleTouchGrap(event: TouchEvent) {
      if (!isGrabed) {
        submitGrap(convertTouchToPos(event));
      }
    }
  
    function submitGrap(pos: Position) {
      changeUserMode(UserMode.Moving);
      toggleGrab();
      setStartPos(pos);
      setPosition(pos);
    }
  
    function handleTouchMove(event: TouchEvent) {
      handleMove(convertTouchToPos(event));
    }
  
    function handleMouseMove(event: MouseEvent) {
      handleMove({ x: event.clientX, y: event.clientY });
    }
  
    function handleMove(pos: Position) {
      if (isGrabed && startPos) {
        setPosition(pos); 
      }
    }
  
    function handleDrop() {
      if (isGrabed) {
        const row = rows[index];
        const widthDay = row.children[0].getBoundingClientRect().width;
        const difference = position!.x - startPos!.x;
        const shift = Math.round(difference / widthDay);
  
        setRange(prevRange => {
          const newRange = { ...prevRange };
  
          if (newRange.start + shift < 0) {
            newRange.end -= newRange.start;
            newRange.start = 0;
          } else {
            newRange.start += shift;
            newRange.end += shift;
          }
  
          return newRange;
        });
  
        ranges[index].range = range;
        updateRanges(ranges);
        toggleGrab();
        setStartPos(null);
        setPosition(null); 
        changeUserMode(UserMode.Creating);
      }
    }
  
    function handleMenu(event: MouseEvent) {
      event.preventDefault();
      openRangeMenu(groupRange, index);
    }
  
    if (!rows[index]) {
      return null;
    }
  
    const boxs: Element[] = Array.from(rows[index].children);
    const row = rows[index].getBoundingClientRect();
    const startbox = boxs[range.start].getBoundingClientRect();
    const endbox = boxs[range.end].getBoundingClientRect();
  
    let currentLeft = position && startPos ? position.x - startPos.x + (startbox.left - row.left) : startbox.left - row.left;
    //currentLeft = currentLeft < row.left ? row.left : currentLeft;
  
    return (
      <div
        className={`bg-violet-500 absolute z-100 rounded border border-neutral-600 bg-opacity-70 flex justify-between ${isGrabed ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseGrap}
        onMouseUp={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleDrop}
        onContextMenu={handleMenu}
        onTouchStart={handleTouchGrap}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDrop}
        style={{
          height: startbox.height / (3 / 2),
          left: currentLeft,
          top: startbox.top - parent.top + startbox.height / 6,
          width: endbox.right - startbox.left
        }}
      >
      </div>
    );
  }

// convertor Group -> GroupRange
function convertGroupToRange(group : TimeTableGroup, start : Date) : GroupRange | null {
    if (group.startAt && group.deadlineAt) {
        const range : Range = {start: getDiffInDays(start, new Date(group.startAt)), end: getDiffInDays(start, new Date(group.deadlineAt))};
        return {range: range, next: [], prev: []};
    }
    return null;
}

function convertGroupsToRanges(groups : TimeTableGroup[], projectStart : Date) : GroupRange[] {
    const newRanges : GroupRange[] = new Array(groups.length);
    let i = 0;
    while (i < groups.length) {
        const newR = convertGroupToRange(groups[i], projectStart);
        if (newR) {
            newRanges[i] = newR;
        } else {
            newRanges[i] = newRanges[i];
        }
        i++;
    }
    return newRanges;
}

// from Range update Group dates < startAt, deadlineAt >
function updateGroupDates(group : TimeTableGroup, range : Range, start : Date) : TimeTableGroup {
    const newDates = convertRangeToDates(range, start); 
    const startAt = newDates.start;
    const endAt = newDates.end;
    return { id: group.id, timeTableId: group.timeTableId, name: group.name, startAt: startAt, deadlineAt: endAt, position: group.position };
}



// converting number in Range to actual Date
function convertRangeToDates(range : Range, start : Date) : DateRange {
    const startAt = new Date(start.getTime() + fromDayToMills(range.start));
    const endAt = new Date(start.getTime() + fromDayToMills(range.end));
    return { start: startAt, end: endAt };
} 

// compering to Ranges
function isEqualRanges(a : Range, b : Range) {
    return a.start == b.start && a.end == b.end;
}

function convertTouchToPos(event : TouchEvent) : Position {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
}


"use client"

import { useEffect, useReducer, useState, ChangeEvent, createContext, useContext } from "react";
import Image from 'next/image' 
import { Task, Ranking } from "@prisma/client";
import { Dialog, DialogClose } from "@/app/components/dialog";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";
import { Name } from "./other-client";
import { BoardsTypes } from "@/app/api/projects/[id]/[board]/board";
import { MemberTableInfo } from "@/app/api/projects/[id]/members/route";
import { LoadingOval } from "@/app/components/other";
import { TeamBadge } from "./other";
import { useError } from "@/app/components/error-handler";
import { NodeInfo } from "@/app/api/nodes/static";
import { NoteComponent, NoteCreator } from "@/app/notes/notes";
import { ArrayButtons, Button, ButtonSideText, ButtonType, Lighteness } from "@/app/components/buttons";
import { InitialLoader } from "@/app/components/other-client";

enum SolverFuncs {
    Add = "add",
    Remove = "Remove"
}


type TeamInfo = {
    id : string,
    name: string,
    color: string | null
    taskLoad: number
}

// interface for context of task-info component
interface TaskInfoContextTypes {
    task : Task,
    team : TeamInfo| null,
    solvers: Solver[],
    changeTeam: (team : TeamInfo ) => void,
    changeSolvers: (funcs : SolverFuncs, memberId : string) => void,
    submitError: (error : unknown, repeatFunc : () => void) => void
}

const TaskInfoContext = createContext<TaskInfoContextTypes | null>(null);

// initial component, handl fetching basic data and sumbiting
export function TaskInfo({ id, projectId, handleClose, submitTask } : { id : string, projectId : string, handleClose : () => void, submitTask : (task : Task) => void}) {
    const [ task, setTask ] = useState<Task | null>(null);
    const [ solvers, setSolvers ] = useState<Solver[]>([]); 
    const [ team, setTeam ] = useState<TeamInfo | null>(null); 
    const { submitError } = useError(); 

    // fecth informations about task
    async function fetchInfo() {
        try {
            const res = await fetch(`/api/projects/${projectId}/task/${id}/info`, {
                method: "GET"
            })

            const data = await res.json();
            if(!res.ok) {
                throw new Error(data.error);
            }
            setTask(data.taskInfo.task);
        }
        catch (error) {
            console.error(error);
            submitError(error, fetchInfo);
        }
    }

    // fecth all solvers of task
    async function fetchSolvers() {
        if (!task) {
            return;
        } 
        try {
            const res = await fetch(`/api/projects/${projectId}/task/${task.id}/solver`, {
                method: "GET",
            }); 
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
                return;
            }

            setSolvers(data.solvers);
        }
        catch (error) {
            console.error(error);
            submitError(error,  fetchSolvers);
        }
    }

    // submit new solver to server
    async function addSolver(memberId : string) {
        //task.projectMemberId =  memberId;
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.Board}/task/solver/add`, {
                method: "POST",
                body: JSON.stringify({
                    task: task,
                    memberId: memberId
                })
            })
        
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
                return;
            }
            fetchSolvers();
        }
        catch (error) {
            console.error(error);
            submitError(error, () => addSolver(memberId));
        }
        
    }

    // remove solver from solving a task
    async function delSolver(memberId : string) {
        try {
            const res = await fetch(`/api/projects/${projectId}/${BoardsTypes.Board}/task/solver/remove`, {
                method: "POST",
                body: JSON.stringify({
                    task: task,
                    memberId: memberId
                })
            })
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            fetchSolvers();
        }
        catch (error) {
            console.error(error);
            submitError(error,() => delSolver(memberId));
        }
    }

    // get informations about a team
    async function fetchTeam() {
        if (!task || !task.teamId) {
            return;
        } 
        try {
            const res = await fetch(`/api/projects/${projectId}/team/${task.teamId}/info`, {
                method: "GET"
            })

            const data = await res.json(); 
            if (!res.ok) {
                throw new Error(data.error);
            }

            setTeam(data.team);
        }
        catch (error) {
            console.error(error);
            submitError(error, fetchTeam);
        }
    }

    function updateAndClose(task : Task) {
        submitTask({...task});
        handleClose();
    }

    function updateTask(task : Task) {
        setTask({...task});
        submitTask(task);
    }

    function changeTeam(team : TeamInfo) {
        if (!task) {
            return;
        }
        if (task.teamId == team.id) {
            task.teamId = null;
            setTeam(null);
        } else {
            task.teamId = team.id;
            setTeam({...team});
        }
        updateTask(task);
    }

    function changeSolvers(func : SolverFuncs, memberId : string) {
        if (func == SolverFuncs.Add) {
            addSolver(memberId);
        }
        else {
            const solver = solvers.find((sol) => sol.memberId == memberId);
            if (!solver) return;
            delSolver(memberId);
        }
    }
 
    useEffect(() => {
        fetchInfo();
    }, []);

    useEffect(() => {
        fetchSolvers();
        fetchTeam();
    }, [task])

    return (
        <Dialog>
            <div className='bg-neutral-200 rounded w-[80rem] h-fit overflow-hidden relative'>
                { task 
                    ?
                    <TaskInfoContext.Provider value={{task, team, solvers, changeTeam, changeSolvers, submitError}}>
                        <HeaderContainer task={task} projectId={projectId} handleClose={() => updateAndClose(task)} updateTask={updateTask}/>
                        <div className='grid grid-cols-3 h-full'>
                            <MainInfoContainer task={task} updateTask={updateTask}/>
                            <section className='py-2 px-4  flex flex-col gap-4'>
                                <Data task={task} updateTask={updateTask}/>
                                <Solvers solvers={solvers} team={team}/>
                            </section>
                        </div>
                    </TaskInfoContext.Provider>
                    :
                    <div className="h-60 w-full flex justify-center items-center">
                        <LoadingOval/>
                        <DialogClose handleClose={handleClose}/>
                    </div>
                }
            </div>
        </Dialog>
    ) 
}  

// HEADER PART //

function HeaderContainer(
    {task, projectId, handleClose, updateTask } : 
    {task : Task, projectId : string,  handleClose : () => void, updateTask : (task : Task) => void}) { 
    function updateName(name : string) {
        task.name = name;
        updateTask(task);
    }

    return (
        <section className='px-6 py-4 border-b border-neutral-400 relative '>
            <Name name={task.name} updateName={updateName}/>
            <DialogClose handleClose={handleClose}/>
        </section>
    )
}

// MAIN INFRMATIONS

enum TypeOfInfo {
    description = "Description",
    issues = "Issues",
    notes = "Notes",
    settings = "Settings"
}

//  conteiner of main informations about task and handle menu click
function MainInfoContainer({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    const menuItems : TypeOfInfo[] = [TypeOfInfo.description, TypeOfInfo.notes, TypeOfInfo.settings];
    const [actualTypeInfo, setActualInfoType] = useState<TypeOfInfo>(TypeOfInfo.description);
    const [actualInfo, setActualInfo] = useState<JSX.Element>(<Description task={task} updateTask={updateTask}/>);

    function handleChangeType(type : TypeOfInfo) {
        switch (type) {
            case TypeOfInfo.notes:
                setActualInfo(<Notes task={task}/>);
                setActualInfoType(TypeOfInfo.notes);
                break;
            case TypeOfInfo.settings: 
                setActualInfo(<Settings task={task}/>)
                setActualInfoType(TypeOfInfo.settings);
                break;
            default:
                setActualInfo(<Description task={task} updateTask={updateTask}/>);
                setActualInfoType(TypeOfInfo.description);
        }
    }


    return (
        <section className='col-span-2 border-r border-neutral-400 h-[28rem] relative'>
            <menu className='flex w-full border-b border-neutral-400'>
                {
                    menuItems.map((type) => (
                        <MenuItem key={type} name={type} actualType={actualTypeInfo} onClick={() => handleChangeType(type)}></MenuItem>
                    ))
                }
            </menu>
            <div className="relative h-[25rem] overflow-y-auto">
                {actualInfo}
            </div>
        </section>
    )
}

function MenuItem({ name, actualType, onClick } : { name : string, actualType : TypeOfInfo, onClick : () => void}) {
    var bg : string = "bg-neutral-200";
    if (actualType == name) {
        bg = "bg-neutral-100";
    }
    return (
        <li className={`relative  ${bg}`}>
            <button onClick={onClick} className="hover:text-purple-600 px-4 py-2" >{name}</button>
        </li>
    )
}

function Description({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    var desc = "Create a description for better understending of the task";
    if (task.description) {
        desc = task.description; 
    } 
    const [ isEditing, toggleEdit ] = useReducer(isEditing => !isEditing, false);
    const [ editDesc, setEditDesc ] = useState<string>(desc);
    
    function handleSubmit() {
        if (editDesc != "") {
            task.description = editDesc;
            updateTask(task);
            toggleEdit();
        } 
    }

    function handleChange(event : ChangeEvent<HTMLTextAreaElement>) {
        setEditDesc(event.target.value);
    }
    
    desc = editDesc;
    return (
        <article className='m-4 space-y-4'>
            <ButtonSideText text={"Edit Description"} image={"/pencil.svg"} onClick={toggleEdit}/>
            {
                isEditing ? 
                    <div className="space-y-2">
                        <textarea defaultValue={desc} onChange={handleChange} className="bg-neutral-100 w-full h-64 outline-none rounded focus:ring-1 focus:ring-violet-500 px-3 py-1"/>
                        <div className="flex flex-row-reverse">   
                            <button className="btn-primary relative right-0 bottom-0" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                    :
                    <div>
                        <p className='px-3 py-1 bg-neutral-100 rounded ' style={{ whiteSpace: 'pre-line' }}>
                            {desc}
                        </p>   
                    </div>

            }
        </article>
    )
}

// display all attached nodes for this task
function Notes({ task } : { task : Task }) {
    const [ notes, setNotes ] = useState<NodeInfo[]>([]); 
    const [ isCreating, toggleCreating ]= useReducer(isCreating => !isCreating, false); 
    const { submitError } = useContext(TaskInfoContext)!;

    async function fetchNotes() {
        try {
            const res = await fetch(`/api/nodes/task/${task.id}`, {
                method: "GET",

            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            console.log(data);
            setNotes(data.nodes);
        }
        catch(error) {
            console.error(error);
            submitError(error, fetchNotes);
        }
    }

    async function deleteNote(id : string) {
        try {
            const res = await fetch(`/api/nodes/${id}/delete`, {
                method: "POST"
            })
            
            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.error);
            }
            const newNotes : NodeInfo[] = [];
            for (let note of notes) {
                if (note.id != id) {
                    newNotes.push(note);
                }
            }
            setNotes(newNotes);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => deleteNote(id));
        }
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    function onCreate() {
        toggleCreating();
        fetchNotes();
    }

    if (isCreating) {
        return (
            <div className="m-4 space-y-4">
                <ButtonSideText text={"Create new Note"} image={"/plus.svg"} onClick={toggleCreating}/>
                <NoteCreator onCreate={onCreate} head={false} taskId={task.id}/>
            </div>
        )
    }

    return (
        <div className="m-4 space-y-4">
            <ButtonSideText text={"Create new Note"} image={"/plus.svg"} onClick={toggleCreating}/>
            <ul className=" grid auto-cols-fr gap-2">
                {
                    notes.map((note) => (
                        <NoteComponent key={note.id} note={note} deleteNote={deleteNote} colorMode={100}/>
                    ))
                }
            </ul>  
        </div>   
            
    )
}


// display settings of solvers and team selector
function Settings({ task } : { task : Task }) {
    const { team, solvers } = useContext(TaskInfoContext)!;   

    return (
        <div className="flex gap-4 p-4 relative h-full">
            <div className="w-1/2 space-y-2">
                <TeamSelector task={task} team={team} />
            </div>
            <div className="w-1/2 space-y-2">
                <UserSelector task={task} solvers={solvers} team={team}/>
            </div>
        </div>
    )
}

// type for selection item in selector
type SelectionItem = {
    id: string,
    name: string,
    image?: string | null,
    load?: number,
    team?: string | null,
    teamColor?: string | null,
    selected: boolean
}

// selector fo teams (only one can be selected)
function TeamSelector({ task, team } : { task : Task, team : TeamInfo | null }) {
    const [ teams, setTeams ] = useState<TeamInfo[]>([]);
    const { changeTeam, submitError } = useContext(TaskInfoContext)!; 
    const [ intialLoading, setInitialLoading] = useState<boolean>(false);

    async function fetchTeams(isInitialLoading : boolean) {
        if (isInitialLoading) {
            setInitialLoading(true);
        }
        
        try {
            const res = await fetch(`/api/projects/${task.projectId}/team`, {
                method: "GET"
            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            setTeams(data.teams);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchTeams(true));
        }
        finally {
            setInitialLoading(false);
        }
    }

    function handleSelect(item : SelectionItem) {
        const newTeam = teams.find((team) => team.id == item.id); 
        if (newTeam) {
            changeTeam(newTeam);
        }
    }

    useEffect(() => {
        fetchTeams(true);
    }, [team])

    return (
        <>
            <h4>Teams</h4>
            <ul className="bg-neutral-100 rounded w-full h-[21rem] p-1 space-y-1 overflow-y-auto">
                { intialLoading ?
                    <InitialLoader/>
                    :
                    <Selector 
                        items={teams.map(s => ({
                            id: s.id,
                            name: s.name,
                            selected: s.id === team?.id,
                            load: s.taskLoad
                        }))} 
                        handleSelect={handleSelect}
                    />
                }
            </ul>
        </>
    )
}

// selctor of members of project
function UserSelector({ task, team, solvers } : { task : Task, team : TeamInfo | null, solvers : Solver[] }) {
    const [ isAll, toggleAll ] = useReducer(isAll => !isAll, true); 
    const [ members, setMembers ] = useState<MemberTableInfo[]>([]); 
    const { changeSolvers, submitError } = useContext(TaskInfoContext)!;
    const [ intialLoading, setInitialLoading] = useState<boolean>(false);

    async function fetchMembers(isInitialLoading : boolean) {
        if (isInitialLoading) {
            setInitialLoading(true);
        }
        
        try {
            const res = await fetch(`/api/projects/${task.projectId}/members`, {
                method: "GET"
            })

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error);
            }
            //console.log(data.data);
            setMembers(data.data);
        }
        catch (error) {
            console.error(error);
            submitError(error, () => fetchMembers(true));
        }
        finally {
            setInitialLoading(false);
        }
    }



    function handleSelect(item : SelectionItem) {
        const member : MemberTableInfo | undefined = members.find((mem) => mem.memberId == item.id);
        if (!member) return; 
        const isThere = solvers.some((sol) => sol.memberId == member.memberId);
        if (isThere) {
            changeSolvers(SolverFuncs.Remove, member.memberId);
        } else {
            changeSolvers(SolverFuncs.Add, member.memberId);
        }
    }

    useEffect(() => {
        fetchMembers(true);
    }, [solvers]);

    const selectItems: SelectionItem[] = members
        .filter(member => isAll || (team && member.teamId === team.id))
        .map(member => {
            const isSelected = solvers.some(solver => solver.memberId === member.memberId);
            return {
                id: member.memberId,
                name: `${member.name} ${member.surname}`,
                image: member.image,
                selected: isSelected,
                team: member.teamName,
                teamColor: member.teamColor,
                load: member.tasksLoad
            };
        });


    return (
        <>
            <div className="flex justify-between">
                <h4>Solvers</h4>
                <button onClick={toggleAll} className="border border-violet-600 rounded px-2 text-violet-600 hover:bg-opacity-40 hover:bg-violet-600 ">{isAll ? "Team" : "All"}</button>
            </div>
            <ul className="bg-neutral-100 rounded w-full h-[21rem] p-1 space-y-2 overflow-y-auto">
                { intialLoading ?
                    <InitialLoader/>
                    :
                    
                        <Selector items={selectItems} team={true} handleSelect={handleSelect}/>
                    
                }
            </ul>
        </>
    )
}


// selector component
function Selector({ items, team = false, handleSelect } : { items : SelectionItem[], team? : boolean, handleSelect : (item : SelectionItem) => void }) {
    return (
        <>
            {
                items.map((item) => { 
                    const isImage = item.image != undefined;
                    const pathToImage = item.image ? `/uploads/user/${item.image}` : `/avatar.svg`;
                    return (
                        <li key={item.id} onClick={() => handleSelect(item)} className={`cursor-pointer bg-neutral-200 rounded p-1 flex items-center gap-2 ${item.selected && "outline outline-2 outline-green-500"}`}>
                            { isImage && <Image alt="Image" src={pathToImage} width={20} height={20} title={item.name} className="w-6 h-6 rounded-full bg-neutral-300 object-cover"></Image>}
                            <div>{item.name}</div>
                            { team && <div className="text-sm flex gap-2"><span className="text-neutral-600 ">team:</span> <TeamBadge name={item.team ?? ""} color={item.teamColor ?? "#7c3aed"}/></div>}
                            <div className="text-sm"><span className="text-sm text-neutral-600">load:</span> {item.load}</div>
                        </li>
                    )
                }) 
            }
        </>
    )
}

// DATA INFORMATIONS

enum Colors {
    Green = "#16a34a",
    Yellow = "#eab308",
    Red = "#dc2626",
}

type SelectType = {
    name : string
}

// display data about task (priority, complexity, ...) and handle change of it
function Data({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    const [isEditing, toggleEditing] = useReducer(isEditing => !isEditing, false);
    const [editedTask, setEditedTask] = useState<Task>(task);

    function changeMode() {
        
        if (isEditing) {
            //console.log(editedTask);
            updateTask(editedTask);
        }
        toggleEditing();
    }

    function updateVal(name : string, newVal : any) {
        if (name == "estimatedHours" && typeof newVal == "string") {
            newVal = parseInt(newVal);
        }
        setEditedTask(editedTask => ({ ...editedTask, [name]: newVal }));
    }

    const buttons : Button[] = [
        {
            onClick: changeMode, type: ButtonType.Creative, size: 6, padding: 0, lightness: Lighteness.Bright, title: "Sumbit", img: "/check.svg"
        }
    ]

    return (
        <div>
            <div className="flex justify-between">
                <div className=" flex gap-4">
                    <h3 className='font-bold mb-2'>Info</h3>
                    <button onClick={changeMode} className="h-fit" title="Edit Info"><img src="/pencil.svg" alt="Edit Info" className="w-5 h-5"/></button>
                </div>
                { isEditing && <ArrayButtons buttons={buttons} gap={0}/> }
            </div>
            <ul className='bg-neutral-100 p-2 rounded w-full flex flex-col gap-2'>
                <DataItem name="type" value={task.type} isEditing={isEditing} updateVal={(newVal : any) => updateVal("type", newVal)}></DataItem>
                <DataItem name="priority" value={task.priority} isEditing={isEditing} updateVal={(newVal : any) => updateVal("priority", newVal)}></DataItem>
                <DataItem name="complexity" value={task.complexity} isEditing={isEditing} updateVal={(newVal : any) => updateVal("complexity", newVal)}></DataItem>
                <DataItem name="estimated hours" value={task.estimatedHours} isEditing={isEditing}  updateVal={(newVal : any) => updateVal("estimatedHours", newVal)}></DataItem>
            </ul>
        </div>
    )
}



// display atomic data about task
function DataItem({name, value, isEditing, updateVal } : { name: string, value : any, isEditing : boolean, updateVal : (newVal : any) => void}) {
    var displaydVal : any = "undefined";
    if (value) {
        displaydVal = value;
    } 
    var textColor = "";
    var editElement : JSX.Element = <DataEditInput name={name} value={value} changeVal={(newValue : any) => updateVal(newValue)}/>;
    if (name == "complexity" || name == "priority") {
        switch (value) {
            case Ranking.high:
                textColor = Colors.Red;
                break;
            case Ranking.medium:
                textColor = Colors.Yellow;
                break;
            case Ranking.low:
                textColor = Colors.Green;
                break;
        }

        const select : SelectType[] = [
            { name: Ranking.high },
            { name: Ranking.medium },
            { name: Ranking.low }
        ]
        editElement = <SelectButtons items={select} value={value} changeVal={(newValue : string) => updateVal(newValue)}/>;
    }  
    return (
        <li className='grid grid-cols-2 gap-2'>
            <span>{name}:</span>
            {
                isEditing ?
                    <>{editElement}</>
                    :
                    <span style={{ color:textColor }}>{displaydVal}</span>
            }
        </li>
    )
}


function SelectButtons({ items, value, changeVal } : { items : SelectType[], value : string | null, changeVal : (newValue : string) => void}) {
    const [ selected, setSelected ] = useState<string | null>(value); 
    function select(value : string) {
        setSelected(value);
        changeVal(value);
    }

    return (
        <ul className="flex gap-1 "> 
            {
                items.map(item => (
                    <li key={item.name} id={item.name}>
                        <button 
                            className={`btn btn-primary ${selected  == item.name ? "bg-violet-600 text-neutral-950" : ""} text-xs px-1 py-0.5`} 
                            onClick={() => select(item.name)}
                        >
                            {item.name}
                        </button>
                    </li>
                ))
            }
        </ul>
    )
}

function DataEditInput({ value, name, changeVal } : { value : string, name : string, changeVal : (newVal : any) => void }) {
    const type = name === "estimated hours" ? "number" : "text";
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        changeVal(event.target.value);
    }
    return (
        <input type={type} defaultValue={value} min={"0"} className="bg-neutral-100 outline-none border-b" onChange={handleChange}></input>
    )
}



function Solvers({ solvers, team} : { solvers : Solver[], team : TeamInfo | null }) {
    return (
        <div className="space-y-2">
            <div>
                <div className="flex gap-2">
                    <h3 className='font-bold mb-2'>Solvers</h3>
                </div>
                <div className="flex gap-2">
                    <div>team:</div>{ team && <TeamBadge name={team.name} color={team.color}/> }
                </div>
            </div>
            <ul className="space-y-2 h-44 overflow-y-auto">
                {solvers.map((solver) => {
                    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
                    return (
                        <li key={solver.id} className='bg-neutral-100 p-2 rounded w-full flex flex-row gap-1 relative items-center'>
                            <Image src={imgSrc} alt="picture" width={50} height={50} className='w-8 h-8 rounded-full bg-neutral-400 mr-2 text-color cursor-pointe object-cover'></Image>
                            <div className="">{solver.name} {solver.surname}</div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
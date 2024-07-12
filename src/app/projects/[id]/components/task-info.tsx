"use client"

import { useEffect, useReducer, useState, KeyboardEvent, ChangeEvent, createContext, useContext } from "react";
import Image from 'next/image' 
import { Issue, Tag, Task, Ranking, Team, ProjectMember } from "@prisma/client";
import { Dialog, DialogClose } from "@/app/components/dialog";
import { Solver } from "@/app/api/projects/[id]/task/[taskId]/[func]/route";
import { Name } from "./other-client";
import { TagList } from "./tags";
import { BoardsTypes } from "@/app/api/projects/[id]/[board]/board";
import { MemberTableInfo } from "@/app/api/projects/[id]/members/route";
import { Oval } from "react-loader-spinner";

enum SolverFuncs {
    Add = "add",
    Remove = "Remove"
}

interface TaskInfoContextTypes {
    task : Task,
    team : Team | null,
    solvers: Solver[],
    changeTeam: (team : Team ) => void,
    changeSolvers: (funcs : SolverFuncs, memberId : string) => void
}

const TaskInfoContext = createContext<TaskInfoContextTypes | null>(null);

// TODO: Error handeling + loading screen
// dialog for display info and editing it
export function TaskInfo({ id, projectId, handleClose, submitTask } : { id : string, projectId : string, handleClose : () => void, submitTask : (task : Task) => void}) {
    const [ task, setTask ] = useState<Task | null>(null);
    const [ tags, setTags ] = useState<Tag[]>([]);
    const [ solvers, setSolvers ] = useState<Solver[]>([]); 
    const [ team, setTeam ] = useState<Team | null>(null); 
    const [ error, setError] = useState<boolean>(false);

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
            setTags(data.taskInfo.tags);
        }
        catch (error) {
            console.error(error);
            setError(true);
        }
    }

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
                console.error(data.error);
                return;
            }

            setSolvers(data.solvers);
        }
        catch (error) {
            console.error(error);
        }
    }

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
                console.error(data.error);
                return;
            }
            fetchSolvers();
        }
        catch (error) {
            console.error(error);
        }
        
    }

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
                console.error(data.error);
                return;
            }
            fetchSolvers();
        }
        catch (error) {
            console.error(error);
        }
    }

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
                console.error(data.error);
            }
            //console.log(data);
            setTeam(data.team);
        }
        catch (error) {
            console.error(error);
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

    function changeTeam(team : Team) {
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
                    <TaskInfoContext.Provider value={{task, team, solvers, changeTeam, changeSolvers}}>
                        <HeaderContainer task={task} tags={tags} projectId={projectId} handleClose={() => updateAndClose(task)} updateTask={updateTask}/>
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
                        <Oval
                            visible={true}
                            height="80"
                            width="80"
                            color={"#e5e5e5"}
                            ariaLabel="oval-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                        <DialogClose handleClose={handleClose}/>
                    </div>
                }
            </div>
        </Dialog>
    ) 
}  

// HEADER PART //
function HeaderContainer(
    {task, tags, projectId, handleClose, updateTask } : 
    {task : Task, projectId : string,  tags : Tag[], handleClose : () => void, updateTask : (task : Task) => void}) { 
    function updateName(name : string) {
        task.name = name;
        updateTask(task);
    }

    return (
        <section className='px-6 py-4 border-b border-neutral-400 relative '>
            <Name name={task.name} updateName={updateName}/>
            <TagList tags={tags} projectId={projectId}/>
            <DialogClose handleClose={handleClose}/>
        </section>
    )
}

// MAIN INFRMATIONS

enum TypeOfInfo {
    description = "Description",
    issues = "Issues",
    nodes = "Nodes",
    settings = "Settings"
}

function MainInfoContainer({ task, updateTask } : { task : Task, updateTask : (task : Task) => void }) {
    const menuItems : TypeOfInfo[] = [TypeOfInfo.description, /*TypeOfInfo.issues,*/ TypeOfInfo.nodes, TypeOfInfo.settings];
    const [actualTypeInfo, setActualInfoType] = useState<TypeOfInfo>(TypeOfInfo.description);
    const [actualInfo, setActualInfo] = useState<JSX.Element>(<Description task={task} updateTask={updateTask}/>);

    function handleChangeType(type : TypeOfInfo) {
        switch (type) {
            case TypeOfInfo.issues:
                setActualInfo(<Issues issues={[]}/>);
                setActualInfoType(TypeOfInfo.issues);
                break;
            case TypeOfInfo.nodes:
                setActualInfo(<Nodes/>);
                setActualInfoType(TypeOfInfo.nodes);
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
            <div className="relative h-[25rem]">
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
    /*function handleDesc(event : KeyboardEvent<HTMLTextAreaElement>) {
        const inputValue = event.currentTarget.value;
        if (event.key == 'Enter') {
            if (inputValue.length > 0) {
                task.description = inputValue;
                updateTask(task);
                toggleEdit();
            }
        }
    }*/
    
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
            <button onClick={toggleEdit} className={`w-fit h-fit flex gap-2 items-center hover:text-neutral-950 text-neutral-600 `}>
                <img src="/pencil.svg" alt="Edit Description" className={`rounded w-7 h-7 ${isEditing ? "bg-violet-600" : "bg-neutral-100"} p-1`}/>
                <div>Edit Description</div>
            </button>
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
                        <p className='px-3 py-1 bg-neutral-100 rounded '>
                            {desc}
                        </p>   
                    </div>

            }
        </article>
    )
}

function Issues({ issues } : { issues : Issue[] }) {
    const [isCreating, toggleCreating] = useReducer(isCreating => !isCreating, false); 
    return (
        <div>
            <div className="flex flex-row gap-4">
                <button className="bg-neutral-100 rounded" onClick={toggleCreating}>
                    <img src="plus.svg" alt="create"/>
                </button>
                <div>Create new Issue</div>
            </div>
            <ul>
                {
                    issues.map(issue => (
                        <IsssuesItem key={issue.id} issue={issue}/>
                    ))
                }
            </ul>
        </div>
    )
}

function IsssuesItem({ issue } : { issue : Issue }) {
    return ( 
        <li key={issue.id}>
            {issue.name}
        </li>
    )
}

function Nodes() {
    return (
        <>
        </>
    )
}

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

type SelectionItem = {
    id: string,
    name: string,
    image?: string | null,
    load?: number,
    team?: string | null,
    selected: boolean
}

function TeamSelector({ task, team } : { task : Task, team : Team | null }) {
    const [ teams, setTeams ] = useState<Team[]>([]);
    const { changeTeam } = useContext(TaskInfoContext)!; 

    async function fetchTeams() {
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
        }
    }

    function handleSelect(item : SelectionItem) {
        const newTeam = teams.find((team) => team.id == item.id); 
        if (newTeam) {
            changeTeam(newTeam);
        }
    }

    useEffect(() => {
        fetchTeams();
    }, [team])

    return (
        <>
            <h4>Teams</h4>
            <ul className="bg-neutral-100 rounded w-full h-[21rem] p-1 space-y-1">
                <Selector 
                    items={teams.map(s => ({
                        id: s.id,
                        name: s.name,
                        selected: s.id === team?.id
                    }))} 
                    handleSelect={handleSelect}
                />
            </ul>
        </>
    )
}

function UserSelector({ task, team, solvers } : { task : Task, team : Team | null, solvers : Solver[] }) {
    const [ isAll, toggleAll ] = useReducer(isAll => !isAll, true); 
    const [ members, setMembers ] = useState<MemberTableInfo[]>([]); 
    const { changeSolvers } = useContext(TaskInfoContext)!;

    async function fetchMembers() {
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
        fetchMembers();
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
                load: member.tasksLoad
            };
        });


    return (
        <>
            <div className="flex justify-between">
                <h4>Solvers</h4>
                <button onClick={toggleAll} className="border border-violet-600 rounded px-2 text-violet-600 hover:bg-opacity-40 hover:bg-violet-600 ">{isAll ? "Team" : "All"}</button>
            </div>
            <ul className="bg-neutral-100 rounded w-full h-[21rem] p-1 space-y-2">
                <Selector items={selectItems} team={true} handleSelect={handleSelect}/>
            </ul>
        </>
    )
}



function Selector({ items, team = false, handleSelect } : { items : SelectionItem[], team? : boolean, handleSelect : (item : SelectionItem) => void }) {
    return (
        <>
            {
                items.map((item) => { 
                    const isImage = item.image != null || item.image != undefined;
                    const pathToImage = item.image ? `/uploads/user/${item.image}` : "/avatar.svg";
                    return (
                        <li key={item.id} onClick={() => handleSelect(item)} className={`cursor-pointer bg-neutral-200 rounded p-1 flex items-center gap-2 ${item.selected && "outline outline-2 outline-green-500"}`}>
                            { isImage && <Image alt="Image" src={pathToImage} width={20} height={20} title={item.name} className="rounded-full bg-neutral-300"></Image>}
                            <div>{item.name}</div>
                            { team && <div className="text-sm"><span className="text-neutral-600 ">team:</span> <span className="bg-violet-600 bg-opacity-40 rounded border border-violet-600 text-violet-600 px-1">{item.team}</span></div>}
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
    Green = "green",
    Yellow = "yellow",
    Red = "red",
}

type SelectType = {
    name : string
}


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

    return (
        <div>
            <div className="flex gap-4">
                <h3 className='font-bold mb-2'>Info</h3>
                <button onClick={changeMode} className="h-fit" title="Edit Info"><img src="/pencil.svg" alt="Edit Info" className="w-5 h-5"/></button>
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
        <ul className="flex gap-1"> 
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



function Solvers({ solvers, team} : { solvers : Solver[], team : Team | null }) {

    //<button onClick={fetchSolvers} className="h-fit" title="Edit solvers"><img src="/pencil.svg" alt="Edit Info" className="w-5 h-5"/></button>
    return (
        <div className="space-y-2">
            <div>
                <div className="flex gap-2">
                    <h3 className='font-bold mb-2'>Solvers</h3>
                </div>
                <div className="flex gap-2">
                    <dt>team:</dt><dd>{team?.name}</dd>
                </div>
            </div>
            <ul className="space-y-2">
                {solvers.map((solver) => {
                    const imgSrc = solver.image ? `/uploads/user/${solver.image}` : "/avatar.svg";
                    return (
                        <li key={solver.id} className='bg-neutral-100 p-2 rounded w-full flex flex-row gap-1 relative items-center'>
                            <Image src={imgSrc} alt="avater" width={15} height={15} className='w-8 h-8 rounded-full bg-neutral-400 mr-2 text-color cursor-pointer'></Image>
                            <div className="bg-">{solver.name} {solver.surname}</div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
import { FilterButton, SearchInput } from "../components/filter-tables";
import { CreateTaskButton, Head } from "../components/other";

export default function Backlog() {
    return (
        <div className="w-2/3 mx-auto">
            <Head text="Backlog"/>
            <section className='flex gap-4 mb-4 w-fit h-fit items-end'>
                <SearchInput/>
                <FilterButton/>
            </section>
            <ListOfGroups/>
        </div>
        
    )
}

function GroupCreate() {
    return (
        <button className="flex gap-2 items-center mb-2 text-neutral-400">
            <img src="/plus.svg" className="w-8 h-8 bg-neutral-950 rounded"/>
            <div>Create new group</div>
        </button>
    )
}

function ListOfGroups() {
    return (
        <section className="w-full">
            <GroupCreate/>
            <ul className="space-y-4 w-full">
                <GroupList/>
                <GroupList/>
                <GroupList/>
            </ul>
        </section>
    )
}

function GroupList() {
    function createTask() {

    }

    return (
        <li className="bg-neutral-950 w-full rounded p-2 space-y-2">
            <h2>Name Of Group</h2>
            <ul className="space-y-2">
                <GroupTask/>
            </ul>
            <CreateTaskButton createTask={createTask}/>
        </li> 
    )
}

function CreateTask() {
    return (
        <div>
            <button></button>
        </div>
    )
}

function GroupTask() {
    return (
        <li className="bg-neutral-900 w-full p-2 rounded">
            <h3>tohle je dokonala taska</h3>
        </li>
    )
}
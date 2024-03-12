import { prisma } from "@/db";
import { Task } from "@prisma/client";


export async function getColumnsTasks(columnId : string) : Promise<Task[]> {
    const tasks : Task[] = await prisma.task.findMany({
        where: {
            taskColumnId: columnId
        }
    })
    return tasks;
}

export async function saveTasks(tasks : Task[]) {
    for (const task of tasks) {
        await prisma.task.update({
            where: {
                id: task.id,
            },
            data: {
                colIndex: task.colIndex
            }
        })
    }
}
//TODO: bugs
//TODO: pro vice sloupcu
export async function movInColumnIndexes(columnId : string, uTask : Task, index : number) {
    const tasks : Task[] = await getColumnsTasks(columnId);
    if (!uTask.colIndex) {
        uTask.colIndex = 99999999999;
    }
    const updateTasks : Task[] = [];
    for (const task of tasks) {
        if (task.colIndex != null && task.id != uTask.id) {
            if (task.colIndex >= index) {
                if (uTask.colIndex < task.colIndex) {
                    continue;
                }
                task.colIndex++;
                updateTasks.push(task);
            } 
            else if (task.colIndex <= index) {
                if ( uTask.colIndex > task.colIndex) {
                    continue;
                }
                task.colIndex--;
                updateTasks.push(task);
            }
        }
    }
    await saveTasks(updateTasks);
}

export async function movAwayColumnIndexes(columnId : string, uTask : Task) {
    const tasks : Task[] = await getColumnsTasks(columnId);
    if (!uTask.colIndex) {
        return;
    }
    const updateTasks : Task[] = [];
    for (const task of tasks) {
        if (task.colIndex != null && task.id != uTask.id) {
            if (task.colIndex > uTask.colIndex) {
                task.colIndex--;
                updateTasks.push(task);
            }
        }
    }
    await saveTasks(updateTasks);
}

export async function movToColumnIndexes(columnId : string, uTask : Task, index : number) {
    const tasks : Task[] = await getColumnsTasks(columnId);
    const updateTasks : Task[] = [];
    for (const task of tasks) {
        if (task.colIndex != null && task.id != uTask.id) {
            if (task.colIndex >= index) {
                task.colIndex++;
                updateTasks.push(task);
            } 
        }
    }
    await saveTasks(updateTasks);
}




function sortTaskByColIndex(task1 : Task, task2 : Task) : number {
    if (!task1.colIndex && !task2.colIndex) return 0; // obě hodnoty jsou null, vrátíme nulu
    if (!task1.colIndex) return 1; // task1 má null colIndex, takže ho umístíme za task2  
    if (!task2.colIndex) return -1; // task2 má null colIndex, takže ho umístíme za task2
    return task2.colIndex - task1.colIndex;
}

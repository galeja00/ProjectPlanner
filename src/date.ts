export function convertDateToArray(date : Date) : number[] {
    // [day, mouth, fullyear]
    const result : number[] = new Array(3);
    result[0] = date.getDate();
    result[1] = date.getMonth();
    result[2] = date.getFullYear(); 
    return result;
} 

export function isEarlierDate(compDate : Date, date : Date) {
    const compArr : number[] = convertDateToArray(compDate);
    const dateArr : number[] = convertDateToArray(date);
    for (let i = 3; i >= 0; i--) {
        if (i == 0 && compArr[i] == dateArr[i]) return false;
        if (compArr[i] > dateArr[i]) return true;
        else if (compArr[i] < dateArr[i]) return false;
    }
    return true
}

export function isLaterDate(compDate : Date, date : Date) {
    const compArr : number[] = convertDateToArray(compDate);
    const dateArr : number[] = convertDateToArray(date);
    for (let i = 3; i >= 0; i--) {
        if (i == 0 && compArr[i] == dateArr[i]) return false;
        if (compArr[i] < dateArr[i]) return true;
        else if (compArr[i] > dateArr[i]) return false;
    }
    return true
}

export function isBetweenDates(start : Date, end : Date, between : Date) : boolean {
    return isEarlierDate(end, between) && isLaterDate(start, between);
}

export function getCurrentDiffInDays(start : Date, current : Date) {
    return Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 ))
}
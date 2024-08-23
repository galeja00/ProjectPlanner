
// covert Date type tu arra of numbers [ day, mounth, year ]
export function convertDateToArray(date : Date) : number[] {
    // [day, mouth, fullyear]
    const result : number[] = new Array(3);
    result[0] = date.getDate();
    result[1] = date.getMonth();
    result[2] = date.getFullYear(); 
    return result;
} 

// compere two date dates and try to find out if date is earlier then compDate
export function isEarlierDate(compDate : Date, date : Date) : boolean {
    const compArr : number[] = convertDateToArray(compDate);
    const dateArr : number[] = convertDateToArray(date);
    for (let i = 3; i >= 0; i--) {
        if (i == 0 && compArr[i] == dateArr[i]) return false;
        if (compArr[i] > dateArr[i]) return true;
        else if (compArr[i] < dateArr[i]) return false;
    }
    return true;
}

// compare two dates and try to find out if date is later then compDate
export function isLaterDate(compDate : Date, date : Date) : boolean {
    const compArr : number[] = convertDateToArray(compDate);
    const dateArr : number[] = convertDateToArray(date);
    for (let i = 3; i >= 0; i--) {
        if (i == 0 && compArr[i] == dateArr[i]) return false;
        if (compArr[i] < dateArr[i]) return true;
        else if (compArr[i] > dateArr[i]) return false;
    }
    return true;
}

// find out if date is between dates
export function isBetweenDates(start : Date, end : Date, between : Date) : boolean {
    return isEarlierDate(end, between) && isLaterDate(start, between);
}

// get different between two dates and return it in number of days
export function getDiffInDays(start : Date, end : Date) : number {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 ));
}

// convert millisecunds to days
export function fromDayToMills(day : number) : number {
    return day * (1000 * 60 * 60 * 24);
}

// forma date to = MM.DD.YYYY
export function formatDate(date : Date) : string {
    let formatedDate = "";
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    formatedDate = `${month < 10 ? '0' : ''}${month}.${day < 10 ? '0' : ''}${day}.${year}`;
    return formatedDate;
}

// format date to = YYYY-MM-DD
export function formatDate2(date : Date) : string{
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// format date from millisecunds past number to string
export function formatAgo(time: number): string {
    const units = ['sec', 'min', 'h', 'd', 'w', 'm', 'y'];
    const conversions = [60, 60, 24, 7, 4.35, 12]; // convert rates to sec, min, hours, days, weeks, months, years
    let unitIndex = 0;

    while (time >= conversions[unitIndex] && unitIndex < units.length - 1) {
        time /= conversions[unitIndex];
        unitIndex++;
    }

    time = Math.round(time);
    console.log(time);
    return `${time} ${units[unitIndex]}`;
}